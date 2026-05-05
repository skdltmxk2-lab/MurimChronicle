import type { Difficulty } from "@/types/exam";

const labels: Record<Difficulty, string> = {
  easy: "하",
  medium: "중",
  hard: "상"
};

const styles: Record<Difficulty, string> = {
  easy: "bg-mint-50 text-mint-600 ring-mint-600/15",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  hard: "bg-coral-50 text-coral-600 ring-coral-600/15"
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}
