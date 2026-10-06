export type HomeworkVerdict = "correct" | "partial" | "incorrect" | "unreadable" | "missing" | "review";
export type HomeworkReference = {
  questionNumber: string;
  problem: string;
  answer: string;
  solution: string;
  sourcePages: number[];
  needsReview: boolean;
  reviewReason: string;
};
export type HomeworkFeedback = {
  questionNumber: string;
  verdict: HomeworkVerdict;
  studentWork: string;
  errorStep: string;
  reason: string;
  hint: string;
  comment: string;
  sourcePages: number[];
  needsReview: boolean;
  reviewReason: string;
  verified: boolean;
};
export type HomeworkSettings = {
  aiEnabled: boolean;
  tone: "polite" | "casual";
  depth: "hint" | "detailed";
  styleGuide: string;
  examples: string;
};
export type HomeworkMaterial = {
  id: string;
  title: string;
  kind: "homework" | "daily";
  subject: string;
  description: string;
  questionNumbers: string[];
  pdfName: string;
  pdfSize: number;
  pdfPages: number;
  reference: HomeworkReference[];
  referenceStatus: "pending" | "processing" | "draft" | "approved" | "failed";
  referenceError: string | null;
  referenceRevision: number;
  sourceKind: "pdf" | "unit_mock";
  sourceQuestionIds: string[];
  archivedAt: string | null;
  createdAt: string;
};
export type HomeworkAssignment = {
  id: string;
  materialId: string;
  material: HomeworkMaterial;
  instructions: string;
  dueAt: string | null;
  aiEnabled: boolean;
  releaseMode: "review" | "auto";
  createdAt: string;
  recipientCount: number;
  submittedCount: number;
};
export type HomeworkSubmission = {
  id: string;
  assignmentId: string;
  userId: string;
  studentName: string;
  attemptNumber: number;
  pdfName: string;
  pdfSize: number;
  pdfPages: number;
  aiStatus: "pending" | "processing" | "draft" | "failed" | "disabled";
  aiError: string | null;
  aiModel: string | null;
  draftFeedback: HomeworkFeedback[];
  publishedFeedback: HomeworkFeedback[] | null;
  publishedAt: string | null;
  publishedBy: string | null;
  feedbackRevision: number;
  isLatest: boolean;
  isLate: boolean;
  createdAt: string;
};
export type StudentHomework = {
  id: string;
  title: string;
  kind: "homework" | "daily";
  subject: string;
  instructions: string;
  questionNumbers: string[];
  dueAt: string | null;
  pdfName: string;
  createdAt: string;
  submissions: Array<Pick<HomeworkSubmission, "id" | "attemptNumber" | "pdfName" | "aiStatus" | "publishedFeedback" | "publishedAt" | "createdAt" | "isLate">>;
};
export const HOMEWORK_VERDICT_LABELS: Record<HomeworkVerdict, string> = {
  correct: "맞음", partial: "일부 오류", incorrect: "오답", unreadable: "판독 어려움", missing: "풀이 없음", review: "확인 필요",
};
export const DEFAULT_HOMEWORK_SETTINGS: HomeworkSettings = {
  aiEnabled: true, tone: "polite", depth: "hint", styleGuide: "구체적으로 잘한 점을 짚고, 처음 틀린 단계와 다음에 확인할 것을 차분히 알려주세요. 학생을 비난하거나 실력을 단정하지 마세요.", examples: "",
};
export const HOMEWORK_BUCKET = "homework-pdfs";
export const HOMEWORK_MAX_BYTES = 15 * 1024 * 1024;
export const HOMEWORK_MAX_PAGES = 50;
export const HOMEWORK_MAX_QUESTIONS = 60;
