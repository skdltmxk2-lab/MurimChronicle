"use client";

export type ImageSize = {
  width: number;
  height: number;
};

export type ImagePoint = {
  x: number;
  y: number;
};

export type ImageRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DisplayBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ResizeHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export type NormalizedImage = {
  blob: Blob;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceType: string;
  scaledDown: boolean;
};

export type PreparedProblemImage = {
  blob: Blob;
  rawCropBlob: Blob;
  mediaType: "image/png" | "image/jpeg";
  selection: ImageRect;
  cropSize: ImageSize;
  outputSize: ImageSize;
  preprocessing: string[];
};

export type PdfPageImage = NormalizedImage & {
  pageNumber: number;
  pageCount: number;
};

const MAX_SOURCE_SIDE = 10_000;
const MAX_OUTPUT_WIDTH = 4_096;
const MAX_OUTPUT_HEIGHT = 6_000;
const TARGET_TEXT_WIDTH = 1_600;
const MAX_UPSCALE = 3;
const MAX_PNG_BYTES = 7_500_000;
const OUTPUT_PADDING = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("이미지 변환에 실패했습니다."));
      },
      type,
      quality
    );
  });
}

async function decodeImage(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch {
      // Some clipboard image types only decode through HTMLImageElement.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function decodedSize(image: ImageBitmap | HTMLImageElement): ImageSize {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return { width: image.width, height: image.height };
  }
  const htmlImage = image as HTMLImageElement;
  return { width: htmlImage.naturalWidth, height: htmlImage.naturalHeight };
}

function closeDecodedImage(image: ImageBitmap | HTMLImageElement): void {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
}

export function fullImageRect(size: ImageSize): ImageRect {
  return { x: 0, y: 0, width: size.width, height: size.height };
}

export function minimumSelectionSize(size: ImageSize): ImageSize {
  return {
    width: Math.min(size.width, Math.max(32, Math.round(size.width * 0.015))),
    height: Math.min(size.height, Math.max(32, Math.round(size.height * 0.015))),
  };
}

