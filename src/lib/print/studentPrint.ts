"use client";

const STUDENT_PRINT_CLASS = "student-pdf-printing";
const PRINT_GUIDE_KEY = "cbt:student-print-guide:v2";

type PrintOptions = {
  afterPrint?: () => void;
  showGuide?: boolean;
  modeClass?: string;
};

function isAppleTouchDevice() {
  const userAgent = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function showPrintGuideOnce() {
  try {
    if (window.sessionStorage.getItem(PRINT_GUIDE_KEY) === "1") return;
    window.sessionStorage.setItem(PRINT_GUIDE_KEY, "1");
  } catch {
    // Restricted browsers can block storage. Printing should still continue.
  }

  const mobileHint = isAppleTouchDevice()
    ? "\n\niPad/iPhone에서는 인쇄 화면의 공유 버튼을 누른 뒤 '파일에 저장' 또는 'PDF 저장'을 선택하세요."
    : "";

  window.alert(
    `PDF 저장 안내\n\n인쇄 설정에서 머리글/바닥글을 끄면 문제지만 깔끔하게 저장됩니다.${mobileHint}`
  );
}

export function printStudentPdf(options: PrintOptions = {}) {
  const root = document.documentElement;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    root.classList.remove(STUDENT_PRINT_CLASS);
    if (options.modeClass) root.classList.remove(options.modeClass);
    window.removeEventListener("afterprint", cleanup);
    options.afterPrint?.();
  };

  root.classList.add(STUDENT_PRINT_CLASS);
  if (options.modeClass) root.classList.add(options.modeClass);
  window.addEventListener("afterprint", cleanup);

  if (options.showGuide === true) showPrintGuideOnce();

  try {
    // Keep print inside the original click gesture. Some browsers block or ignore
    // window.print() once it is delayed through alert/requestAnimationFrame/timers.
    document.body.getBoundingClientRect();
    window.print();
  } catch {
    cleanup();
    return;
  }

  window.setTimeout(cleanup, 30000);
}
