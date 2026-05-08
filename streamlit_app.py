from __future__ import annotations

import base64
import hashlib
import io
import json
import math
import os
import re
import shutil
import sqlite3
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import fitz
import numpy as np
import streamlit as st
import streamlit.components.v1 as components
from PIL import Image, ImageFilter, ImageGrab, ImageOps
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    import pytesseract
except ImportError:  # OCR remains optional so the app can still be used manually.
    pytesseract = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_types = None


APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "problem_search_data"
UPLOAD_DIR = DATA_DIR / "uploads"
PAGE_DIR = DATA_DIR / "pages"
CROP_DIR = DATA_DIR / "crops"
CANDIDATE_DIR = DATA_DIR / "candidates"
SOLUTION_DIR = DATA_DIR / "solutions"
TESSDATA_DIR = DATA_DIR / "tessdata"
DB_PATH = DATA_DIR / "problems.sqlite3"
PASTE_COMPONENT_DIR = APP_DIR / "paste_image_component" / "frontend"

for directory in (DATA_DIR, UPLOAD_DIR, PAGE_DIR, CROP_DIR, CANDIDATE_DIR, SOLUTION_DIR, TESSDATA_DIR):
    directory.mkdir(parents=True, exist_ok=True)


TESSERACT_PATHS = [
    Path("C:/Program Files/Tesseract-OCR/tesseract.exe"),
    Path("C:/Program Files (x86)/Tesseract-OCR/tesseract.exe"),
]

_paste_component = components.declare_component("paste_image_area", path=str(PASTE_COMPONENT_DIR))


CHAPTER_KEYWORDS = {
    "미분": ["미분", "도함수", "접선", "극값", "최대", "최소", "증가", "감소", "역함수"],
    "적분": ["적분", "정적분", "부정적분", "부분적분", "치환적분", "넓이", "부피"],
    "급수": ["급수", "수렴", "발산", "비교판정", "비판정", "근판정", "테일러", "멱급수"],
    "선형대수": ["행렬", "고유값", "고유벡터", "행렬식", "rank", "계수", "선형독립"],
    "다변수": ["편미분", "그래디언트", "라그랑주", "중적분", "야코비안", "곡면"],
    "미분방정식": ["미분방정식", "일반해", "특수해", "초기값", "라플라스"],
}

METHOD_KEYWORDS = {
    "부분적분": ["부분적분", "x e^", "x sin", "x cos", "다항함수", "지수함수의 곱"],
    "치환적분": ["치환", "u=", "합성함수", "sqrt", "루트"],
    "역함수 미분": ["역함수", "inverse", "f^{-1}", "dy/dx"],
    "고유값": ["고유값", "고유벡터", "characteristic", "det", "lambda"],
    "수렴 판정": ["수렴", "발산", "비교판정", "비판정", "근판정", "교대급수"],
    "로피탈": ["로피탈", "극한", "0/0", "무한대/무한대"],
}

FORMULA_PATTERNS = {
    "integral": r"∫|\\int|적분",
    "derivative": r"dy/dx|d/dx|f'|도함수|미분",
    "matrix": r"\[.*\]|행렬|det|고유값|lambda|λ",
    "series": r"∑|\\sum|급수|수렴|발산",
    "limit": r"lim|극한",
}

DIFFICULTY_OPTIONS = [
    "",
    "Lv.1 개념 확인",
    "Lv.2 기본 계산",
    "Lv.3 대표 유형",
    "Lv.4 응용 문제",
    "Lv.5 고난도 / 킬러 문제",
]

TAXONOMY = {
    "미분학": {
        "함수": ["함수 합성", "역함수"],
        "극한과 연속": ["극한 계산", "연속성 판정"],
        "미분": ["미분계수 정의", "도함수 계산"],
        "접선의 방정식": ["접선 방정식"],
        "평균값의 정리 및 로피탈 정리": ["로피탈 정리"],
        "Taylor급수": ["Taylor 전개"],
        "곡선의 개형": ["그래프 개형"],
        "최대/최소": ["최대최소"],
        "순간변화율": [],
        "추가내용": [],
    },
    "적분학": {
        "부정적분": ["부정적분", "치환적분", "부분적분", "삼각치환"],
        "정적분의 계산": ["정적분 계산"],
        "정적분과 무한급수": [],
        "정적분의 성질": [],
        "특이적분": ["특이적분"],
        "Maclaurin급수의 응용": ["Maclaurin급수"],
        "정적분의 응용": ["넓이", "부피"],
        "극좌표와 응용": ["극좌표"],
    },
    "선형대수": {
        "행렬": ["행렬식", "역행렬", "rank"],
        "벡터와 공간도형": [],
        "벡터공간": [],
        "고유치와 대각화": ["고유치", "대각화"],
        "선형사상": ["선형변환"],
        "추가내용": [],
    },
    "다변수함수": {
        "편도함수": ["편미분"],
        "경도 및 방향도함수": ["방향도함수"],
        "곡선과 곡면": [],
        "Taylor급수와 최대/최소": ["다변수 Taylor", "최대최소"],
        "중적분": ["중적분"],
        "체적과 곡면적": ["곡면적"],
        "삼중적분과 극좌표계": ["삼중적분", "극좌표"],
        "무한급수": [],
        "추가내용": [],
    },
    "공학수학 I": {
        "벡터 해석학": [],
        "복소수": [],
        "미분방정식": ["1계 미분방정식", "2계 미분방정식"],
        "Laplace변환": ["Laplace 변환", "Laplace 역변환"],
        "Fourier급수": ["Fourier 급수"],
    },
}

CLASSIFICATION_RULES = [
    ("미분학", "극한과 연속", "극한 계산", ["lim", "극한", "수렴값"], ["극한 계산"]),
    ("미분학", "극한과 연속", "연속성 판정", ["연속", "불연속"], ["연속성 판정"]),
    ("미분학", "평균값의 정리 및 로피탈 정리", "로피탈 정리", ["로피탈", "0/0", "∞/∞"], ["로피탈 정리"]),
    ("미분학", "Taylor급수", "Taylor 전개", ["taylor", "테일러", "maclaurin", "맥클로린", "전개"], ["Taylor 전개"]),
    ("미분학", "접선의 방정식", "접선 방정식", ["접선", "tangent"], ["접선 방정식"]),
    ("미분학", "최대/최소", "최대최소", ["최대", "최소", "극대", "극소"], ["최대최소"]),
    ("적분학", "부정적분", "부분적분", ["부분적분", "x e^", "x sin", "x cos"], ["부분적분"]),
    ("적분학", "부정적분", "치환적분", ["치환", "u=", "sqrt", "루트"], ["치환적분"]),
    ("적분학", "부정적분", "삼각치환", ["삼각치환"], ["삼각치환"]),
    ("적분학", "정적분의 계산", "정적분 계산", ["∫", "\\int", "적분", "dx", "정적분"], ["정적분 계산"]),
    ("적분학", "특이적분", "특이적분", ["특이적분", "improper", "무한구간"], ["특이적분"]),
    ("선형대수", "행렬", "행렬식", ["det", "행렬식"], ["행렬식"]),
    ("선형대수", "행렬", "역행렬", ["역행렬", "inverse matrix"], ["역행렬"]),
    ("선형대수", "행렬", "rank", ["rank", "계수"], ["rank"]),
    ("선형대수", "고유치와 대각화", "고유치", ["고유치", "고유값", "eigen", "lambda", "λ"], ["고유치"]),
    ("선형대수", "고유치와 대각화", "대각화", ["대각화", "diagonal"], ["대각화"]),
    ("다변수함수", "편도함수", "편미분", ["편미분", "∂", "partial"], ["편미분"]),
    ("다변수함수", "경도 및 방향도함수", "방향도함수", ["방향도함수", "gradient", "그래디언트", "경도"], ["방향도함수"]),
    ("다변수함수", "중적분", "중적분", ["중적분", "이중적분", "double integral"], ["중적분"]),
    ("다변수함수", "삼중적분과 극좌표계", "극좌표", ["극좌표", "polar"], ["극좌표"]),
    ("공학수학 I", "미분방정식", "1계 미분방정식", ["미분방정식", "일반해", "특수해"], ["미분방정식"]),
    ("공학수학 I", "Laplace변환", "Laplace 변환", ["laplace", "라플라스"], ["Laplace 변환"]),
    ("공학수학 I", "Fourier급수", "Fourier 급수", ["fourier", "푸리에"], ["Fourier 급수"]),
]


@dataclass
class PageImage:
    original_filename: str
    stored_filename: str
    page_number: int
    image_path: Path