export function clampImageRect(
  rect: ImageRect,
  imageSize: ImageSize,
  minSize: ImageSize = minimumSelectionSize(imageSize)
): ImageRect {
  const width = clamp(Math.abs(rect.width), minSize.width, imageSize.width);
  const height = clamp(Math.abs(rect.height), minSize.height, imageSize.height);
  const x = clamp(rect.width < 0 ? rect.x - width : rect.x, 0, imageSize.width - width);
  const y = clamp(rect.height < 0 ? rect.y - height : rect.y, 0, imageSize.height - height);
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function rectFromImagePoints(
  start: ImagePoint,
  end: ImagePoint,
  imageSize: ImageSize,
  minSize: ImageSize = minimumSelectionSize(imageSize)
): ImageRect {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  return clampImageRect(
    {
      x: left,
      y: top,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    },
    imageSize,
    minSize
  );
}

/**
 * Browser zoom, CSS scaling, scroll position, and devicePixelRatio are already
 * reflected by getBoundingClientRect(). Keep the selection in original image
 * pixels and convert only pointer coordinates through this function.
 */
export function clientPointToImagePoint(
  clientPoint: ImagePoint,
  displayBounds: DisplayBounds,
  imageSize: ImageSize
): ImagePoint {
  if (displayBounds.width <= 0 || displayBounds.height <= 0) return { x: 0, y: 0 };
  return {
    x: clamp(
      ((clientPoint.x - displayBounds.left) / displayBounds.width) * imageSize.width,
      0,
      imageSize.width
    ),
    y: clamp(
      ((clientPoint.y - displayBounds.top) / displayBounds.height) * imageSize.height,
      0,
      imageSize.height
    ),
  };
}

export function imageRectToDisplayRect(
  rect: ImageRect,
  displaySize: ImageSize,
  imageSize: ImageSize
): ImageRect {
  if (imageSize.width <= 0 || imageSize.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: (rect.x / imageSize.width) * displaySize.width,
    y: (rect.y / imageSize.height) * displaySize.height,
    width: (rect.width / imageSize.width) * displaySize.width,
    height: (rect.height / imageSize.height) * displaySize.height,
  };
}

export function resizeImageRect(
  initial: ImageRect,
  handle: ResizeHandle,
  point: ImagePoint,
  imageSize: ImageSize,
  minSize: ImageSize = minimumSelectionSize(imageSize)
): ImageRect {
  let left = initial.x;
  let top = initial.y;
  let right = initial.x + initial.width;
  let bottom = initial.y + initial.height;

  if (handle.includes("w")) left = clamp(point.x, 0, right - minSize.width);
  if (handle.includes("e")) right = clamp(point.x, left + minSize.width, imageSize.width);
  if (handle.includes("n")) top = clamp(point.y, 0, bottom - minSize.height);
  if (handle.includes("s")) bottom = clamp(point.y, top + minSize.height, imageSize.height);

  return clampImageRect(
    { x: left, y: top, width: right - left, height: bottom - top },
    imageSize,
    minSize
  );
}

export async function normalizeImageBlob(blob: Blob): Promise<NormalizedImage> {
  const decoded = await decodeImage(blob);
  try {
    const source = decodedSize(decoded);
    if (!source.width || !source.height) throw new Error("이미지 크기를 확인할 수 없습니다.");

    const scale = Math.min(1, MAX_SOURCE_SIDE / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("이미지 처리용 Canvas를 만들 수 없습니다.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(decoded, 0, 0, width, height);

    return {
      blob: await canvasToBlob(canvas, "image/png"),
      width,
      height,
      sourceWidth: source.width,
      sourceHeight: source.height,
      sourceType: blob.type || "unknown",
      scaledDown: scale < 1,
    };
  } finally {
    closeDecodedImage(decoded);
  }
}

function findConservativeContentBounds(canvas: HTMLCanvasElement): ImageRect {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fullImageRect(canvas);
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const step = Math.max(1, Math.ceil(Math.sqrt((width * height) / 2_500_000)));
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      const maxChannel = Math.max(data[i], data[i + 1], data[i + 2]);
      const minChannel = Math.min(data[i], data[i + 1], data[i + 2]);
      const luminance = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      const isContent = alpha > 20 && (luminance < 244 || maxChannel - minChannel > 14);
      if (!isContent) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) return fullImageRect(canvas);

  const maxTrimX = Math.round(width * 0.12);
  const maxTrimY = Math.round(height * 0.12);
  const contentPadding = Math.max(8, Math.round(Math.min(width, height) * 0.018));
  const left = Math.min(maxTrimX, Math.max(0, minX - contentPadding));
  const top = Math.min(maxTrimY, Math.max(0, minY - contentPadding));
  const right = Math.max(
    width - maxTrimX,
    Math.min(width, maxX + step + contentPadding)
  );
  const bottom = Math.max(
    height - maxTrimY,
    Math.min(height, maxY + step + contentPadding)
  );
  return {
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

export async function prepareProblemImage(
  sourceBlob: Blob,
  requestedSelection: ImageRect
): Promise<PreparedProblemImage> {
  const decoded = await decodeImage(sourceBlob);
  try {
    const imageSize = decodedSize(decoded);
    const selection = clampImageRect(requestedSelection, imageSize);
    const rawCanvas = document.createElement("canvas");
    rawCanvas.width = selection.width;
    rawCanvas.height = selection.height;
    const rawCtx = rawCanvas.getContext("2d");
    if (!rawCtx) throw new Error("선택 영역을 자를 수 없습니다.");
    rawCtx.fillStyle = "#ffffff";
    rawCtx.fillRect(0, 0, rawCanvas.width, rawCanvas.height);
    rawCtx.drawImage(
      decoded,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    );

    const rawCropBlob = await canvasToBlob(rawCanvas, "image/png");
    const content = findConservativeContentBounds(rawCanvas);
    const preprocessing = ["투명 배경을 흰색으로 변환"];
    if (
      content.x > 0 ||
      content.y > 0 ||
      content.width < rawCanvas.width ||
      content.height < rawCanvas.height
    ) {
      preprocessing.push("바깥쪽 빈 여백을 보수적으로 정리");
    }

    let scale = 1;
    if (content.width < TARGET_TEXT_WIDTH) {
      scale = Math.min(MAX_UPSCALE, TARGET_TEXT_WIDTH / content.width);
    }
    scale = Math.min(
      scale,
      (MAX_OUTPUT_WIDTH - OUTPUT_PADDING * 2) / content.width,
      (MAX_OUTPUT_HEIGHT - OUTPUT_PADDING * 2) / content.height
    );
    if (scale > 1.01) preprocessing.push(`작은 글씨를 ${scale.toFixed(2)}배 확대`);
    if (scale < 0.99) preprocessing.push(`과대 이미지를 ${scale.toFixed(2)}배 축소`);

    const innerWidth = Math.max(1, Math.round(content.width * scale));
    const innerHeight = Math.max(1, Math.round(content.height * scale));
    const output = document.createElement("canvas");
    output.width = innerWidth + OUTPUT_PADDING * 2;
    output.height = innerHeight + OUTPUT_PADDING * 2;
    const outputCtx = output.getContext("2d");
    if (!outputCtx) throw new Error("전처리 이미지를 만들 수 없습니다.");
    outputCtx.fillStyle = "#ffffff";
    outputCtx.fillRect(0, 0, output.width, output.height);
    outputCtx.imageSmoothingEnabled = true;
    outputCtx.imageSmoothingQuality = "high";
    outputCtx.filter = "contrast(1.08) brightness(1.015)";
    outputCtx.drawImage(
      rawCanvas,
      content.x,
      content.y,
      content.width,
      content.height,
      OUTPUT_PADDING,
      OUTPUT_PADDING,
      innerWidth,
      innerHeight
    );
    outputCtx.filter = "none";
    preprocessing.push("문서용 약한 대비·밝기 보정");
    preprocessing.push("AI 판독용 흰색 안전 여백 추가");

    let mediaType: "image/png" | "image/jpeg" = "image/png";
    let outputBlob = await canvasToBlob(output, "image/png");
    if (outputBlob.size > MAX_PNG_BYTES) {
      mediaType = "image/jpeg";
      outputBlob = await canvasToBlob(output, "image/jpeg", 0.96);
      preprocessing.push("대용량 PNG를 고품질 JPEG로 압축");
    }

    return {
      blob: outputBlob,
      rawCropBlob,
      mediaType,
      selection,
      cropSize: { width: rawCanvas.width, height: rawCanvas.height },
      outputSize: { width: output.width, height: output.height },
      preprocessing,
    };
  } finally {
    closeDecodedImage(decoded);
  }
}

export async function rotateImageBlob(sourceBlob: Blob, clockwise = true): Promise<NormalizedImage> {
  const decoded = await decodeImage(sourceBlob);
  try {
    const source = decodedSize(decoded);
    const canvas = document.createElement("canvas");
    canvas.width = source.height;
    canvas.height = source.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("이미지를 회전할 수 없습니다.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(clockwise ? Math.PI / 2 : -Math.PI / 2);
    ctx.drawImage(decoded, -source.width / 2, -source.height / 2);
    return {
      blob: await canvasToBlob(canvas, "image/png"),
      width: canvas.width,
      height: canvas.height,
      sourceWidth: source.width,
      sourceHeight: source.height,
      sourceType: sourceBlob.type || "unknown",
      scaledDown: false,
    };
  } finally {
    closeDecodedImage(decoded);
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("클립보드 이미지를 읽지 못했습니다.");
  return response.blob();
}

let pdfWorkerConfigured = false;

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfWorkerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfWorkerConfigured = true;
  }
  return pdfjs;
}

export async function renderPdfPage(file: File, requestedPage: number): Promise<PdfPageImage> {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdfDocument = await loadingTask.promise;
  try {
    const pageNumber = clamp(Math.floor(requestedPage) || 1, 1, pdfDocument.numPages);
    const page = await pdfDocument.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    let scale = 240 / 72;
    scale = Math.min(
      scale,
      MAX_OUTPUT_WIDTH / baseViewport.width,
      MAX_OUTPUT_HEIGHT / baseViewport.height
    );
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("PDF 페이지를 렌더링할 수 없습니다.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
      background: "#ffffff",
      intent: "display",
    }).promise;
    const blob = await canvasToBlob(canvas, "image/png");
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      sourceWidth: Math.round(baseViewport.width),
      sourceHeight: Math.round(baseViewport.height),
      sourceType: "application/pdf",
      scaledDown: scale < 240 / 72,
      pageNumber,
      pageCount: pdfDocument.numPages,
    };
  } finally {
    await pdfDocument.destroy();
  }
}
