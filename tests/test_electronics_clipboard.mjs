import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync("src/lib/electronics/clipboard.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { module, exports: module.exports, File, Blob, Error }, { filename: "clipboard.ts" });
const clipboard = module.exports;
const png = (name = "capture.png", bytes = 8) => new File([new Uint8Array(bytes)], name, { type: "image/png" });
const item = values => ({ types: Object.keys(values), getType: async type => values[type] });

const file = "src/components/electronics/ElectronicsWorkspace.tsx";
const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
const body = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === "ElectronicsWorkspace").body;
const actions = ["addFiles", "appendSourceText", "pasteSource", "pasteFromButton"].map(name => body.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === name).getText(ast)).join("\n");
function harness(options = {}) {
  const state = { files: options.files ?? [], sourceText: options.text ?? "", error: "", pasting: false };
  const readers = [];
  class FileReaderMock {
    readAsDataURL(file) { this.file = file; readers.push(this); }
    succeed() { this.result = `data:${this.file.type};base64,dGVzdA==`; this.onload(); }
    fail() { this.onerror(); }
  }
  const env = { ...clipboard, FileReader: FileReaderMock, Error, projectUser: "owner-A", readyUser: { current: "owner-A" }, analysisVersion: { current: 0 },
    filesRef: { current: state.files }, sourceTextRef: { current: state.sourceText }, pendingAttachments: { current: { count: 0, bytes: 0 } }, pasting: false,
    navigator: { clipboard: options.clipboard },
  };
  for (const key of ["Files", "SourceText", "Error", "Message", "Drawer", "Pasting"]) env[`set${key}`] = value => {
    const field = key[0].toLowerCase() + key.slice(1); state[field] = typeof value === "function" ? value(state[field]) : value;
    if (field === "pasting") env.pasting = state[field];
  };
  vm.createContext(env); vm.runInContext(ts.transpileModule(actions, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, env);
  return { env, state, readers };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function pasteEvent({ files = [], items = [], text = "", editable = false } = {}) {
  return { prevented: false, preventDefault() { this.prevented = true; }, target: { closest() { return editable ? {} : null; } }, clipboardData: { files, items, getData: type => type === "text/plain" ? text : "" } };
}

test("clipboard file and item representations are not attached twice", () => {
  const image = png(); let itemReads = 0;
  const items = [{ kind: "file", getAsFile() { itemReads++; return image; } }];
  assert.equal(clipboard.clipboardFiles({ files: [image], items }).length, 1); assert.equal(itemReads, 0);
  assert.equal(clipboard.clipboardFiles({ files: [], items })[0], image); assert.equal(itemReads, 1);
  assert.equal(clipboard.clipboardFiles({ files: [], items: [{ kind: "string" }, { kind: "file", getAsFile: () => null }] }).length, 0);
});

test("button reading chooses one image encoding per item and retains separate text without using HTML", async () => {
  const readTypes = [];
  const image = { types: ["image/png", "image/jpeg", "text/plain", "text/html"], getType: async type => { readTypes.push(type); return new Blob(["image"], { type }); } };
  const result = await clipboard.readSourceClipboard({ read: async () => [image, item({ "text/plain": new Blob(["R1 = 1k"], { type: "text/plain" }) })] });
  assert.equal(result.files.length, 1); assert.equal(result.files[0].type, "image/png"); assert.equal(result.text, "R1 = 1k");
  assert.deepEqual(readTypes, ["image/png"]);
  await assert.rejects(clipboard.readSourceClipboard({ read: async () => [item({ "text/html": new Blob(["<img src='https://example.invalid/x'>"]) })] }));
});

test("readText fallback works without read and when the full clipboard API rejects", async () => {
  assert.equal((await clipboard.readSourceClipboard({ readText: async () => "plain source" })).text, "plain source");
  const denied = new Error("blocked"); denied.name = "NotAllowedError";
  assert.equal((await clipboard.readSourceClipboard({ read: async () => { throw denied; }, readText: async () => "text-only permission" })).text, "text-only permission");
  await assert.rejects(clipboard.readSourceClipboard({ read: async () => { throw denied; }, readText: async () => { throw Error("text also denied"); } }), error => error === denied);
  await assert.rejects(clipboard.readSourceClipboard({ readText: async () => " \n " }));
  await assert.rejects(clipboard.readSourceClipboard(undefined));
});

test("attachment limits include stored files and in-flight reservations, with exact boundaries", () => {
  assert.doesNotThrow(() => clipboard.checkSourceAttachments([{ size: 100 }], [{ type: "application/pdf", size: 2899900 }]));
  assert.throws(() => clipboard.checkSourceAttachments([{ size: 100 }], [{ type: "image/png", size: 2899901 }]));
  assert.doesNotThrow(() => clipboard.checkSourceAttachments([], Array(4).fill({ type: "image/png", size: 0 })));
  assert.throws(() => clipboard.checkSourceAttachments([], [png()], { count: 4, bytes: 0 }));
  assert.throws(() => clipboard.checkSourceAttachments([], [png()], { count: 0, bytes: 2899999 }));
  for (const type of ["image/svg+xml", "image/gif", "text/html", ""]) assert.throws(() => clipboard.checkSourceAttachments([], [{ type, size: 1 }]));
});

test("concurrent file reads reserve capacity and release it after success or failure", async () => {
  const h = harness();
  const pending = h.env.addFiles([png("a"), png("b"), png("c")]);
  assert.equal(h.env.pendingAttachments.current.count, 3);
  assert.equal(await h.env.addFiles([png("d"), png("e")]), false);
  assert.equal(h.readers.length, 3);
  h.readers.forEach(reader => reader.succeed());
  assert.equal(await pending, true); assert.equal(h.state.files.length, 3);
  assert.equal(h.env.pendingAttachments.current.count, 0); assert.equal(h.env.pendingAttachments.current.bytes, 0);
  const failed = h.env.addFiles([png("bad")]); h.readers.at(-1).fail();
  assert.equal(await failed, false); assert.equal(h.state.files.length, 3); assert.equal(h.env.pendingAttachments.current.count, 0);
});

test("pending file reads cannot append or replace errors after account or design changes", async () => {
  for (const change of [h => { h.env.readyUser.current = "owner-B"; }, h => { h.env.analysisVersion.current++; }]) {
    const h = harness(); const pending = h.env.addFiles([png()]);
    change(h); h.state.error = "New workspace message"; h.readers[0].succeed();
    assert.equal(await pending, false); assert.equal(h.state.files.length, 0); assert.equal(h.state.error, "New workspace message");
    assert.equal(h.env.pendingAttachments.current.count, 0);
  }
});

test("source text appends once, preserves current text and rejects overflow without truncation", () => {
  const h = harness({ text: "R1=1k" }); h.env.appendSourceText("C1=100nF"); h.env.appendSourceText("V=5");
  assert.equal(h.state.sourceText, "R1=1k\nC1=100nF\nV=5");
  const previous = h.state.sourceText; h.env.appendSourceText("x".repeat(20000));
  assert.equal(h.state.sourceText, previous); assert.match(h.state.error, /20,000/);
  const boundary = harness(); boundary.env.appendSourceText("x".repeat(20000)); assert.equal(boundary.state.sourceText.length, 20000);
});

test("native text paste in editable controls is left alone, while workspace paste appends conditions", () => {
  const h = harness(); const native = pasteEvent({ text: "text for the focused textarea", editable: true }); h.env.pasteSource(native);
  assert.equal(native.prevented, false); assert.equal(h.state.sourceText, "");
  const inheritedEditable = pasteEvent({ text: "contenteditable native text" });
  inheritedEditable.target.isContentEditable = true; h.env.pasteSource(inheritedEditable);
  assert.equal(inheritedEditable.prevented, false); assert.equal(h.state.sourceText, "");
  const source = pasteEvent({ text: "R1=1k" }); h.env.pasteSource(source);
  assert.equal(source.prevented, true); assert.equal(h.state.sourceText, "R1=1k");
});

test("native image paste attaches once and ignores the image's redundant plain text representation", async () => {
  const h = harness(), image = png(); const event = pasteEvent({ files: [image], items: [{ kind: "file", getAsFile: () => image }], text: "image description" });
  h.env.pasteSource(event); assert.equal(event.prevented, true); assert.equal(h.readers.length, 1);
  h.readers[0].succeed(); await settle(); assert.equal(h.state.files.length, 1); assert.equal(h.state.sourceText, "");
});

test("button paste preserves separate image and text items and never hides attachment failure", async () => {
  const payload = [item({ "image/png": new Blob(["image"], { type: "image/png" }) }), item({ "text/plain": new Blob(["R1=1k"]) })];
  const h = harness({ clipboard: { read: async () => payload } });
  const pending = h.env.pasteFromButton(); await settle(); assert.equal(h.readers.length, 1); h.readers[0].succeed(); await pending;
  assert.equal(h.state.files.length, 1); assert.equal(h.state.sourceText, "R1=1k"); assert.equal(h.state.pasting, false);
  const full = harness({ files: Array(4).fill({ size: 1 }), clipboard: { read: async () => payload } }); await full.env.pasteFromButton();
  assert.match(full.state.error, /최대 4개/); assert.equal(full.state.sourceText, "");
});

test("late clipboard responses and permission errors cannot overwrite a different workspace", async () => {
  for (const change of [h => { h.env.readyUser.current = "owner-B"; }, h => { h.env.analysisVersion.current++; }]) {
    let respond; const h = harness({ clipboard: { readText: () => new Promise(resolve => { respond = resolve; }) } });
    const pending = h.env.pasteFromButton(); change(h); respond("private old source"); await pending;
    assert.equal(h.state.sourceText, ""); assert.equal(h.state.files.length, 0);
  }
  const denied = new Error("permission detail"); denied.name = "NotAllowedError";
  const h = harness({ clipboard: { read: async () => { throw denied; } } }); await h.env.pasteFromButton();
  assert.match(h.state.error, /Ctrl\+V/); assert.ok(!h.state.error.includes("permission detail"));
});
