"use client";

const STUDENT_PRINT_CLASS = "student-pdf-printing";

type PrintOptions = {
  afterPrint?: () => void;
};

export function printStudentPdf(options: PrintOptions = {}) {
  const root = document.documentElement;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    root.classList.remove(STUDENT_PRINT_CLASS);
    window.removeEventListener("afterprint", cleanup);
    options.afterPrint?.();
  };

  root.classList.add(STUDENT_PRINT_CLASS);
  window.addEventListener("afterprint", cleanup);

  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      window.print();
      window.setTimeout(cleanup, 30000);
    }, 0);
  });
}
