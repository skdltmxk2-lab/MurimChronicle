export const ALL_UNIT_VALUE = "__all_units__";

const DIFFICULTY_ORDER = [
  "easy",
  "easyMedium",
  "medium",
  "mediumHard",
  "hard",
  "killer",
];

const SUBJECT_UNIT_PRIORITIES = {
  미분학: ["최대/최소", "Taylor급수"],
  적분학: [
    "정적분의 응용",
    "극좌표와 응용",
    "정적분의 계산",
    "부정적분",
    "Maclaurin급수의 응용",
  ],
  선형대수: ["고유치와 대각화", "벡터공간", "선형사상"],
  다변수함수: [],
  공학수학: ["미분방정식", "Laplace변환"],
};

export function difficultyFallbackOrder(difficulty) {
  if (difficulty === "all") return [];
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  if (index < 0) return [];
  return DIFFICULTY_ORDER.slice(0, index + 1).reverse();
}

export function prioritizedUnitsForSubject(subject, units) {
  const available = new Set(units);
  const priority = SUBJECT_UNIT_PRIORITIES[subject] ?? [];
  return [
    ...priority.filter((unit) => available.has(unit)),
    ...units.filter((unit) => !priority.includes(unit)),
  ];
}

export function balancedUnitTargets(subject, units, count) {
  const orderedUnits = prioritizedUnitsForSubject(subject, units);
  const targets = Object.fromEntries(orderedUnits.map((unit) => [unit, 0]));
  if (orderedUnits.length === 0 || count <= 0) return targets;

  for (let index = 0; index < count; index += 1) {
    const unit = orderedUnits[index % orderedUnits.length];
    targets[unit] += 1;
  }
  return targets;
}

export function mergeUnitMockQuestionIds(...groups) {
  return Array.from(
    new Set(
      groups.flatMap((group) =>
        group.filter((id) => typeof id === "string" && id.length > 0)
      )
    )
  );
}

function sortByDifficulty(candidates, difficulty) {
  if (difficulty === "all") return [...candidates];
  const order = difficultyFallbackOrder(difficulty);
  const rank = new Map(order.map((item, index) => [item, index]));
  return candidates
    .filter((candidate) => rank.has(candidate.difficulty))
    .sort((left, right) => rank.get(left.difficulty) - rank.get(right.difficulty));
}

function incrementCount(counts, key) {
  counts[key] = (counts[key] ?? 0) + 1;
}

export function selectUnitMockCandidates(candidates, options) {
  const count = Math.max(0, Math.round(options.count));
  const selected = [];
  const selectedByUnit = {};
  const selectedByDifficulty = {};

  if (count === 0) {
    return { selected, selectedByUnit, selectedByDifficulty };
  }

  if (options.unit !== ALL_UNIT_VALUE) {
    const queue = sortByDifficulty(
      candidates.filter((candidate) => candidate.unit === options.unit),
      options.difficulty
    );
    selected.push(...queue.slice(0, count));
  } else {
    const orderedUnits = prioritizedUnitsForSubject(options.subject, options.units);
    const queues = new Map(
      orderedUnits.map((unit) => [
        unit,
        sortByDifficulty(
          candidates.filter((candidate) => candidate.unit === unit),
          options.difficulty
        ),
      ])
    );

    while (selected.length < count) {
      let selectedInRound = 0;
      for (const unit of orderedUnits) {
        const candidate = queues.get(unit)?.shift();
        if (!candidate) continue;
        selected.push(candidate);
        selectedInRound += 1;
        if (selected.length >= count) break;
      }
      if (selectedInRound === 0) break;
    }
  }

  for (const candidate of selected) {
    incrementCount(selectedByUnit, candidate.unit);
    incrementCount(selectedByDifficulty, candidate.difficulty);
  }

  return { selected, selectedByUnit, selectedByDifficulty };
}
