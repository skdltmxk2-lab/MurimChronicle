import type { Difficulty } from "@/types/exam";
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES } from "@/lib/taxonomy";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const style = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.medium;
  const label = DIFFICULTY_LABELS[difficulty] ?? difficulty;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${style}`}>
      {label}
    </span>
  );
}