def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            source_filename TEXT NOT NULL,
            stored_filename TEXT NOT NULL,
            page_number INTEGER NOT NULL,
            problem_number TEXT,
            problem_text TEXT,
            latex TEXT,
            choices TEXT,
            is_solution INTEGER DEFAULT 0,
            bbox_json TEXT NOT NULL,
            page_image_path TEXT NOT NULL,
            crop_image_path TEXT NOT NULL,
            subject TEXT,
            chapter TEXT,
            section TEXT,
            subtype TEXT,
            topic_tags_json TEXT,
            method_tags TEXT,
            difficulty TEXT,
            difficulty_reason TEXT,
            answer TEXT,
            solution_text TEXT,
            memo TEXT,
            suggestion_reason TEXT,
            confidence_score REAL,
            keywords TEXT,
            summary TEXT,
            formula_signature TEXT,
            image_feature_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS solutions (
            id TEXT PRIMARY KEY,
            problem_id TEXT,
            source_filename TEXT NOT NULL,
            stored_filename TEXT NOT NULL,
            page_number INTEGER NOT NULL,
            problem_number TEXT,
            bbox_json TEXT NOT NULL,
            page_image_path TEXT NOT NULL,
            solution_image_path TEXT NOT NULL,
            solution_text TEXT,
            ocr_text TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(problems)").fetchall()}
    for column_name, column_type in {
        "image_feature_json": "TEXT",
        "subject": "TEXT",
        "section": "TEXT",
        "topic_tags_json": "TEXT",
        "difficulty_reason": "TEXT",
        "answer": "TEXT",
        "solution_text": "TEXT",
        "memo": "TEXT",
        "suggestion_reason": "TEXT",
        "confidence_score": "REAL",
    }.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE problems ADD COLUMN {column_name} {column_type}")
    conn.commit()
    return conn


def stable_name(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    digest = hashlib.sha256(content).hexdigest()[:12]
    stem = re.sub(r"[^0-9A-Za-z가-힣_.-]+", "_", Path(filename).stem)
    return f"{stem}_{digest}{suffix}"


def save_upload(uploaded_file: Any) -> Path | None:
    content = uploaded_file.getvalue()
    if not content:
        st.warning(f"빈 파일이라 건너뜁니다: {uploaded_file.name}")
        return None

    filename = stable_name(uploaded_file.name, content)
    target = UPLOAD_DIR / filename
    if not target.exists() or target.stat().st_size == 0:
        target.write_bytes(content)
    return target


def render_pdf_pages(pdf_path: Path, original_name: str, dpi: int = 180) -> list[PageImage]:
    if not pdf_path.exists() or pdf_path.stat().st_size == 0:
        st.warning(f"빈 PDF라 건너뜁니다: {original_name}")
        return []

    try:
        doc = fitz.open(pdf_path)
    except (fitz.EmptyFileError, fitz.FileDataError, RuntimeError, ValueError) as exc:
        st.warning(f"PDF를 열 수 없어 건너뜁니다: {original_name} ({exc})")
        return []

    pages: list[PageImage] = []
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    for page_index in range(len(doc)):
        page = doc.load_page(page_index)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        page_path = PAGE_DIR / f"{pdf_path.stem}_p{page_index + 1}.png"
        if not page_path.exists():
            pix.save(page_path)
        pages.append(
            PageImage(
                original_filename=original_name,
                stored_filename=pdf_path.name,
                page_number=page_index + 1,
                image_path=page_path,
            )
        )
    return pages


def register_image_page(image_path: Path, original_name: str) -> PageImage:
    target = PAGE_DIR / f"{image_path.stem}_p1.png"
    if not target.exists():
        Image.open(image_path).convert("RGB").save(target)
    return PageImage(
        original_filename=original_name,
        stored_filename=image_path.name,
        page_number=1,
        image_path=target,
    )


def image_to_png_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.convert("RGB").save(buffer, format="PNG")
    return buffer.getvalue()


def image_to_data_url(image: Image.Image) -> str:
    encoded = base64.b64encode(image_to_png_bytes(image)).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def data_url_to_image(data_url: str) -> Image.Image | None:
    if not data_url or data_url.startswith("error:"):
        return None
    try:
        _, encoded = data_url.split(";base64,", 1)
        return Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
    except Exception as exc:
        st.warning(f"붙여넣은 이미지를 읽을 수 없습니다: {exc}")
        return None


def paste_image_area(label: str, hint: str, key: str) -> Image.Image | None:
    value = _paste_component(label=label, hint=hint, key=key, default=None)
    if isinstance(value, str) and value.startswith("error: no image"):
        st.warning("클립보드에 이미지가 없습니다. 캡처한 뒤 Ctrl+V로 붙여넣으세요.")
        return None
    if isinstance(value, str) and value.startswith("error:"):
        st.warning(f"붙여넣기 실패: {value}")
        return None
    if isinstance(value, str):
        return data_url_to_image(value)
    return None


def grab_clipboard_image() -> Image.Image | None:
    try:
        clipboard = ImageGrab.grabclipboard()
    except Exception as exc:
        st.warning(f"클립보드를 읽을 수 없습니다: {exc}")
        return None

    if isinstance(clipboard, Image.Image):
        return clipboard.convert("RGB")

    if isinstance(clipboard, list):
        for item in clipboard:
            path = Path(item)
            if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".bmp"} and path.exists():
                return Image.open(path).convert("RGB")

    st.warning("클립보드에 이미지가 없습니다. 캡처하거나 이미지를 복사한 뒤 다시 눌러주세요.")
    return None


def save_clipboard_image(image: Image.Image, prefix: str) -> Path:
    filename = f"{prefix}_{uuid.uuid4().hex}.png"
    target = UPLOAD_DIR / filename
    image.convert("RGB").save(target)
    return target


def load_pages_for_uploads(uploaded_files: list[Any]) -> list[PageImage]:
    pages: list[PageImage] = []
    for uploaded_file in uploaded_files:
        saved_path = save_upload(uploaded_file)
        if saved_path is None:
            continue
        suffix = saved_path.suffix.lower()
        if suffix == ".pdf":
            pages.extend(render_pdf_pages(saved_path, uploaded_file.name))
        elif suffix in {".png", ".jpg", ".jpeg", ".webp"}:
            pages.append(register_image_page(saved_path, uploaded_file.name))
    return pages


def uploaded_file_kinds(uploaded_files: list[Any]) -> set[str]:
    kinds: set[str] = set()
    for uploaded_file in uploaded_files:
        suffix = Path(uploaded_file.name).suffix.lower()
        if suffix == ".pdf":
            kinds.add("pdf")
        elif suffix in {".png", ".jpg", ".jpeg", ".webp"}:
            kinds.add("image")
    return kinds


def crop_image(image_path: Path, bbox: dict[str, int]) -> Image.Image:
    image = Image.open(image_path).convert("RGB")
    width, height = image.size
    x1 = max(0, min(width - 1, bbox["x1"]))
    y1 = max(0, min(height - 1, bbox["y1"]))
    x2 = max(x1 + 1, min(width, bbox["x2"]))
    y2 = max(y1 + 1, min(height, bbox["y2"]))
    return image.crop((x1, y1, x2, y2))


def configure_tesseract() -> bool:
    if pytesseract is None:
        return False

    found_path = shutil.which("tesseract")
    if found_path:
        pytesseract.pytesseract.tesseract_cmd = found_path
        return True

    for candidate in TESSERACT_PATHS:
        if candidate.exists():
            pytesseract.pytesseract.tesseract_cmd = str(candidate)
            return True

    return False


def tesseract_langs_ready() -> bool:
    return (TESSDATA_DIR / "kor.traineddata").exists() and (TESSDATA_DIR / "eng.traineddata").exists()


def tesseract_config() -> str:
    if tesseract_langs_ready():
        return f"--tessdata-dir {TESSDATA_DIR}"
    return ""


def preprocess_for_ocr(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    width, height = image.size
    scale = 2 if max(width, height) < 1800 else 1
    if scale > 1:
        image = image.resize((width * scale, height * scale), Image.Resampling.LANCZOS)
    gray = ImageOps.grayscale(image)
    gray = ImageOps.autocontrast(gray)
    gray = gray.filter(ImageFilter.SHARPEN)
    return gray


def run_ocr(image: Image.Image) -> str:
    if pytesseract is None:
        return "OCR 사용 불가: pytesseract 패키지가 설치되어 있지 않습니다."

    if not configure_tesseract():
        return (
            "OCR 사용 불가: Windows에 Tesseract OCR이 설치되어 있지 않습니다.\n\n"
            "지금은 문제 텍스트를 직접 입력해 저장할 수 있습니다.\n"
            "OCR을 쓰려면 Tesseract 본체와 한국어 언어팩을 설치한 뒤 앱을 다시 실행하세요."
        )

    if not tesseract_langs_ready():
        return (
            "OCR 사용 불가: 앱 전용 언어팩 폴더에 kor/eng 데이터가 없습니다.\n\n"
            f"필요한 위치: {TESSDATA_DIR}"
        )

    try:
        config = f"{tesseract_config()} --psm 6"
        return pytesseract.image_to_string(preprocess_for_ocr(image), lang="kor+eng", config=config)
    except pytesseract.TesseractError as exc:
        return (
            "OCR 실패: Tesseract는 찾았지만 한국어/영어 언어팩 또는 설정에 문제가 있습니다.\n\n"
            f"상세 오류: {exc}"
        )
    except Exception as exc:
        return f"OCR 실패: {exc}"


def ocr_lines_with_boxes(image: Image.Image) -> list[dict[str, Any]]:
    if pytesseract is None or not configure_tesseract() or not tesseract_langs_ready():
        return []

    processed = preprocess_for_ocr(image)
    scale_x = image.width / processed.width
    scale_y = image.height / processed.height
    config = f"{tesseract_config()} --psm 6"
    try:
        data = pytesseract.image_to_data(
            processed,
            lang="kor+eng",
            config=config,
            output_type=pytesseract.Output.DICT,
        )
    except Exception:
        return []

    grouped: dict[tuple[int, int, int], list[int]] = {}
    for index, text in enumerate(data["text"]):
        if not text or not text.strip():
            continue
        try:
            confidence = float(data["conf"][index])
        except ValueError:
            confidence = -1
        if confidence < 20:
            continue
        key = (data["block_num"][index], data["par_num"][index], data["line_num"][index])
        grouped.setdefault(key, []).append(index)

    lines: list[dict[str, Any]] = []
    for indexes in grouped.values():
        words = [data["text"][i].strip() for i in indexes if data["text"][i].strip()]
        if not words:
            continue
        left = min(data["left"][i] for i in indexes)
        top = min(data["top"][i] for i in indexes)
        right = max(data["left"][i] + data["width"][i] for i in indexes)
        bottom = max(data["top"][i] + data["height"][i] for i in indexes)
        lines.append(
            {
                "text": " ".join(words),
                "bbox": {
                    "x1": int(left * scale_x),
                    "y1": int(top * scale_y),
                    "x2": int(right * scale_x),
                    "y2": int(bottom * scale_y),
                },
            }
        )

    return sorted(lines, key=lambda line: (line["bbox"]["y1"], line["bbox"]["x1"]))


def infer_problem_number(text: str) -> str:
    match = re.search(r"(?:^|\s)(?:문제\s*)?(\d{1,3})(?:번|[.)])", text)
    return match.group(1) if match else ""


def infer_tags(text: str, latex: str = "") -> dict[str, str]:
    merged = f"{text} {latex}".lower()
    if not merged.strip():
        return {
            "chapter": "",
            "method_tags": "",
            "difficulty": "",
            "formula_signature": "",
        }
    chapter_scores = {
        chapter: sum(1 for keyword in keywords if keyword.lower() in merged)
        for chapter, keywords in CHAPTER_KEYWORDS.items()
    }
    method_scores = {
        method: sum(1 for keyword in keywords if keyword.lower() in merged)
        for method, keywords in METHOD_KEYWORDS.items()
    }
    chapter = max(chapter_scores, key=chapter_scores.get)
    chapter = chapter if chapter_scores[chapter] > 0 else ""
    methods = [method for method, score in method_scores.items() if score > 0]
    formula_signature = ",".join(
        name for name, pattern in FORMULA_PATTERNS.items() if re.search(pattern, merged, re.IGNORECASE)
    )
    difficulty = "중" if text.strip() or latex.strip() else ""
    if len(text) < 80 and not methods:
        difficulty = "하"
    if len(text) > 300 or len(methods) >= 2:
        difficulty = "상"
    return {
        "chapter": chapter,
        "method_tags": ", ".join(methods),
        "difficulty": difficulty,
        "formula_signature": formula_signature,
    }


def subject_options() -> list[str]:
    return ["", *TAXONOMY.keys()]


def chapter_options(subject: str) -> list[str]:
    if subject in TAXONOMY:
        return ["", *TAXONOMY[subject].keys(), "복합단원"]
    return [""]


def section_options(subject: str, chapter: str) -> list[str]:
    if subject in TAXONOMY and chapter in TAXONOMY[subject]:
        return ["", *TAXONOMY[subject][chapter], "복합단원"]
    return [""]


def suggest_metadata(text: str, latex: str, source_filename: str) -> dict[str, Any]:
    raw = f"{text} {latex} {source_filename}".lower()
    scores: dict[tuple[str, str, str], int] = {}
    tag_scores: dict[str, int] = {}
    matched_keywords: list[str] = []

    for subject, chapter, section, keywords, tags in CLASSIFICATION_RULES:
        score = 0
        for keyword in keywords:
            if keyword.lower() in raw:
                score += 2 if len(keyword) >= 3 else 1
                matched_keywords.append(keyword)
        if score:
            key = (subject, chapter, section)
            scores[key] = scores.get(key, 0) + score
            for tag in tags:
                tag_scores[tag] = tag_scores.get(tag, 0) + score

    if not scores:
        return {
            "subject": "",
            "chapter": "",
            "section": "",
            "topic_tags": [],
            "difficulty": "",
            "difficulty_reason": "OCR/파일명에서 분류 키워드를 충분히 찾지 못했습니다.",
            "reason": "자동 추천 근거가 부족합니다. 사용자가 직접 선택해야 합니다.",
            "confidence": 0.0,
            "needs_review" : True,
        }

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    (subject, chapter, section), top_score = ranked[0]
    second_score = ranked[1][1] if len(ranked) > 1 else 0
    is_ambiguous = second_score and top_score - second_score <= 1
    confidence = min(0.95, 0.35 + top_score * 0.08 - (0.15 if is_ambiguous else 0.0))
    topic_tags = [tag for tag, _ in sorted(tag_scores.items(), key=lambda item: item[1], reverse=True)[:6]]

    concept_count = max(1, len(topic_tags))
    calculation_load = len(re.findall(r"∫|\\int|det|rank|lim|dx|dy|=|\+|-|/|\^", raw))
    composite_bonus = 1 if is_ambiguous or len({key[1] for key in scores}) >= 2 else 0
    level = min(5, max(1, 1 + (concept_count >= 2) + (calculation_load >= 4) + (calculation_load >= 8) + composite_bonus))
    difficulty = DIFFICULTY_OPTIONS[level]
    difficulty_reason = (
        f"추천 태그 {concept_count}개, 계산 신호 {calculation_load}개"
        + (", 복합단원 가능성 있음" if composite_bonus else "")
    )

    if is_ambiguous:
        subject = "복합단원"
        chapter = "복합단원"
        section = "복합단원"

    reason_keywords = ", ".join(dict.fromkeys(matched_keywords[:8]))
    reason = f"감지 키워드: {reason_keywords or '없음'}"
    if is_ambiguous:
        reason += " / 상위 후보 점수가 비슷해 확인이 필요합니다."

    return {
        "subject": subject,
        "chapter": chapter,
        "section": section,
        "topic_tags": topic_tags,
        "difficulty": difficulty,
        "difficulty_reason": difficulty_reason,
        "reason": reason,
        "confidence": round(confidence, 2),
        "needs_review": confidence < 0.7 or is_ambiguous,
    }


def get_suggestion_ocr(crop: Image.Image, page: PageImage) -> str:
    digest = hashlib.sha256(image_to_png_bytes(crop)).hexdigest()
    cache_key = f"suggestion_ocr_{page.stored_filename}_{page.page_number}_{digest}"
    if cache_key not in st.session_state:
        st.session_state[cache_key] = run_ocr(crop)
    ocr_text = st.session_state.get(cache_key, "")
    if isinstance(ocr_text, str) and (ocr_text.startswith("OCR 사용 불가") or ocr_text.startswith("OCR 실패")):
        return ""
    return ocr_text


def ai_classification_prompt(
    ocr_text: str = "",
    latex: str = "",
    source_filename: str = "",
) -> str:
    taxonomy_text = json.dumps(TAXONOMY, ensure_ascii=False)
    return f"""
너는 편입수학 문제 분류 전문가다.
이미지 속 수학 문제를 보고 아래 단원 체계 안에서 분류 추천값을 JSON으로만 반환해라.

규칙:
- 자동 분류는 확정이 아니라 추천이다.
- 과목은 반드시 다음 중 하나: {", ".join(TAXONOMY.keys())}
- 대단원/소단원은 선택한 과목의 단원 체계 안에서 고른다.
- 애매하면 is_composite=true, needs_review=true, confidence_score를 낮게 준다.
- OCR 텍스트가 틀릴 수 있으므로 이미지의 수식 구조를 우선한다.
- difficulty는 반드시 다음 중 하나: {", ".join(DIFFICULTY_OPTIONS[1:])}
- topic_tags는 여러 개 가능하다.
- JSON 외 문장은 출력하지 마라.

단원 체계:
{taxonomy_text}

참고 OCR 텍스트:
{ocr_text or "(없음)"}

참고 LaTeX:
{latex or "(없음)"}

원본 파일명:
{source_filename or "(없음)"}

반환 JSON 형식:
{{
  "subject": "적분학",
  "chapter": "정적분의 계산",
  "section": "정적분 계산",
  "topic_tags": ["정적분 계산"],
  "difficulty": "Lv.2 기본 계산",
  "difficulty_reason": "짧은 정적분 계산 문제이며 필요한 개념 수가 적음",
  "reason": "정적분 기호와 구간 0부터 1까지의 계산 구조가 보임",
  "confidence": 0.82,
  "needs_review": false,
  "is_composite": false
}}
"""


def parse_first_json_object(text: str) -> dict[str, Any]:
    decoder = json.JSONDecoder()
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    for match in re.finditer(r"\{", stripped):
        try:
            obj, _ = decoder.raw_decode(stripped[match.start():])
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            continue
    raise RuntimeError(f"AI 응답에서 유효한 JSON 객체를 찾지 못했습니다: {text[:300]}")


def ai_classify_problem_openai(
    image: Image.Image,
    api_key: str,
    model: str,
    ocr_text: str = "",
    latex: str = "",
    source_filename: str = "",
) -> dict[str, Any]:
    if OpenAI is None:
        raise RuntimeError("openai 패키지가 설치되어 있지 않습니다. requirements.txt를 설치하세요.")
    if not api_key:
        raise RuntimeError("OpenAI API 키를 입력하세요.")

    client = OpenAI(api_key=api_key)
    prompt = ai_classification_prompt(ocr_text, latex, source_filename)
    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {"type": "input_image", "image_url": image_to_data_url(image), "detail": "high"},
                ],
            }
        ],
    )
    output_text = getattr(response, "output_text", "")
    if not output_text:
        output_text = str(response)
    data = parse_first_json_object(output_text)
    return normalize_ai_suggestion(data)


