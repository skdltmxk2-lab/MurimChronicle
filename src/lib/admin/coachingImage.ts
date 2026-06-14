"use client";

export type NormalizedImage = {
  blob: Blob;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceType: string;
  scaledDown: boolean;
};

export type PdfPageImage = NormalizedImage & {
  pageNumber: number;
  pageCount: number;
};

const MAX_SOURCE_SIDE = 10_000;
const MAX_OUTPUT_WIDTH = 4_096;
const MAX_OUTPUT_HEIGHT = 6_000;

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
      // 브라우저별 디코딩 fallback.
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

function decodedSize(image: ImageBitmap | HTMLImageElement) {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return { width: image.width, height: image.height };
  }
  const htmlImage = image as HTMLImageElement;
  return { width: htmlImage.naturalWidth, height: htmlImage.naturalHeight };
}

function closeDecodedImage(image: ImageBitmap | HTMLImageElement): void {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
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
    const pageNumber = Math.min(Math.max(Math.floor(requestedPage) || 1, 1), pdfDocument.numPages);
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
    return {
      blob: await canvasToBlob(canvas, "image/png"),
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
