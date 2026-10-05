import { pathToFileURL } from "node:url";
import path from "node:path";
import { HomeworkError } from "@/lib/homework/server";
import { HOMEWORK_MAX_BYTES, HOMEWORK_MAX_PAGES } from "@/types/homework";

export async function inspectHomeworkPdf(bytes: Uint8Array, declaredPages: number): Promise<number> {
  if (bytes.length < 8 || bytes.length > HOMEWORK_MAX_BYTES || !Buffer.from(bytes.subarray(0, 1024)).includes(Buffer.from("%PDF-"))) throw new HomeworkError(400, "15MB 이내의 정상 PDF 파일을 선택해 주세요.");
  // Load the native parser at runtime without changing the existing browser PDF worker build.
  const { createRequire } = await import(/* webpackIgnore: true */ "node:module");
  const require = createRequire(path.join(process.cwd(), "package.json"));
  const parserModule: string = "pdfjs-dist/legacy/build/pdf.mjs";
  const workerModule: string = "pdfjs-dist/legacy/build/pdf.worker.mjs";
  const { getDocument, GlobalWorkerOptions } = await import(/* webpackIgnore: true */ pathToFileURL(require.resolve(parserModule)).href) as typeof import("pdfjs-dist/legacy/build/pdf.mjs");
  GlobalWorkerOptions.workerSrc = pathToFileURL(require.resolve(workerModule)).href;
  const task = getDocument({ data: Uint8Array.from(bytes), isEvalSupported: false, disableFontFace: true, useSystemFonts: false });
  try {
    const document = await task.promise;
    if (document.numPages < 1 || document.numPages > HOMEWORK_MAX_PAGES) throw new HomeworkError(400, "PDF는 최대 50페이지까지 제출할 수 있습니다.");
    if (document.numPages !== declaredPages) throw new HomeworkError(400, "PDF 페이지 정보를 확인하지 못했습니다. 파일을 다시 선택해 주세요.");
    return document.numPages;
  } catch (error) {
    if (error instanceof HomeworkError) throw error;
    throw new HomeworkError(400, "PDF를 읽을 수 없습니다. 암호를 해제하거나 정상 PDF로 다시 저장해 주세요.");
  } finally {
    await task.destroy();
  }
}