def ai_classify_problem_gemini(
    image: Image.Image,
    api_key: str,
    model: str,
    ocr_text: str = "",
    latex: str = "",
    source_filename: str = "",
) -> dict[str, Any]:
    if genai is None or genai_types is None:
        raise RuntimeError("google-genai 패키지가 설치되어 있지 않습니다. requirements.txt를 설치하세요.")
    if not api_key:
        raise RuntimeError("Gemini API 키를 입력하세요.")

    client = genai.Client(api_key=api_key)
    prompt = ai_classification_prompt(ocr_text, latex, source_filename)
    image_bytes = image_to_png_bytes(image)
    response = client.models.generate_content(
        model=model,
        contents=[
            prompt,
            genai_types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        ],
        config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    output_text = getattr(response, "text", "") or str(response)
    data = parse_first_json_object(output_text)
    return normalize_ai_suggestion(data)


def normalize_ai_suggestion(data: dict[str, Any]) -> dict[str, Any]:
    subject = str(data.get("subject") or "")
    if subject not in TAXONOMY:
        subject = ""
    chapter_values = chapter_options(subject)
    chapter = str(data.get("chapter") or "")
    if chapter not in chapter_values:
        chapter = ""
    section_values = section_options(subject, chapter)
    section = str(data.get("section") or "")
    if section not in section_values:
        section = ""
    difficulty = str(data.get("difficulty") or "")
    if difficulty not in DIFFICULTY_OPTIONS:
        difficulty = ""
    tags = data.get("topic_tags") or []
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
    confidence = data.get("confidence", data.get("confidence_score", 0.0))
    try:
        confidence = max(0.0, min(1.0, float(confidence)))
    except (TypeError, ValueError):
        confidence = 0.0

    return {
        "subject": subject,
        "chapter": chapter,
        "section": section,
        "topic_tags": [str(tag) for tag in tags[:8]],
        "difficulty": difficulty,
        "difficulty_reason": str(data.get("difficulty_reason") or ""),
        "reason": str(data.get("reason") or "AI가 이미지와 텍스트를 바탕으로 분류했습니다."),
        "confidence": round(confidence, 2),
        "needs_review": bool(data.get("needs_review", confidence < 0.75)),
        "is_composite": bool(data.get("is_composite", False)),
    }


def tokenize_keywords(text: str) -> str:
    tokens = re.findall(r"[A-Za-z가-힣0-9^_{}+-]{2,}", text)
    stopwords = {"다음", "구하", "구하여라", "대하여", "이면", "일", "때"}
    keywords = [token for token in tokens if token not in stopwords]
    return ", ".join(dict.fromkeys(keywords[:20]))


def normalized_image_array(image: Image.Image, size: int = 32) -> np.ndarray:
    canvas = ImageOps.pad(
        image.convert("L"),
        (size, size),
        method=Image.Resampling.LANCZOS,
        color=255,
        centering=(0.5, 0.5),
    )
    canvas = ImageOps.autocontrast(canvas)
    arr = np.asarray(canvas, dtype=np.float32) / 255.0
    return 1.0 - arr


def image_feature(image: Image.Image) -> dict[str, Any]:
    structure = normalized_image_array(image, size=32)
    gy, gx = np.gradient(structure)
    edges = np.sqrt(gx * gx + gy * gy)
    row_projection = structure.mean(axis=1)
    col_projection = structure.mean(axis=0)
    aspect = image.width / max(1, image.height)
    vector = np.concatenate(
        [
            structure.flatten(),
            edges.flatten(),
            row_projection,
            col_projection,
            np.array([min(aspect, 4.0) / 4.0], dtype=np.float32),
        ]
    )
    norm = float(np.linalg.norm(vector))
    if norm > 0:
        vector = vector / norm
    return {"vector": [round(float(value), 6) for value in vector]}


def image_feature_from_path(image_path: str | Path) -> dict[str, Any] | None:
    try:
        return image_feature(Image.open(image_path).convert("RGB"))
    except Exception:
        return None


def cosine_from_features(left: dict[str, Any] | None, right: dict[str, Any] | None) -> float:
    if not left or not right:
        return 0.0
    left_vector = np.asarray(left.get("vector", []), dtype=np.float32)
    right_vector = np.asarray(right.get("vector", []), dtype=np.float32)
    if left_vector.size == 0 or left_vector.size != right_vector.size:
        return 0.0
    denom = float(np.linalg.norm(left_vector) * np.linalg.norm(right_vector))
    if denom == 0:
        return 0.0
    return max(0.0, min(1.0, float(np.dot(left_vector, right_vector) / denom)))


def row_image_feature(row: sqlite3.Row) -> dict[str, Any] | None:
    raw_feature = row["image_feature_json"]
    if raw_feature:
        try:
            return json.loads(raw_feature)
        except json.JSONDecodeError:
            pass

    feature = image_feature_from_path(row["crop_image_path"])
    if feature:
        conn = connect_db()
        conn.execute(
            "UPDATE problems SET image_feature_json = ? WHERE id = ?",
            (json.dumps(feature), row["id"]),
        )
        conn.commit()
        conn.close()
    return feature


RELATED_CONCEPTS = {
    "미분": "접선, 증가/감소, 극값, 최적화, 역함수 미분 문제와 연결됩니다.",
    "적분": "넓이, 부피, 치환적분, 부분적분, 특수함수 적분 문제와 연결됩니다.",
    "급수": "수렴 판정, 멱급수, 테일러 전개, 함수 근사 문제와 연결됩니다.",
    "선형대수": "행렬식, rank, 고유값/고유벡터, 대각화 문제와 연결됩니다.",
    "다변수": "편미분, 그래디언트, 라그랑주 승수, 중적분 문제와 연결됩니다.",
    "미분방정식": "초기값 문제, 변수분리, 선형 미분방정식, 라플라스 변환 문제와 연결됩니다.",
}


def related_concept_note(profile: dict[str, str]) -> str:
    chapter_note = RELATED_CONCEPTS.get(profile.get("chapter", ""), "")
    method = profile.get("method_tags", "")
    if method:
        return f"{chapter_note} 특히 풀이 태그 `{method}` 중심으로 관련 문제를 우선 봅니다."
    return chapter_note or "이미지 구조를 먼저 보고, 입력한 단원/태그 힌트가 있으면 함께 반영합니다."


def save_problem(
    page: PageImage,
    bbox: dict[str, int],
    problem_text: str,
    latex: str,
    choices: str,
    problem_number: str,
    chapter: str,
    subtype: str,
    method_tags: str,
    difficulty: str,
    is_solution: bool,
    subject: str = "",
    section: str = "",
    topic_tags: str = "",
    difficulty_reason: str = "",
    answer: str = "",
    solution_text: str = "",
    memo: str = "",
    suggestion_reason: str = "",
    confidence_score: float = 0.0,
) -> str:
    problem_id = str(uuid.uuid4())
    crop = crop_image(page.image_path, bbox)
    crop_path = CROP_DIR / f"{problem_id}.png"
    crop.save(crop_path)
    crop_feature = image_feature(crop)
    inferred_for_formula = infer_tags(problem_text, latex)

    summary = (
        f"{subject} {chapter} {section} {subtype} {topic_tags} {method_tags} "
        f"{problem_text} {latex} {page.original_filename} {problem_number}"
    ).strip()
    conn = connect_db()
    conn.execute(
        """
        INSERT INTO problems (
            id, source_filename, stored_filename, page_number, problem_number,
            problem_text, latex, choices, is_solution, bbox_json,
            page_image_path, crop_image_path, subject, chapter, section, subtype,
            topic_tags_json, method_tags, difficulty, difficulty_reason, answer,
            solution_text, memo, suggestion_reason, confidence_score, keywords,
            summary, formula_signature, image_feature_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            problem_id,
            page.original_filename,
            page.stored_filename,
            page.page_number,
            problem_number,
            problem_text,
            latex,
            choices,
            int(is_solution),
            json.dumps(bbox, ensure_ascii=False),
            str(page.image_path),
            str(crop_path),
            subject,
            chapter,
            section,
            subtype,
            json.dumps([tag.strip() for tag in topic_tags.split(",") if tag.strip()], ensure_ascii=False),
            method_tags,
            difficulty,
            difficulty_reason,
            answer,
            solution_text,
            memo,
            suggestion_reason,
            confidence_score,
            tokenize_keywords(summary),
            summary,
            inferred_for_formula["formula_signature"],
            json.dumps(crop_feature),
        ),
    )
    conn.commit()
    conn.close()
    return problem_id


def all_problems() -> list[sqlite3.Row]:
    conn = connect_db()
    rows = conn.execute("SELECT * FROM problems ORDER BY created_at DESC").fetchall()
    conn.close()
    return rows


def find_problem_for_solution(problem_number: str, source_filename: str = "") -> sqlite3.Row | None:
    conn = connect_db()
    row = None
    if problem_number:
        row = conn.execute(
            """
            SELECT * FROM problems
            WHERE problem_number = ?
              AND (? = '' OR source_filename = ?)
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (problem_number, source_filename, source_filename),
        ).fetchone()
    if row is None and problem_number:
        row = conn.execute(
            "SELECT * FROM problems WHERE problem_number = ? ORDER BY created_at DESC LIMIT 1",
            (problem_number,),
        ).fetchone()
    conn.close()
    return row


def save_solution(
    page: PageImage,
    bbox: dict[str, int],
    problem_number: str = "",
    solution_text: str = "",
    ocr_text: str = "",
    problem_id: str | None = None,
) -> str:
    solution_id = str(uuid.uuid4())
    crop = crop_image(page.image_path, bbox)
    solution_path = SOLUTION_DIR / f"{solution_id}.png"
    crop.save(solution_path)

    if problem_id is None:
        matched_problem = find_problem_for_solution(problem_number, page.original_filename)
        problem_id = matched_problem["id"] if matched_problem else None

    conn = connect_db()
    conn.execute(
        """
        INSERT INTO solutions (
            id, problem_id, source_filename, stored_filename, page_number,
            problem_number, bbox_json, page_image_path, solution_image_path,
            solution_text, ocr_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            solution_id,
            problem_id,
            page.original_filename,
            page.stored_filename,
            page.page_number,
            problem_number,
            json.dumps(bbox, ensure_ascii=False),
            str(page.image_path),
            str(solution_path),
            solution_text,
            ocr_text,
        ),
    )
    conn.commit()
    conn.close()
    return solution_id


def get_solutions_for_problem(problem_id: str, problem_number: str = "", source_filename: str = "") -> list[sqlite3.Row]:
    conn = connect_db()
    rows = conn.execute(
        """
        SELECT * FROM solutions
        WHERE problem_id = ?
           OR (? != '' AND problem_number = ? AND (? = '' OR source_filename = ?))
        ORDER BY created_at DESC
        """,
        (problem_id, problem_number, problem_number, source_filename, source_filename),
    ).fetchall()
    conn.close()
    return rows


def ratio_overlap(left: str | None, right: str | None) -> float:
    left_set = {item.strip() for item in (left or "").split(",") if item.strip()}
    right_set = {item.strip() for item in (right or "").split(",") if item.strip()}
    if not left_set or not right_set:
        return 0.0
    return len(left_set & right_set) / len(left_set | right_set)


def same_value_score(left: str | None, right: str | None) -> float:
    if not left or not right:
        return 0.0
    return 1.0 if left == right else 0.0


def difficulty_score(left: str | None, right: str | None) -> float:
    order = {
        "하": 1,
        "중": 3,
        "상": 5,
        "Lv.1 개념 확인": 1,
        "Lv.2 기본 계산": 2,
        "Lv.3 대표 유형": 3,
        "Lv.4 응용 문제": 4,
        "Lv.5 고난도 / 킬러 문제": 5,
    }
    if left not in order or right not in order:
        return 0.0
    return max(0.0, 1.0 - abs(order[left] - order[right]) / 4)


def text_similarity(query_summary: str, documents: list[str]) -> list[float]:
    if not documents:
        return []
    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), min_df=1)
    try:
        matrix = vectorizer.fit_transform([query_summary, *documents])
        scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
        return scores.tolist()
    except ValueError:
        return [0.0 for _ in documents]


def analyze_query(query: str, latex: str, chapter: str, subtype: str, method_tags: str, difficulty: str) -> dict[str, str]:
    inferred = infer_tags(query, latex) if query.strip() or latex.strip() else {
        "chapter": "",
        "method_tags": "",
        "difficulty": "",
        "formula_signature": "",
    }
    selected_chapter = chapter or inferred["chapter"]
    selected_method = method_tags or inferred["method_tags"]
    selected_difficulty = difficulty or inferred["difficulty"]
    selected_subtype = subtype or (selected_method.split(",")[0].strip() if selected_method else "")
    summary = f"{selected_chapter} {selected_subtype} {selected_method} {query} {latex}".strip()
    return {
        "chapter": selected_chapter,
        "subtype": selected_subtype,
        "method_tags": selected_method,
        "difficulty": selected_difficulty,
        "formula_signature": inferred["formula_signature"],
        "keywords": tokenize_keywords(summary),
        "summary": summary,
    }


def search_problems(
    query_profile: dict[str, str],
    rows: list[sqlite3.Row],
    query_image_feature: dict[str, Any] | None = None,
    image_weight: float = 0.45,
) -> list[dict[str, Any]]:
    documents = [row["summary"] or row["problem_text"] or "" for row in rows]
    lexical_scores = text_similarity(query_profile["summary"], documents)
    results: list[dict[str, Any]] = []
    image_weight = max(0.0, min(0.95, image_weight if query_image_feature else 0.0))

    for row, lexical in zip(rows, lexical_scores, strict=False):
        chapter_sim = same_value_score(query_profile["chapter"], row["chapter"])
        formula_sim = ratio_overlap(query_profile["formula_signature"], row["formula_signature"])
        method_sim = ratio_overlap(query_profile["method_tags"], row["method_tags"])
        requirement_sim = max(float(lexical), same_value_score(query_profile["subtype"], row["subtype"]) * 0.7)
        diff_sim = difficulty_score(query_profile["difficulty"], row["difficulty"])
        keyword_sim = ratio_overlap(query_profile["keywords"], row["keywords"])

        weighted = (
            0.25 * chapter_sim
            + 0.30 * max(formula_sim, lexical * 0.6)
            + 0.30 * max(method_sim, keyword_sim * 0.7)
            + 0.10 * requirement_sim
            + 0.05 * diff_sim
        )
        image_sim = cosine_from_features(query_image_feature, row_image_feature(row)) if query_image_feature else 0.0
        final_score = (image_weight * image_sim) + ((1.0 - image_weight) * weighted)

        reason_parts = []
        if image_sim >= 0.72:
            reason_parts.append(f"이미지 구조가 유사합니다({round(image_sim * 100)}%)")
        if chapter_sim:
            reason_parts.append(f"단원({row['chapter']})이 같습니다")
        if method_sim:
            reason_parts.append(f"풀이 태그가 겹칩니다: {row['method_tags']}")
        if formula_sim:
            reason_parts.append(f"수식 구조 신호가 겹칩니다: {row['formula_signature']}")
        if not reason_parts:
            reason_parts.append("텍스트/키워드 표현이 일부 유사합니다")

        results.append(
            {
                "row": row,
                "score": min(1.0, max(0.0, final_score)),
                "concept_score": min(1.0, max(0.0, weighted)),
                "image_score": image_sim,
                "reason": "; ".join(reason_parts),
            }
        )
    return sorted(results, key=lambda item: item["score"], reverse=True)


def page_selector(pages: list[PageImage]) -> PageImage | None:
    if not pages:
        return None
    labels = [
        f"{index + 1}. {page.original_filename} / {page.page_number}p"
        for index, page in enumerate(pages)
    ]
    selected_label = st.selectbox("페이지 선택", labels)
    return pages[labels.index(selected_label)]


def bbox_sliders(image: Image.Image) -> dict[str, int]:
    width, height = image.size
    st.caption(f"이미지 크기: {width} x {height}px")
    col1, col2 = st.columns(2)
    with col1:
        x1 = st.slider("왼쪽 x1", 0, width - 1, 0)
        y1 = st.slider("위쪽 y1", 0, height - 1, 0)
    with col2:
        x2 = st.slider("오른쪽 x2", 1, width, width)
        y2 = st.slider("아래쪽 y2", 1, height, min(height, math.floor(height * 0.35)))
    if x2 <= x1:
        x2 = min(width, x1 + 1)
    if y2 <= y1:
        y2 = min(height, y1 + 1)
    return {"x1": x1, "y1": y1, "x2": x2, "y2": y2}


def full_image_bbox(image: Image.Image) -> dict[str, int]:
    return {"x1": 0, "y1": 0, "x2": image.width, "y2": image.height}


def detect_problem_starts(lines: list[dict[str, Any]]) -> list[dict[str, Any]]:
    starts: list[dict[str, Any]] = []
    pattern = re.compile(r"^\s*(?:문제\s*)?(\d{1,3})(?:\s*[.)번]|[\s:])")
    for line in lines:
        match = pattern.search(line["text"])
        if match:
            starts.append({"number": match.group(1), "line": line})
    return starts


def infer_candidate_kind(text: str, source_filename: str = "") -> str:
    raw = f"{text} {source_filename}".lower()
    solution_keywords = ["해설", "풀이", "정답", "solution", "answer", "해답", "답:"]
    if any(keyword in raw for keyword in solution_keywords):
        return "해설"
    return "문제"


def auto_problem_boxes(image: Image.Image) -> list[dict[str, Any]]:
    lines = ocr_lines_with_boxes(image)
    starts = detect_problem_starts(lines)
    if not starts:
        return []

    boxes: list[dict[str, Any]] = []
    page_width, page_height = image.size
    for index, start in enumerate(starts):
        y1 = max(0, start["line"]["bbox"]["y1"] - 12)
        y2 = page_height
        if index + 1 < len(starts):
            y2 = max(y1 + 20, starts[index + 1]["line"]["bbox"]["y1"] - 12)

        in_range_lines = [
            line for line in lines if y1 <= line["bbox"]["y1"] < y2
        ]
        if in_range_lines:
            x1 = max(0, min(line["bbox"]["x1"] for line in in_range_lines) - 16)
            x2 = min(page_width, max(line["bbox"]["x2"] for line in in_range_lines) + 16)
            y2 = min(page_height, max(line["bbox"]["y2"] for line in in_range_lines) + 18)
        else:
            x1, x2 = 0, page_width

        boxes.append(
            {
                "problem_number": start["number"],
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            }
        )
    return boxes


def auto_save_page_problems(page: PageImage, image: Image.Image) -> int:
    boxes = auto_problem_boxes(image)
    saved_count = 0
    for item in boxes:
        crop = crop_image(page.image_path, item["bbox"])
        text = run_ocr(crop).strip()
        if not text or text.startswith("OCR 사용 불가") or text.startswith("OCR 실패"):
            text = f"{item['problem_number']}번"
        suggestion = suggest_metadata(text, "", page.original_filename)
        topic_tags = ", ".join(suggestion["topic_tags"])
        save_problem(
            page=page,
            bbox=item["bbox"],
            problem_text=text,
            latex="",
            choices="",
            problem_number=item["problem_number"],
            chapter=suggestion["chapter"],
            subtype=suggestion["section"],
            method_tags=topic_tags,
            difficulty=suggestion["difficulty"],
            is_solution=False,
            subject=suggestion["subject"],
            section=suggestion["section"],
            topic_tags=topic_tags,
            difficulty_reason=suggestion["difficulty_reason"],
            suggestion_reason=suggestion["reason"],
            confidence_score=float(suggestion["confidence"]),
        )
        saved_count += 1
    return saved_count


def save_image_as_single_problem(page: PageImage, image: Image.Image) -> str:
    bbox = full_image_bbox(image)
    suggestion_text = get_suggestion_ocr(image, page)
    suggestion = suggest_metadata(suggestion_text, "", page.original_filename)
    topic_tags = ", ".join(suggestion["topic_tags"])
    return save_problem(
        page=page,
        bbox=bbox,
        problem_text="",
        latex="",
        choices="",
        problem_number="",
        chapter=suggestion["chapter"],
        subtype=suggestion["section"],
        method_tags=topic_tags,
        difficulty=suggestion["difficulty"],
        is_solution=False,
        subject=suggestion["subject"],
        section=suggestion["section"],
        topic_tags=topic_tags,
        difficulty_reason=suggestion["difficulty_reason"],
        suggestion_reason=suggestion["reason"],
        confidence_score=float(suggestion["confidence"]),
    )


def bulk_save_image_pages(pages: list[PageImage], limit: int = 10) -> int:
    saved_count = 0
    for page in pages[:limit]:
        image = Image.open(page.image_path).convert("RGB")
        save_image_as_single_problem(page, image)
        saved_count += 1
    return saved_count


def bulk_auto_save_pdf_pages(pages: list[PageImage]) -> tuple[int, int]:
    saved_count = 0
    detected_count = 0
    progress = st.progress(0)
    total = max(1, len(pages))
    for index, page in enumerate(pages):
        image = Image.open(page.image_path).convert("RGB")
        boxes = auto_problem_boxes(image)
        detected_count += len(boxes)
        if boxes:
            saved_count += auto_save_page_problems(page, image)
        progress.progress((index + 1) / total)
    return saved_count, detected_count


def candidate_crop_path(page: PageImage, bbox: dict[str, int]) -> Path:
    raw = f"{page.stored_filename}-{page.page_number}-{json.dumps(bbox, sort_keys=True)}"
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
    return CANDIDATE_DIR / f"{Path(page.stored_filename).stem}_p{page.page_number}_{digest}.png"


def best_existing_image_match(feature: dict[str, Any]) -> dict[str, Any]:
    best = {"score": 0.0, "label": ""}
    for row in all_problems():
        score = cosine_from_features(feature, row_image_feature(row))
        if score > best["score"]:
            best = {
                "score": score,
                "label": f"{row['source_filename']} / {row['page_number']}p / {row['subject'] or '미분류'} > {row['chapter'] or '-'}",
            }
    return best


def classify_candidate(
    page: PageImage,
    bbox: dict[str, int],
    problem_number: str,
    use_ai: bool = False,
) -> dict[str, Any]:
    crop = crop_image(page.image_path, bbox)
    crop_path = candidate_crop_path(page, bbox)
    crop.save(crop_path)
    ocr_text = run_ocr(crop).strip()
    if ocr_text.startswith("OCR 사용 불가") or ocr_text.startswith("OCR 실패"):
        ocr_text = ""
    kind = infer_candidate_kind(ocr_text, page.original_filename)

    suggestion = suggest_metadata(ocr_text, "", page.original_filename)
    ai_provider = st.session_state.get("ai_provider", "Gemini")
    if use_ai:
        try:
            if ai_provider == "Gemini":
                api_key = st.session_state.get("gemini_api_key", "") or os.getenv("GEMINI_API_KEY", "")
                model = st.session_state.get("gemini_model", "gemini-2.5-flash")
                suggestion = ai_classify_problem_gemini(crop, api_key, model, ocr_text=ocr_text, source_filename=page.original_filename)
            else:
                api_key = st.session_state.get("openai_api_key", "") or os.getenv("OPENAI_API_KEY", "")
                model = st.session_state.get("openai_model", "gpt-4.1-mini")
                suggestion = ai_classify_problem_openai(crop, api_key, model, ocr_text=ocr_text, source_filename=page.original_filename)
        except Exception as exc:
            suggestion["reason"] = f"{suggestion['reason']} / AI 분류 실패: {exc}"
            suggestion["needs_review"] = True

    feature = image_feature(crop)
    match = best_existing_image_match(feature)
    return {
        "source_filename": page.original_filename,
        "stored_filename": page.stored_filename,
        "page_number": page.page_number,
        "page_image_path": str(page.image_path),
        "crop_image_path": str(crop_path),
        "problem_number": problem_number,
        "kind": kind,
        "bbox": bbox,
        "ocr_text": ocr_text,
        "suggestion": suggestion,
        "image_feature": feature,
        "similar_score": match["score"],
        "similar_label": match["label"],
    }


def detect_problem_candidates(pages: list[PageImage], use_ai: bool = False) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    progress = st.progress(0)
    total = max(1, len(pages))
    for page_index, page in enumerate(pages):
        image = Image.open(page.image_path).convert("RGB")
        boxes = auto_problem_boxes(image)
        if not boxes:
            boxes = [{"problem_number": "", "bbox": full_image_bbox(image)}]
        for item in boxes:
            candidates.append(classify_candidate(page, item["bbox"], item["problem_number"], use_ai=use_ai))
        progress.progress((page_index + 1) / total)
    return candidates


def save_detected_candidate(candidate: dict[str, Any]) -> str:
    page = PageImage(
        original_filename=candidate["source_filename"],
        stored_filename=candidate["stored_filename"],
        page_number=int(candidate["page_number"]),
        image_path=Path(candidate["page_image_path"]),
    )
    suggestion = candidate["suggestion"]
    tags = ", ".join(suggestion.get("topic_tags", []))
    if candidate.get("kind") == "해설":
        return save_solution(
            page=page,
            bbox=candidate["bbox"],
            problem_number=candidate.get("problem_number", ""),
            solution_text=candidate.get("ocr_text", ""),
            ocr_text=candidate.get("ocr_text", ""),
        )
    return save_problem(
        page=page,
        bbox=candidate["bbox"],
        problem_text=candidate.get("ocr_text", ""),
        latex="",
        choices="",
        problem_number=candidate.get("problem_number", ""),
        chapter=suggestion.get("chapter", ""),
        subtype=suggestion.get("section", ""),
        method_tags=tags,
        difficulty=suggestion.get("difficulty", ""),
        is_solution=False,
        subject=suggestion.get("subject", ""),
        section=suggestion.get("section", ""),
        topic_tags=tags,
        difficulty_reason=suggestion.get("difficulty_reason", ""),
        suggestion_reason=suggestion.get("reason", ""),
        confidence_score=float(suggestion.get("confidence", 0.0)),
    )


def ingest_tab() -> None:
    st.subheader("파일 업로드 및 문제 저장")
    if not configure_tesseract():
        st.info("OCR 엔진이 아직 설치되지 않았습니다. 영역 캡처와 직접 텍스트 입력은 그대로 사용할 수 있습니다.")

    pasted_image = paste_image_area(
        label="여기를 클릭한 뒤 Ctrl+V",
        hint="캡처한 문제 페이지나 문제 이미지를 붙여넣으면 바로 입력됩니다.",
        key="ingest_paste_area",
    )
    if pasted_image is not None:
        pasted_bytes = image_to_png_bytes(pasted_image)
        pasted_digest = hashlib.sha256(pasted_bytes).hexdigest()
        if st.session_state.get("last_pasted_page_digest") != pasted_digest:
            clipboard_path = save_clipboard_image(pasted_image, "pasted_page")
            st.session_state["clipboard_page_path"] = str(clipboard_path)
            st.session_state["last_pasted_page_digest"] = pasted_digest
            st.session_state["ocr_text"] = ""
            st.success("붙여넣은 이미지를 가져왔습니다.")

    if st.button("클립보드에서 가져오기", help="Ctrl+V가 불편할 때 Windows 클립보드를 직접 읽습니다."):
        clipboard_image = grab_clipboard_image()
        if clipboard_image is not None:
            clipboard_path = save_clipboard_image(clipboard_image, "clipboard_page")
            st.session_state["clipboard_page_path"] = str(clipboard_path)
            st.session_state["ocr_text"] = ""
            st.success("클립보드 이미지를 가져왔습니다.")

    uploaded_files = st.file_uploader(
        "PDF 또는 이미지 파일",
        type=["pdf", "png", "jpg", "jpeg", "webp"],
        accept_multiple_files=True,
    )

    pages: list[PageImage] = []
    if uploaded_files:
        pages.extend(load_pages_for_uploads(uploaded_files))

    clipboard_page_path = st.session_state.get("clipboard_page_path")
    if clipboard_page_path and Path(clipboard_page_path).exists():
        pages.append(register_image_page(Path(clipboard_page_path), "클립보드 이미지"))

    if not uploaded_files and not clipboard_page_path:
        st.info("PDF/이미지를 올리거나, 캡처한 사진을 클립보드에서 붙여넣으세요.")
        return

    if not pages:
        st.warning("표시할 수 있는 페이지가 없습니다. PDF가 손상되었거나 빈 파일일 수 있습니다.")
        return

    with st.expander("업로드 전체 문제 감지/분류", expanded=True):
        st.caption("업로드한 PDF/이미지 전체에서 문제 번호를 찾아 문제 개수를 먼저 파악합니다. 번호를 못 찾은 페이지/이미지는 전체를 1문제로 처리합니다.")
        use_ai_for_batch = st.checkbox("감지된 문제를 AI로 분류", value=False)
        if st.button("업로드 전체 문제 개수 파악 및 분류", type="primary"):
            with st.spinner("업로드 전체에서 문제를 감지하고 분류하는 중입니다..."):
                st.session_state["detected_candidates"] = detect_problem_candidates(pages, use_ai=use_ai_for_batch)

        detected_candidates = st.session_state.get("detected_candidates", [])
        if detected_candidates:
            problem_count = sum(1 for candidate in detected_candidates if candidate.get("kind") == "문제")
            solution_count = sum(1 for candidate in detected_candidates if candidate.get("kind") == "해설")
            st.success(f"총 {len(detected_candidates)}개 후보를 감지했습니다. 문제 {problem_count}개, 해설 {solution_count}개")
            if st.button("감지된 문제 전체 저장", type="secondary"):
                saved_count = 0
                for candidate in detected_candidates:
                    save_detected_candidate(candidate)
                    saved_count += 1
                st.success(f"{saved_count}개 후보를 저장했습니다.")

            for index, candidate in enumerate(detected_candidates[:30], start=1):
                suggestion = candidate["suggestion"]
                with st.container(border=True):
                    col_img, col_info = st.columns([1, 1.4])
                    with col_img:
                        st.image(candidate["crop_image_path"], caption=f"{index}번 후보", width="stretch")
                    with col_info:
                        kind_key = f"candidate_kind_{index}_{candidate['crop_image_path']}"
                        selected_kind = st.radio(
                            "후보 종류",
                            ["문제", "해설"],
                            index=0 if candidate.get("kind") == "문제" else 1,
                            horizontal=True,
                            key=kind_key,
                        )
                        candidate["kind"] = selected_kind
                        st.write(f"원본: {candidate['source_filename']} / {candidate['page_number']}p")
                        st.write(f"감지 문제 번호: {candidate['problem_number'] or '-'}")
                        if selected_kind == "문제":
                            st.write(
                                f"추천 단원: {suggestion.get('subject') or '-'} > "
                                f"{suggestion.get('chapter') or '-'} > {suggestion.get('section') or '-'}"
                            )
                            st.write(f"추천 난이도: {suggestion.get('difficulty') or '-'}")
                            st.write(f"유형 태그: {', '.join(suggestion.get('topic_tags', [])) or '-'}")
                            st.write(f"추천 이유: {suggestion.get('reason') or '-'}")
                            st.write(f"신뢰도: {round(float(suggestion.get('confidence', 0.0)) * 100)}%")
                        else:
                            matched = find_problem_for_solution(candidate.get("problem_number", ""), candidate["source_filename"])
                            if matched:
                                st.write(f"연결될 문제: {matched['source_filename']} / {matched['page_number']}p / {matched['problem_number'] or '-'}")
                            else:
                                st.warning("같은 문제 번호의 저장된 문제를 아직 찾지 못했습니다. 문제를 먼저 저장하면 번호 기준으로 연결됩니다.")
                        if candidate["similar_label"]:
                            st.write(f"가장 비슷한 기존 문제: {round(candidate['similar_score'] * 100)}% / {candidate['similar_label']}")
                        if candidate.get("ocr_text"):
                            with st.expander("OCR 텍스트"):
                                st.write(candidate["ocr_text"])
            if len(detected_candidates) > 30:
                st.caption("미리보기는 30개까지만 표시합니다. 저장은 전체 후보에 적용됩니다.")

    if uploaded_files:
        kinds = uploaded_file_kinds(uploaded_files)
        image_pages = [page for page in pages if Path(page.stored_filename).suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
        with st.expander("일괄 등록", expanded=False):
            if "image" in kinds:
                st.write(f"이미지 파일 {len(image_pages)}개 감지됨")
                if len(image_pages) > 10:
                    st.warning("이미지는 한 번에 최대 10개까지만 등록합니다.")
                if st.button("이미지들을 각각 한 문제로 일괄 저장", type="secondary"):
                    saved_count = bulk_save_image_pages(image_pages, limit=10)
                    st.success(f"{saved_count}개 이미지를 각각 한 문제로 저장했습니다.")
            if "pdf" in kinds:
                st.write(f"PDF 렌더링 페이지 {len(pages)}개")
                st.caption("각 페이지에서 문제 번호를 감지해 문제별로 잘라 저장합니다. OCR 품질에 따라 일부 문제는 누락될 수 있습니다.")
                if st.button("PDF 전체에서 문제 자동 분리 후 일괄 저장", type="secondary"):
                    with st.spinner("PDF 전체에서 문제를 감지하고 저장하는 중입니다..."):
                        saved_count, detected_count = bulk_auto_save_pdf_pages(pages)
                    if saved_count:
                        st.success(f"문제 후보 {detected_count}개 감지, {saved_count}개 저장 완료")
                    else:
                        st.warning("감지된 문제가 없습니다. 문제 번호가 선명한 PDF인지 확인하거나 페이지별 수동 저장을 사용하세요.")

    page = page_selector(pages)
    if page is None:
        return

    image = Image.open(page.image_path).convert("RGB")

    with st.expander("여러 문제가 있는 페이지 자동 분리", expanded=False):
        st.caption("현재 페이지에서 문제 번호를 찾아 문제별 영역을 자동으로 잘라 저장합니다. 스캔 품질과 번호 형식에 따라 결과를 확인해야 합니다.")
        preview_boxes = auto_problem_boxes(image)
        st.write(f"감지된 문제 후보: {len(preview_boxes)}개")
        if preview_boxes:
            st.write(", ".join(f"{item['problem_number']}번" for item in preview_boxes[:30]))
        if st.button("현재 페이지 문제 자동 저장", type="secondary"):
            saved_count = auto_save_page_problems(page, image)
            if saved_count:
                st.success(f"{saved_count}개 문제를 자동 저장했습니다.")
            else:
                st.warning("자동으로 감지된 문제가 없습니다. 문제 번호가 보이게 캡처하거나 수동 저장을 사용하세요.")

    use_partial_crop = st.checkbox("이미지 일부분만 저장하기", value=False)
    if use_partial_crop:
        bbox = bbox_sliders(image)
    else:
        bbox = full_image_bbox(image)
        st.caption("현재는 올린 이미지 전체를 한 문제로 저장합니다.")

    crop = crop_image(page.image_path, bbox)

    left, right = st.columns([1.2, 1])
    with left:
        st.image(image, caption="올린 이미지", width="stretch")
    with right:
        st.image(crop, caption="저장될 문제 영역", width="stretch")
        if st.button("OCR 참고 텍스트 가져오기"):
            st.session_state["ocr_text"] = run_ocr(crop)

    with st.expander("선택 입력: 텍스트/수식/선택지", expanded=False):
        st.caption("이미지 유사도 검색만 쓸 거면 비워둬도 됩니다. OCR은 참고용이라 수식은 틀릴 수 있습니다.")
        if st.session_state.get("ocr_text"):
            st.text_area("OCR 참고 결과", value=st.session_state["ocr_text"], height=120, disabled=True)
        use_ocr_text = st.checkbox("OCR 참고 결과를 문제 텍스트로 사용", value=False)
        text_default = st.session_state.get("ocr_text", "") if use_ocr_text else ""
        problem_text = st.text_area("문제 텍스트", value=text_default, height=120)
        latex = st.text_area("수식 LaTeX 또는 핵심 수식", height=80)
        choices = st.text_area("선택지", height=80)

    suggestion_ocr = get_suggestion_ocr(crop, page)
    suggestion_text = " ".join(part for part in [problem_text, latex, suggestion_ocr] if part)
    rule_suggestion = suggest_metadata(suggestion_text, latex, page.original_filename)
    crop_digest = hashlib.sha256(image_to_png_bytes(crop)).hexdigest()
    ai_suggestion_key = f"ai_suggestion_{page.stored_filename}_{page.page_number}_{crop_digest}"

    ai_provider = st.session_state.get("ai_provider", "Gemini")
    if ai_provider == "Gemini":
        ai_api_key = st.session_state.get("gemini_api_key", "") or os.getenv("GEMINI_API_KEY", "")
        ai_model = st.session_state.get("gemini_model", "gemini-2.5-flash")
    else:
        ai_api_key = st.session_state.get("openai_api_key", "") or os.getenv("OPENAI_API_KEY", "")
        ai_model = st.session_state.get("openai_model", "gpt-4.1-mini")
    col_ai_1, col_ai_2 = st.columns([1, 3])
    with col_ai_1:
        run_ai = st.button("AI로 자동 분류", type="secondary")
    with col_ai_2:
        st.caption("API 키를 입력한 뒤 누르면 이미지 자체를 보고 과목/단원/난이도를 추천합니다.")

    if run_ai:
        if not ai_api_key:
            st.warning(f"사이드바에 {ai_provider} API 키를 입력하세요.")
        else:
            with st.spinner(f"{ai_provider}가 문제 이미지를 분류하는 중입니다..."):
                try:
                    if ai_provider == "Gemini":
                        st.session_state[ai_suggestion_key] = ai_classify_problem_gemini(
                            image=crop,
                            api_key=ai_api_key,
                            model=ai_model,
                            ocr_text=suggestion_ocr,
                            latex=latex,
                            source_filename=page.original_filename,
                        )
                    else:
                        st.session_state[ai_suggestion_key] = ai_classify_problem_openai(
                            image=crop,
                            api_key=ai_api_key,
                            model=ai_model,
                            ocr_text=suggestion_ocr,
                            latex=latex,
                            source_filename=page.original_filename,
                        )
                    st.success("AI 분류 추천을 가져왔습니다.")
                except Exception as exc:
                    st.error(f"AI 분류 실패: {exc}")

    suggestion = st.session_state.get(ai_suggestion_key, rule_suggestion)
    suggestion_source = "AI" if ai_suggestion_key in st.session_state else "규칙 기반"

    with st.container(border=True):
        st.markdown(f"**자동 추천값 ({suggestion_source})**")
        st.write(
            f"추천: {suggestion['subject'] or '-'} / {suggestion['chapter'] or '-'} / "
            f"{suggestion['section'] or '-'} / {suggestion['difficulty'] or '-'}"
        )
        st.write(f"유형 태그: {', '.join(suggestion['topic_tags']) or '-'}")
        st.write(f"추천 이유: {suggestion['reason']}")
        st.write(f"신뢰도: {round(suggestion['confidence'] * 100)}%")
        if suggestion["needs_review"]:
            st.warning("자동 추천 신뢰도가 낮거나 복합단원 가능성이 있습니다. 저장 전 확인하세요.")

    st.markdown("**검토 후 저장할 메타데이터**")
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        problem_number = ""
        subject_values = subject_options()
        suggested_subject = suggestion["subject"] if suggestion["subject"] in TAXONOMY else ""
        subject = st.selectbox("과목", subject_values, index=subject_values.index(suggested_subject))
    with col_b:
        chapter_values = chapter_options(subject)
        suggested_chapter = suggestion["chapter"] if suggestion["chapter"] in chapter_values else ""
        chapter = st.selectbox("대단원", chapter_values, index=chapter_values.index(suggested_chapter))
        section_values = section_options(subject, chapter)
        suggested_section = suggestion["section"] if suggestion["section"] in section_values else ""
        section = st.selectbox("소단원", section_values, index=section_values.index(suggested_section))
    with col_c:
        suggested_difficulty = suggestion["difficulty"] if suggestion["difficulty"] in DIFFICULTY_OPTIONS else ""
        difficulty = st.selectbox(
            "난이도",
            DIFFICULTY_OPTIONS,
            index=DIFFICULTY_OPTIONS.index(suggested_difficulty),
        )
        is_solution = st.checkbox("해설 영역")

    topic_tags = st.text_input("유형 태그", value=", ".join(suggestion["topic_tags"]))
    method_tags = topic_tags
    subtype = section
    difficulty_reason = st.text_input("난이도 추천 이유", value=suggestion["difficulty_reason"])
    answer = st.text_input("정답")
    solution_text = st.text_area("풀이/해설 텍스트", height=90)
    memo = st.text_area("추천용 메모", height=70)

    if st.button("올린 이미지 전체를 문제로 저장", type="primary"):
        problem_id = save_problem(
            page=page,
            bbox=bbox,
            problem_text=problem_text,
            latex=latex,
            choices=choices,
            problem_number=problem_number,
            chapter=chapter,
            subtype=subtype,
            method_tags=method_tags,
            difficulty=difficulty,
            is_solution=is_solution,
            subject=subject,
            section=section,
            topic_tags=topic_tags,
            difficulty_reason=difficulty_reason,
            answer=answer,
            solution_text=solution_text,
            memo=memo,
            suggestion_reason=suggestion["reason"],
            confidence_score=float(suggestion["confidence"]),
        )
        st.success(f"저장 완료: {problem_id}")


def search_tab() -> None:
    st.subheader("유사 문제 검색")
    rows = all_problems()
    if not rows:
        st.info("먼저 문제를 하나 이상 저장하세요.")
        return

    pasted_query_image = paste_image_area(
        label="검색할 문제 이미지를 Ctrl+V로 붙여넣기",
        hint="영역을 클릭한 뒤 캡처 이미지를 붙여넣으면 검색 입력 이미지로 들어갑니다.",
        key="search_paste_area",
    )
    if pasted_query_image is not None:
        pasted_bytes = image_to_png_bytes(pasted_query_image)
        pasted_digest = hashlib.sha256(pasted_bytes).hexdigest()
        if st.session_state.get("last_query_paste_digest") != pasted_digest:
            st.session_state["query_clipboard_image"] = pasted_bytes
            st.session_state["query_ocr_text"] = run_ocr(pasted_query_image)
            st.session_state["last_query_paste_digest"] = pasted_digest
            st.success("붙여넣은 이미지를 검색 입력으로 가져왔습니다.")

    if st.button("검색 이미지 클립보드에서 가져오기", help="Ctrl+V가 불편할 때 Windows 클립보드를 직접 읽습니다."):
        clipboard_image = grab_clipboard_image()
        if clipboard_image is not None:
            st.session_state["query_clipboard_image"] = image_to_png_bytes(clipboard_image)
            st.session_state["query_ocr_text"] = run_ocr(clipboard_image)
            st.success("클립보드 이미지를 검색 입력으로 가져왔습니다.")

    query_image_file = st.file_uploader("검색할 문제 캡처 이미지", type=["png", "jpg", "jpeg", "webp"])
    query_image: Image.Image | None = None
    if query_image_file is not None:
        query_image = Image.open(query_image_file).convert("RGB")
    elif st.session_state.get("query_clipboard_image"):
        query_image = Image.open(io.BytesIO(st.session_state["query_clipboard_image"])).convert("RGB")

    if query_image is not None:
        st.image(query_image, caption="입력 문제 이미지", width=420)
        if st.button("입력 이미지 OCR 다시 실행"):
            st.session_state["query_ocr_text"] = run_ocr(query_image)

    query = st.text_area("입력 문제 텍스트", value=st.session_state.get("query_ocr_text", ""), height=160)
    latex = st.text_area("핵심 수식 또는 LaTeX", height=80)
    col1, col2, col3 = st.columns(3)
    with col1:
        chapter = st.text_input("단원 힌트")
    with col2:
        subtype = st.text_input("세부 유형 힌트")
    with col3:
        method_tags = st.text_input("풀이 태그 힌트")
    difficulty = st.selectbox("난이도 힌트", DIFFICULTY_OPTIONS)
    use_image_similarity = st.checkbox("이미지 유사도 함께 사용", value=query_image is not None)
    image_weight_percent = st.slider(
        "이미지 유사도 반영 비율",
        0,
        90,
        45,
        help="높일수록 수식/레이아웃 모양이 비슷한 문제를 더 우선합니다. 낮출수록 단원/태그/텍스트를 더 우선합니다.",
    )

    if st.button("관련 문제 찾기", type="primary"):
        if not query.strip() and not latex.strip() and query_image is None:
            st.warning("검색할 문제 텍스트, 수식, 또는 이미지를 입력하세요.")
            return
        profile = analyze_query(query, latex, chapter, subtype, method_tags, difficulty)
        query_feature = image_feature(query_image) if query_image is not None and use_image_similarity else None
        st.write("검색 프로필", profile)
        st.info(related_concept_note(profile))
        results = search_problems(
            profile,
            rows,
            query_image_feature=query_feature,
            image_weight=image_weight_percent / 100,
        )

        for result in results[:20]:
            row = result["row"]
            score_percent = round(result["score"] * 100)
            image_percent = round(result["image_score"] * 100)
            concept_percent = round(result["concept_score"] * 100)
            with st.container(border=True):
                col_img, col_meta = st.columns([1, 1.2])
                with col_img:
                    st.image(row["crop_image_path"], width="stretch")
                with col_meta:
                    st.markdown(f"**관련도: {score_percent}%**")
                    st.write(f"이미지 유사도: {image_percent}% / 개념 유사도: {concept_percent}%")
                    st.write(f"원본 파일: {row['source_filename']}")
                    st.write(f"페이지: {row['page_number']}p")
                    st.write(f"문제 번호: {row['problem_number'] or '-'}")
                    st.write(f"관련 이유: {result['reason']}")
                    st.write(f"단원: {row['subject'] or '미분류'} > {row['chapter'] or '-'} > {row['section'] or row['subtype'] or '-'}")
                    st.write(f"풀이 태그: {row['method_tags'] or '-'}")
                    st.write(f"난이도: {row['difficulty'] or '-'}")
                    if st.button("원본 페이지 보기", key=f"page-{row['id']}"):
                        st.image(row["page_image_path"], caption="원본 페이지", width="stretch")
                    solutions = get_solutions_for_problem(row["id"], row["problem_number"] or "", row["source_filename"])
                    if solutions:
                        with st.expander(f"정답/풀이 보기 ({len(solutions)}개)"):
                            for solution in solutions:
                                st.image(solution["solution_image_path"], caption=f"해설: {solution['source_filename']} / {solution['page_number']}p", width="stretch")
                                if solution["solution_text"] or solution["ocr_text"]:
                                    st.write(solution["solution_text"] or solution["ocr_text"])


def library_tab() -> None:
    st.subheader("라이브러리")
    rows = all_problems()
    st.caption(f"총 {len(rows)}개")
    if not rows:
        st.info("저장된 문제가 없습니다.")
        return

    subjects = ["전체", *sorted({row["subject"] or "미분류" for row in rows})]
    selected_subject = st.selectbox("과목 필터", subjects)
    filtered_rows = [
        row for row in rows
        if selected_subject == "전체" or (row["subject"] or "미분류") == selected_subject
    ]
    chapters = ["전체", *sorted({row["chapter"] or "미분류" for row in filtered_rows})]
    selected_chapter = st.selectbox("대단원 필터", chapters)
    filtered_rows = [
        row for row in filtered_rows
        if selected_chapter == "전체" or (row["chapter"] or "미분류") == selected_chapter
    ]
    difficulties = ["전체", *DIFFICULTY_OPTIONS[1:]]
    selected_difficulty = st.selectbox("난이도 필터", difficulties)
    if selected_difficulty != "전체":
        filtered_rows = [row for row in filtered_rows if row["difficulty"] == selected_difficulty]

    sort_mode = st.selectbox("정렬", ["단원순", "난이도순", "최근 업로드순", "원본 문제집 순서"])
    difficulty_order = {label: index for index, label in enumerate(DIFFICULTY_OPTIONS)}
    if sort_mode == "단원순":
        filtered_rows = sorted(
            filtered_rows,
            key=lambda row: (
                row["subject"] or "미분류",
                row["chapter"] or "미분류",
                row["section"] or row["subtype"] or "미분류",
                difficulty_order.get(row["difficulty"] or "", 0),
                row["source_filename"],
                row["page_number"],
                row["problem_number"] or "",
            ),
        )
    elif sort_mode == "난이도순":
        filtered_rows = sorted(filtered_rows, key=lambda row: difficulty_order.get(row["difficulty"] or "", 0))
    elif sort_mode == "원본 문제집 순서":
        filtered_rows = sorted(filtered_rows, key=lambda row: (row["source_filename"], row["page_number"], row["problem_number"] or ""))

    grouped: dict[tuple[str, str, str], list[sqlite3.Row]] = {}
    for row in filtered_rows:
        key = (
            row["subject"] or "미분류",
            row["chapter"] or "미분류",
            row["section"] or row["subtype"] or "미분류",
        )
        grouped.setdefault(key, []).append(row)

    st.write(f"표시 중: {len(filtered_rows)}개")
    for (subject, chapter, section), group_rows in grouped.items():
        with st.expander(f"{subject} > {chapter} > {section} ({len(group_rows)}개)", expanded=False):
            for row in group_rows:
                with st.container(border=True):
                    col1, col2 = st.columns([1, 1.5])
                    with col1:
                        st.image(row["crop_image_path"], width="stretch")
                    with col2:
                        st.write(f"원본: {row['source_filename']} / {row['page_number']}p / {row['problem_number'] or '-'}")
                        st.write(f"난이도: {row['difficulty'] or '-'}")
                        st.write(f"유형 태그: {row['method_tags'] or '-'}")
                        if row["answer"]:
                            st.write(f"정답: {row['answer']}")
                        if row["problem_text"]:
                            st.write(row["problem_text"])
                        if row["latex"]:
                            st.code(row["latex"], language="latex")
                        if row["suggestion_reason"]:
                            st.caption(f"자동 추천 근거: {row['suggestion_reason']}")
                        solutions = get_solutions_for_problem(row["id"], row["problem_number"] or "", row["source_filename"])
                        if solutions:
                            with st.expander(f"정답/풀이 보기 ({len(solutions)}개)"):
                                for solution in solutions:
                                    st.image(solution["solution_image_path"], caption=f"해설: {solution['source_filename']} / {solution['page_number']}p", width="stretch")
                                    if solution["solution_text"] or solution["ocr_text"]:
                                        st.write(solution["solution_text"] or solution["ocr_text"])


def main() -> None:
    st.set_page_config(page_title="편입수학 문제 검색 MVP", layout="wide")
    st.title("편입수학 문제 검색 MVP")
    st.caption("반자동 문제 영역 지정, OCR, 문제 단위 저장, 관련 문제 검색")
    connect_db().close()

    with st.sidebar:
        st.subheader("상태")
        if configure_tesseract() and tesseract_langs_ready():
            st.success("Tesseract OCR 사용 가능")
        elif configure_tesseract():
            st.warning("Tesseract OCR 언어팩 필요")
            st.caption(f"앱 전용 언어팩 폴더: {TESSDATA_DIR}")
        else:
            st.warning("Tesseract OCR 미설치")
            st.caption("설치 전에도 문제 텍스트를 직접 입력해서 저장/검색할 수 있습니다.")

        st.subheader("AI 분류")
        st.session_state["ai_provider"] = st.selectbox(
            "AI 제공자",
            ["Gemini", "OpenAI"],
            index=["Gemini", "OpenAI"].index(st.session_state.get("ai_provider", "Gemini")),
        )
        st.session_state["gemini_api_key"] = st.text_input(
            "Gemini API 키",
            value=st.session_state.get("gemini_api_key", ""),
            type="password",
            help="브라우저 세션에만 보관합니다. 코드나 DB에 저장하지 않습니다.",
        )
        st.session_state["gemini_model"] = st.text_input(
            "Gemini 모델",
            value=st.session_state.get("gemini_model", "gemini-2.5-flash"),
            help="이미지 입력을 지원하는 Gemini 모델을 입력하세요.",
        )
        st.session_state["openai_api_key"] = st.text_input(
            "OpenAI API 키",
            value=st.session_state.get("openai_api_key", ""),
            type="password",
            help="브라우저 세션에만 보관합니다. 코드나 DB에 저장하지 않습니다.",
        )
        st.session_state["openai_model"] = st.text_input(
            "분류 모델",
            value=st.session_state.get("openai_model", "gpt-4.1-mini"),
            help="이미지 입력을 지원하는 OpenAI 모델을 입력하세요.",
        )
        if OpenAI is None:
            st.warning("openai 패키지가 설치되지 않았습니다.")
        if genai is None:
            st.warning("google-genai 패키지가 설치되지 않았습니다.")

    tab_ingest, tab_search, tab_library = st.tabs(["문제 저장", "문제 검색", "라이브러리"])
    with tab_ingest:
        ingest_tab()
    with tab_search:
        search_tab()
    with tab_library:
        library_tab()


if __name__ == "__main__":
    main()
