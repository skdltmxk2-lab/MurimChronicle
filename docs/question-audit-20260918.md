# Non-daily CBT question audit — 2026-09-18

Reviewed rendering and structural integrity across 4,572 non-daily questions, with focused difficulty review of 453 flagged candidates and original-source comparisons for suspected content errors.

- Updated 256 distinct question records.
- Recalibrated 194 difficulty labels: 120 lower and 74 higher.
- Restored 45 question figures and 5 graphical answer choices from source material.
- Corrected content/explanations in 47 records, including explanatory notes for 7 quarantined items.
- Synchronized 46 stored exams and removed 4 invalid question snapshots.
- Preserved all 961 daily records, exams containing daily questions, and all student attempts and scores.

Verification: full non-daily math-render audit passed; all 50 restored images loaded in a browser; 9 independent calculation checks passed; changed database fields matched on readback. This was an automated full-pool scan plus focused review, not an independent mathematical solution of every question.

The full before/after manifest, source images, detailed report and database backups are retained locally. No raw question payload, image data, student identifiers or credentials are included in this commit. `scripts/question-audit-20260918/receipt.json` records the manifest digest and field digests for each changed question.

The migration script requires an explicit local manifest:

```sh
node scripts/apply_question_audit_20260918.mjs --patches /path/to/private/question-patches.json --out /path/to/private/audit-output
```

The default command is read-only. `--apply` performs expected-value preflight checks, saves local backups, uses revision-guarded question updates and verifies readback. `--verify` checks that the reviewed changes are already present.
