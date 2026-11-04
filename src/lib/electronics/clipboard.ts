export const SOURCE_MAX_FILES = 4;
export const SOURCE_MAX_BYTES = 2_900_000;
export const SOURCE_TEXT_LIMIT = 20_000;
const formats = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export function clipboardFiles(data: Pick<DataTransfer, "files" | "items">): File[] {
  const files = Array.from(data.files);
  if (files.length) return files;
  return Array.from(data.items).filter(item => item.kind === "file").map(item => item.getAsFile()).filter((file): file is File => file !== null);
}

export function checkSourceAttachments(existing: readonly { size: number }[], incoming: readonly { size: number; type: string }[], pending = { count: 0, bytes: 0 }): void {
  if (existing.length + pending.count + incoming.length > SOURCE_MAX_FILES || existing.reduce((sum, file) => sum + file.size, 0) + pending.bytes + incoming.reduce((sum, file) => sum + file.size, 0) > SOURCE_MAX_BYTES) throw new Error("첨부는 최대 4개, 합계 2.9MB까지 가능합니다. PDF는 필요한 페이지만 분리해 주세요.");
  if (incoming.some(file => !formats.includes(file.type))) throw new Error("PDF, PNG, JPG, WebP 파일을 선택하거나 붙여넣어 주세요.");
}

/** Called only by the user's paste button. HTML is never inserted or fetched. */
export async function readSourceClipboard(clipboard: Pick<Clipboard, "read" | "readText"> | undefined): Promise<{ files: File[]; text: string }> {
  if (!clipboard) throw new Error("이 브라우저에서는 버튼으로 읽을 수 없습니다. 아래 영역을 클릭하고 Ctrl+V로 붙여넣어 주세요.");
  if (typeof clipboard.read !== "function") {
    if (typeof clipboard.readText !== "function") throw new Error("Ctrl+V로 사진이나 텍스트를 붙여넣어 주세요.");
    const text = await clipboard.readText();
    if (!text.trim()) throw new Error("붙여넣을 텍스트가 없습니다. 사진은 Ctrl+V로 붙여넣어 주세요.");
    return { files: [], text };
  }
  let items: ClipboardItems;
  try { items = await clipboard.read(); }
  catch (error) {
    // Some browsers expose read() but permit only the text-specific API.
    if (typeof clipboard.readText === "function") {
      try { const text = await clipboard.readText(); if (text.trim()) return { files: [], text }; }
      catch { /* Preserve the original permission error for the Ctrl+V guidance. */ }
    }
    throw error;
  }
  const files: File[] = [], texts: string[] = [];
  for (const [index, item] of items.entries()) {
    const type = formats.find(type => item.types.includes(type));
    if (type) {
      const blob = await item.getType(type);
      const extension = type === "application/pdf" ? "pdf" : type === "image/jpeg" ? "jpg" : type.split("/")[1];
      files.push(new File([blob], `clipboard-${Date.now()}-${index + 1}.${extension}`, { type }));
    } else if (item.types.includes("text/plain")) texts.push(await (await item.getType("text/plain")).text());
  }
  const text = texts.join("\n");
  if (!files.length && !text.trim()) throw new Error("사진이나 텍스트를 복사한 뒤 다시 붙여넣어 주세요. 지원 형식은 PDF·PNG·JPG·WebP입니다.");
  return { files, text };
}
