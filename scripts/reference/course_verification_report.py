"""Assemble anonymized course verification results for the admin report page.

Run the analog, advanced and Lab5 reference runners before this script. The
report contains measured results and explicit missing comparisons. Student
documents, identities, audio and absolute source paths stay on this computer.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output/course-verification"


def lab5_cases() -> list[dict]:
    app = json.loads((ROOT / "tmp/lab5-reference/app-results.json").read_text(encoding="utf-8"))
    independent = json.loads((ROOT / "tmp/lab5-reference/results/comparison.json").read_text(encoding="utf-8"))
    native = {item["id"]: item for item in independent["cases"]}
    records = []
    for item in app["cases"]:
        definition = item["definition"]
        case_id, ratio = item["caseId"], item["ratio"]
        number = definition["circuitNumber"]
        full = native[f"circuit{number}-ratio{ratio[0]}-course-full-27C"]
        metrics = []

        def metric(label, key, value, reference=None, unit="V", basis="pdf-simulation"):
            error = abs(value - reference) if reference is not None else None
            metrics.append({"label": label, "key": key, "value": value, "unit": unit, "basis": basis,
                            **({"reference": reference, "relativeErrorPercent": error / abs(reference) * 100 if reference else 0,
                                "tolerance": {"relative": .01, "absolute": 1e-6,
                                              "description": "원문 시뮬레이션과 1% 또는 1 µV 비교 기준. 실물 부품 공차와 별개입니다."},
                                "status": "pass" if error <= 1e-6 + abs(reference) * .01 else "mismatch"}
                               if reference is not None else {"status": "reported"})})

        if case_id.endswith("dc"):
            for net, reference in {"OUT1": 6.553, "OUT2": 6.553, "TAIL": 2.298, "B3": 1.137, "B1": 2.923, "B2": 2.923}.items():
                metric(f"{net} DC · 사이트", f"dc_{net}", item["result"]["dc"]["nodeVoltages"][net], reference)
                metric(f"{net} DC · 독립 SPICE", f"ngspice_dc_{net}", full["dc"][f"v({net.lower()})"], reference, basis="independent-spice")
        elif number < 3:
            reference = (1.8815 if number == 1 else .43212) if ratio == "1:1" else None
            metric("OUT1 half Vpp · 사이트", "halfVpp_OUT1", item["measurements"]["halfVpp"]["OUT1"], reference)
            metric("OUT1 half Vpp · 독립 SPICE", "ngspice_halfVpp_OUT1", full["measurements"]["v(out1)"]["peakToPeakV"] / 2, reference, basis="independent-spice")
        else:
            for frequency, reference in [(9000, .153763), (10000, .875423), (11000, .153721)]:
                target = reference if ratio == "1:1" else None
                metric(f"차동 {frequency / 1000:g} kHz peak · 사이트", f"tone_{frequency}", item["measurements"]["tonePeak"][str(frequency)], target)
                metric(f"차동 {frequency / 1000:g} kHz peak · 독립 SPICE", f"ngspice_tone_{frequency}", full["measurements"]["outdiff"]["tonePeakV"][str(frequency)], target, basis="independent-spice")
        compared = [m for m in metrics if "reference" in m and not m["key"].startswith("ngspice_")]
        status = "reference-missing" if not compared else "pass" if all(m["status"] == "pass" for m in compared) else "mismatch"
        record = {"id": f"lab-5-{case_id}-{ratio.replace(':', 'to')}", "experimentId": "lab-5",
                  "title": f"{definition['label']} · 권선비 {ratio}" if number > 1 else definition["label"],
                  "kind": "analog", "status": status,
                  "sources": [{"label": "Lab5 예비 보고서", "pages": list(range(1, 11))}, {"label": "Lab5 결과 보고서", "pages": list(range(1, 16))}],
                  "conditions": [definition["condition"], definition["sourcePages"], f"권선비 {ratio} 가정"], "metrics": metrics,
                  "notes": ["사이트의 축약 Ebers–Moll 모델은 300 K, 독립 ngspice 47의 수업 전체 모델은 원문과 같은 27 °C입니다.",
                            "권선비·권선저항·인덕턴스는 원문에 없어서 1차 대 전체 2차 권선비를 명시한 시나리오로 비교합니다.",
                            "PDF의 실측은 입력 조건·소자 편차가 달라 동일 수치의 통과 기준으로 사용하지 않았습니다.",
                            "11 kHz는 본문 153.721 mV와 비교했습니다. 그래프의 10.989 kHz 마커 145.570 mV는 다른 좌표입니다."]}
        if not case_id.endswith("dc"):
            time = np.array(item["result"]["time"])
            values = np.array(item["measurements"]["differential"] if number == 3 else item["result"]["nodeVoltages"]["OUT1"])
            reference_file = ROOT / "tmp/lab5-reference/results" / f"circuit{number}-ratio{ratio[0]}-course-full-27C/transient.txt"
            names = reference_file.read_text(encoding="utf-8").splitlines()[0].split()
            data = np.loadtxt(reference_file, skiprows=1)
            indices = np.linspace(0, len(time) - 1, min(1024, len(time))).astype(int)
            axis = time[indices]
            reference_values = np.interp(axis, data[:, 0], data[:, names.index("outdiff" if number == 3 else "v(out1)")])
            record["waveform"] = {"time": axis.tolist(), "unit": "V", "series": [
                {"label": "사이트 계산", "values": values[indices].tolist()}, {"label": "독립 전체 SPICE", "values": reference_values.tolist()}]}
        records.append(record)
    return records


def normalize(record: dict) -> dict:
    raw_sources = record.get("sources", record.get("source", []))
    sources = [{"label": source.get("label", source.get("file", "수업 자료")), "pages": source.get("pages", [])} for source in raw_sources]
    result = {key: record[key] for key in ("id", "experimentId", "title", "kind", "status", "conditions", "metrics", "notes")}
    result["sources"] = sources
    for key in ("reason", "waveform", "reducedSolverMetrics", "modelComparison"):
        if key in record:
            result[key] = record[key]
    return result


def main() -> None:
    analog = json.loads((OUTPUT / "labs-0-4.json").read_text(encoding="utf-8"))
    advanced = json.loads((OUTPUT / "labs-6-10-project.json").read_text(encoding="utf-8"))
    records = [normalize(record) for record in analog["cases"]] + lab5_cases() + [normalize(record) for record in advanced["cases"]]
    identifiers = [record["id"] for record in records]
    if len(set(identifiers)) != len(identifiers):
        raise ValueError("Verification case IDs must be unique")
    report = {"schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(),
              "scope": "실험 0~10과 2022~2025 설계과제의 회로도·소프트웨어 수치 비교입니다. 각 행의 출처·조건·비교 기준을 확인하세요. 빵판 배치는 일반 830홀 모델 기준으로만 점검했고 실물 조립·측정은 수행하지 않았습니다.", "cases": records}
    content = json.dumps(report, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    # Identifiers that must stay out of the public report come from the environment, so no real value is committed.
    markers = [item for item in os.environ.get("COURSE_PRIVATE_MARKERS", "").split(",") if item]
    if "C:/Users/" in content or "C:\\\\Users\\\\" in content or any(marker in content for marker in markers):
        raise ValueError("Private source identity/path found in public report")
    destination = ROOT / "src/lib/electronics/course-verification-report.json"
    destination.write_text(content + "\n", encoding="utf-8")
    (OUTPUT / "verification-summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    print(json.dumps({"cases": len(records), "counts": {status: sum(row["status"] == status for row in records) for status in ["pass", "mismatch", "blocked", "reference-missing"]}}, ensure_ascii=False))


if __name__ == "__main__":
    main()
