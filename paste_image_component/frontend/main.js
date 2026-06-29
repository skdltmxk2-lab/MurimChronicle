function sendValue(value) {
  Streamlit.setComponentValue(value);
}

function blobToDataUrl(blob) {
  if (!blob) {
    sendValue("error: empty clipboard blob");
    return;
  }
  const reader = new FileReader();
  reader.onloadend = function () {
    if (typeof reader.result === "string") {
      sendValue(reader.result);
    } else {
      sendValue("error: clipboard blob decode failed");
    }
  };
  reader.onerror = function () {
    sendValue("error: clipboard blob decode failed");
  };
  reader.readAsDataURL(blob);
}

function looksLikeImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith("image/")) return true;
  if (!file.type) return true;
  return /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(file.name || "");
}

async function imageFromHtml(clipboard) {
  const html = clipboard.getData && clipboard.getData("text/html");
  if (!html) return false;
  const document = new DOMParser().parseFromString(html, "text/html");
  const src = document.querySelector("img")?.getAttribute("src");
  if (!src) return false;
  try {
    const response = await fetch(src);
    if (!response.ok) return false;
    blobToDataUrl(await response.blob());
    return true;
  } catch {
    return false;
  }
}

async function handlePaste(event) {
  const clipboard = event.clipboardData || window.clipboardData;
  if (!clipboard) {
    sendValue("error: clipboard unavailable");
    return;
  }

  for (const file of Array.from(clipboard.files || [])) {
    if (looksLikeImageFile(file)) {
      event.preventDefault();
      blobToDataUrl(file);
      return;
    }
  }

  for (const item of Array.from(clipboard.items || [])) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (looksLikeImageFile(file)) {
      event.preventDefault();
      blobToDataUrl(file);
      return;
    }
  }

  if (await imageFromHtml(clipboard)) {
    event.preventDefault();
    return;
  }
  sendValue("error: no image found in clipboard");
}

function onRender(event) {
  const args = event.detail.args;
  const area = document.getElementById("paste_area");
  const label = document.getElementById("label");
  const hint = document.getElementById("hint");

  label.innerText = args.label || "여기를 클릭하고 Ctrl+V";
  hint.innerText = args.hint || "캡처한 문제 이미지를 붙여넣으세요.";

  document.body.style.backgroundColor = event.detail.theme.backgroundColor;
  area.style.borderColor = args.border_color || "#6b7280";
  area.style.color = event.detail.theme.textColor;
  area.style.fontFamily = event.detail.theme.font;

  if (!window.pasteInitialized) {
    area.addEventListener("paste", handlePaste);
    area.addEventListener("click", function () {
      area.focus();
    });
    window.pasteInitialized = true;
  }

  Streamlit.setFrameHeight(96);
}

Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender);
Streamlit.setComponentReady();
