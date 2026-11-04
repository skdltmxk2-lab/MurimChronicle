"""Create honest numerical/visual Lab5 comparisons from lab5_ngspice.py outputs."""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from lab5_ngspice import ROOT, analyze, load_table


OUTPUT = ROOT / "tmp/lab5-reference"
RESULTS = OUTPUT / "results"


def main() -> None:
    document = json.loads((RESULTS / "comparison.json").read_text(encoding="utf-8"))
    cases = {c["id"]: c for c in document["cases"]}
    # Refresh analysis after a cursor-label correction without rerunning SPICE.
    for name, case in cases.items():
        case.update(analyze(RESULTS / name))
    (RESULTS / "comparison.json").write_text(json.dumps(document, indent=2), encoding="utf-8")
    full = [cases[f"circuit{i}-ratio1-course-full-27C"] for i in (1, 2, 3)]
    reduced = [cases[f"circuit{i}-ratio1-reduced-ebers-moll"] for i in (1, 2, 3)]
    app_data = json.loads((OUTPUT / "app-results.json").read_text(encoding="utf-8")) if (OUTPUT / "app-results.json").exists() else None
    app = {case["caseId"]: case for case in app_data["cases"] if case["ratio"] == "1:1"} if app_data else {}
    rows = []
    def add(label: str, reported: float, full_value: float, reduced_value: float, unit: str):
        rows.append({"quantity": label, "pdf": reported, "fullModel": full_value, "reducedModel": reduced_value,
                     "unit": unit, "fullErrorPercent": (full_value / reported - 1) * 100,
                     "reducedErrorPercent": (reduced_value / reported - 1) * 100})
    add("회로 1 OUT1 DC", 6.553, full[0]["dc"]["v(out1)"], reduced[0]["dc"]["v(out1)"], "V")
    add("회로 1 OUT1 peak (동일 5ms 부근)", 1.8815, full[0]["measurements"]["v(out1)"]["peakToPeakV"] / 2,
        reduced[0]["measurements"]["v(out1)"]["peakToPeakV"] / 2, "V")
    add("회로 2 B1 peak", 0.002492, full[1]["measurements"]["v(b1)"]["peakToPeakV"] / 2,
        reduced[1]["measurements"]["v(b1)"]["peakToPeakV"] / 2, "V")
    add("회로 2 OUT1 peak", 0.43212, full[1]["measurements"]["v(out1)"]["peakToPeakV"] / 2,
        reduced[1]["measurements"]["v(out1)"]["peakToPeakV"] / 2, "V")
    for frequency, reported in [(9000, 0.153763), (10000, 0.875423), (11000, 0.153721)]:
        add(f"회로 3 차동 {frequency / 1000:g} kHz peak" + (" (본문값)" if frequency == 11000 else ""),
            reported, full[2]["measurements"]["outdiff"]["tonePeakV"][str(frequency)],
            reduced[2]["measurements"]["outdiff"]["tonePeakV"][str(frequency)], "V")
    if app:
        app_values = [app["c1-dc"]["result"]["dc"]["nodeVoltages"]["OUT1"], app["c1-drive"]["measurements"]["halfVpp"]["OUT1"],
                      app["c2-drive"]["measurements"]["halfVpp"]["B1"], app["c2-drive"]["measurements"]["halfVpp"]["OUT1"],
                      *[app["c3-mix"]["measurements"]["tonePeak"][str(f)] for f in (9000, 10000, 11000)]]
        for row, value in zip(rows, app_values):
            row["actualApp"] = value
            row["actualAppErrorPercent"] = (value / row["pdf"] - 1) * 100
            row["actualAppVsReducedPercent"] = (value / row["reducedModel"] - 1) * 100
    comparison = {"conditions": {"transformer": "ideal Np:full Ns = 1:1 assumed; ratio is absent from the PDFs",
                                  "fullModelTemperatureCelsius": 27, "reducedModelTemperatureCelsius": 26.85,
                                  "reducedModel": "ngspice Ebers-Moll matching app's Is/BF/BR, not direct app output",
                                  "scope": "PDF simulation results; physical measurements are not identical targets"},
                  "rows": rows}
    (OUTPUT / "numerical-comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2), encoding="utf-8")

    plt.rcParams.update({"font.family": "Malgun Gothic", "axes.unicode_minus": False,
                         "font.size": 10, "figure.facecolor": "#f4f4f5", "axes.facecolor": "#ffffff",
                         "axes.edgecolor": "#b7bbc2", "axes.labelcolor": "#34373c", "text.color": "#24262a",
                         "xtick.color": "#53565d", "ytick.color": "#53565d"})
    fig, axes = plt.subplots(2, 2, figsize=(14, 9.5), constrained_layout=True)
    for i, ax in enumerate(axes.flat[:3], 1):
        for model, label, color in [("course-full-27C", "수업 BC109C 전체 SPICE 모델", "#25272c"),
                                    ("reduced-ebers-moll", "현재 사이트와 같은 축약 모델 (ngspice)", "#8470aa")]:
            names, data = load_table(RESULTS / f"circuit{i}-ratio1-{model}" / "transient.txt")
            signal = "outdiff" if i == 3 else "v(out1)"
            time = data[:, 0]
            values = data[:, names.index(signal)]
            if model == "reduced-ebers-moll" and app:
                app_case = app[{1: "c1-drive", 2: "c2-drive", 3: "c3-mix"}[i]]
                time = np.array(app_case["result"]["time"])
                values = np.array(app_case["measurements"]["differential"] if i == 3 else app_case["result"]["nodeVoltages"]["OUT1"])
                label = "사이트 실제 계산 엔진 (축약 모델)"
            step = max(1, len(time) // 5000)
            ax.plot(time[::step] * 1000, values[::step], color=color, linewidth=1.15, label=label)
        title = {1: "회로 1 · Q3 입력 20 mV / 1 kHz", 2: "회로 2 · 트랜스 입력 10 mV / 10 kHz",
                 3: "회로 3 · 두 입력 10 mV / 1 kHz + 10 kHz"}[i]
        ax.set(title=title, xlabel="시간 (ms)", ylabel="OUT1 - OUT2 (V)" if i == 3 else "OUT1 (V)")
        ax.grid(color="#e5e7eb", linewidth=0.6)
        if i == 1:
            ax.axvspan(4.5, 5.5, color="#b4c3d5", alpha=0.2)
            ax.text(0.98, 0.96, "음영: 원문 커서와 같은 5 ms 부근 비교", transform=ax.transAxes,
                    ha="right", va="top", fontsize=9)
            ax.legend(fontsize=8, loc="lower right")
    ax = axes[1, 1]
    fs = [9000, 10000, 11000]
    x = np.arange(3)
    pdf = [0.153763, 0.875423, 0.153721]
    for offset, values, label, color in [(-0.24, pdf, "원문 (11 kHz는 본문값)", "#9aa4b0"),
                                      (0, [full[2]["measurements"]["outdiff"]["tonePeakV"][str(f)] for f in fs], "전체 모델", "#25272c"),
                                      (0.24, [app["c3-mix"]["measurements"]["tonePeak"][str(f)] if app else reduced[2]["measurements"]["outdiff"]["tonePeakV"][str(f)] for f in fs], "사이트 실제 엔진" if app else "축약 모델", "#8470aa")]:
        ax.bar(x + offset, values, width=0.22, color=color, label=label)
    ax.set_xticks(x, ["9 kHz", "10 kHz", "11 kHz"])
    ax.set(title="회로 3 · 차동 출력 주파수별 peak 진폭", ylabel="진폭 (V peak)", ylim=(0, 1.13))
    ax.grid(axis="y", color="#e5e7eb", linewidth=0.6)
    ax.set_axisbelow(True)
    ax.legend(fontsize=8, loc="upper right")
    fig.suptitle("Lab 5 · 원문 세 회로의 독립 SPICE 재구성", fontsize=18, fontweight="bold")
    fig.supxlabel("트랜스는 이상적 1:1 시나리오 · 실제 권선비 미확인 · 원문 11 kHz 그래프 커서는 10.989 kHz / 145.570 mV로 본문과 다름", fontsize=9)
    fig.savefig(OUTPUT / "lab5-waveform-comparison.png", dpi=170)
    plt.close(fig)

    lines = ["# Lab 5 numerical reconstruction", "", "## Scope and assumptions", "",
             "All three distinct circuits from the two specified PDFs are independently reconstructed. No myDAQ/DSA interface is implemented.",
             "The source-model runs use the original BC109C model block from the course Transistors.lib (SHA256 recorded in comparison.json), unmodified. ngspice 47 is the independent numerical engine.",
             "The transformer properties are absent from the PDFs. Both lossless Np:full-secondary Ns = 1:1 and 2:1 are run. The table below shows the explicit 1:1 scenario; numerical agreement does not prove the real ratio.",
             "The full model column uses 27°C, ngspice's nominal default. A separate full-model 300 K run exists to compare with the current app's 300 K reduced model. No parameters were fitted to the report.",
             "The reduced column is an independent ngspice run of the same Is/BF/BR Ebers-Moll parameters. Actual app-module runs are independently recorded in app-results.json; they agree with the same reduced ngspice reference within 0.06% for these waveform measurements. They are local real-engine executions, not a production browser capture.", "",
             "| Quantity | PDF simulation | Full course model | Error | Reduced-model reference | Error |", "|---|---:|---:|---:|---:|---:|"]
    for row in rows:
        lines.append(f"| {row['quantity']} | {row['pdf']:.6f} V | {row['fullModel']:.6f} V | {row['fullErrorPercent']:+.3f}% | {row['reducedModel']:.6f} V | {row['reducedErrorPercent']:+.3f}% |")
    lines += ["", "## What explains the differences", "",
              "- Circuit 1 output changes during capacitor settling. The PDF's 3.763 Vpp is at approximately 5 ms, not the first period. The recreated 10 ms waveform reproduces that drift. Comparing the first few cycles to the 5 ms table incorrectly exaggerates error.",
              "- Circuit 2's retained B1 divider loads the center-tapped winding asymmetrically. CT is not AC ground: at the assumed 1:1 full winding ratio, the 10 mV differential winding voltage produces approximately 2.5 mV at B1 relative to ground. Holding CT at AC ground would be the wrong circuit.",
              "- Circuit 3 removes that extra divider. The 9/10/11 kHz components agree closely under the full-model, ideal-transformer assumption. The reduced model has roughly 10% carrier and 19% sideband differences; merely implementing a transformer cannot remove the semiconductor-model difference.",
              "- The 11 kHz graph cursor is off-center (10.989 kHz, 145.570 mV). The adjacent text says 153.721 mV. These are preserved as distinct references.",
              "- The source's multiply-by-two spectral coefficient calculation is not used: its FFT normalization is unspecified and physical DSA RMS/dBV values cannot be treated as peak values without conversion.",
              "- The physical report has mismatched collector DC voltages and substantially different gains. Ideal matched devices do not reproduce that measured imbalance. Do not claim identical physical results.",
              "- The b×1.2 resistor redesign is explicitly not performed in both PDFs. There is no fourth completed reference circuit or output to reproduce.", "",
              "## Reproduce", "", "```powershell", "python scripts/reference/lab5_ngspice.py", "python scripts/reference/lab5_report.py", "```", "",
              "Required: original course Transistors.lib at the documented path, numpy/matplotlib, official ngspice 47 console in tmp/lab5-reference/Spice64/bin. Use --ngspice and --library for relocated inputs. No global PATH or installation changes are needed.", "",
              "Raw deck, copied local model block, ngspice log, DC, transient and AC text outputs are saved per case. JSON results include 15 scenarios, assumptions, source hash, engine provenance and measurement windows."]
    (OUTPUT / "comparison-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"plot": str(OUTPUT / "lab5-waveform-comparison.png"), "report": str(OUTPUT / "comparison-report.md"), "rows": rows}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
