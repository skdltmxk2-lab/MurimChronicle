function sendValue(value) {
  Streamlit.setComponentValue(value);
}

function blobToDataUrl(blob) {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function () {
    sendValue(reader.result);
  };
}

function handlePaste(event) {
  const clipboard = event.clipboardData || window.clipboardData;
  if (!clipboard || !clipboard.items) {
    sendValue("error: clipboard unavailable");
    return;
  }

  for (const item of clipboard.items) {
    if (item.type && item.type.startsWith("image/")) {
      event.preventDefault();
      blobToDataUrl(item.getAsFile());
      return;
    }
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
