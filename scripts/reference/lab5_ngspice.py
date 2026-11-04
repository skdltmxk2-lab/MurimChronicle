"""Reproduce Lab5's three circuits with an independent ngspice backend.

This is an offline audit, not a production simulator or a CS195 transformer model.
The transformer ratio is an explicit scenario (Np : full secondary Ns); the PDFs
do not establish it. Read the original course library instead of fitting a model
to the report's plotted outputs. All generated files stay in the selected output
directory. Requirements: Python + numpy, official ngspice console executable.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[2]
COURSE_LIBRARY = Path("C:/Users/yubin/Desktop/4-2/고전실/고급전자회로실험/MyDac 매뉴얼/시뮬레이션 library/Transistors.lib")
EXPECTED_LIBRARY_SHA256 = "c57459ca2e5e141426a6233f770edf4437855ffc77a8a44c31c26734da294bc2"
NODES = ["vcc", "rf", "lo", "b1", "b2", "b3", "tail", "e3", "out1", "out2", "ct"]


def course_model(path: Path) -> tuple[str, str]:
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != EXPECTED_LIBRARY_SHA256:
        raise ValueError(f"Course-library SHA256 changed: {digest}; review before comparing")
    lines = data.decode("utf-8-sig").splitlines()
    start = next(i for i, line in enumerate(lines) if re.match(r"\.model\s+BC109C\s", line, re.I))
    model = [lines[start]]
    for line in lines[start + 1:]:
        if not line.lstrip().startswith("+"):
            break
        model.append(line)
    return "\n".join(model), digest


def make_deck(circuit: int, ratio: float, model: str, emitter_resistance: float = 1000.0,
              rf_peak: float | None = None, lo_peak: float | None = None,
              temperature_celsius: float = 26.85) -> str:
    """Independent explicit netlists transcribed from the supplied PDF diagrams.

    C1 has two separate upper-base dividers. C2 retains only B1's divider and
    adds the center-tap divider; Q3's input coupling cap is absent. C3 removes
    B1's divider and restores Q3's 100uF input coupling. Their distinction must
    not be collapsed into the generic capacitor-driven mixer template.
    """
    if circuit not in (1, 2, 3) or not 0 < ratio < 1000:
        raise ValueError("Invalid circuit or transformer ratio")
    rf = (0.02 if circuit == 1 else 0.01 if circuit == 3 else 0.0) if rf_peak is None else rf_peak
    lo = (0.01 if circuit in (2, 3) else 0.0) if lo_peak is None else lo_peak
    lines = [f"Lab5 circuit {circuit}; ratio Np:Ns(full) {ratio:g}:1; {model}",
             "* Conditions are scenarios, not a claim of the real CS195 ratio.",
             ".include bc109c.lib", f".options temp={temperature_celsius:g} reltol=1e-7 abstol=1e-12 vntol=1e-9 method=trap",
             "VCC vcc 0 DC 9", f"VRF rf 0 DC 0 AC {1 if circuit != 2 else 0} SIN(0 {rf:.15g} 1000)",
             f"VLO lo 0 DC 0 AC {1 if circuit == 2 else 0} SIN(0 {lo:.15g} 10000)",
             "Q1 out1 b1 tail BC109C", "Q2 out2 b2 tail BC109C", "Q3 tail b3 e3 BC109C",
             "RC1 vcc out1 10k", "RC2 vcc out2 10k", "RB31 vcc b3 82k", "RB32 b3 0 12k",
             f"REE e3 0 {emitter_resistance:.15g}", "CE e3 0 100u"]
    if circuit in (1, 2):
        lines += ["RB11 vcc b1 62k", "RB12 b1 0 30k"]
    if circuit == 1:
        lines += ["RB21 vcc b2 62k", "RB22 b2 0 30k", "VCT ct 0 0"]
    else:
        h = 1 / (2 * ratio)
        lines += ["RBCT1 vcc ct 62k", "RBCT2 ct 0 30k",
                  "* Lossless transformer with reflected primary loading. S+ -> B2, S- -> B1.",
                  f"EPLUS b2 ct lo 0 {h:.15g}", f"EMINUS b1 ct lo 0 {-h:.15g}",
                  f"FPLUS lo 0 EPLUS {-h:.15g}", f"FMINUS lo 0 EMINUS {h:.15g}"]
    if circuit in (1, 3):
        lines += ["CRF rf b3 100u"]
    vectors = " ".join(f"v({n})" for n in NODES)
    currents = " ".join(f"@q{q}[{term}]" for q in (1, 2, 3) for term in ("ic", "ib", "ie"))
    duration = {1: "10m", 2: "0.5m", 3: "5m"}[circuit]
    lines += [".control", "set noaskquit", "set numdgt=15", "set wr_singlescale", "set wr_vecnames",
              "op", f"wrdata dc.txt {vectors} {currents}",
              f"tran 0.25u {duration} 0 0.25u", "let outdiff = v(out1)-v(out2)",
              f"wrdata transient.txt {vectors} outdiff", "ac dec 40 10 1Meg", "let outdiff = v(out1)-v(out2)",
              "wrdata ac.txt v(out1) v(out2) outdiff", "quit", ".endc", ".end"]
    return "\n".join(lines) + "\n"


def load_table(path: Path) -> tuple[list[str], np.ndarray]:
    names = path.read_text(encoding="utf-8").splitlines()[0].split()
    values = np.loadtxt(path, skiprows=1, ndmin=2)
    return names, values


def analyze(directory: Path) -> dict:
    dc_names, dc = load_table(directory / "dc.txt")
    names, data = load_table(directory / "transient.txt")
    time = data[:, 0]
    # Match the PDF capture durations and C1's approximately 5ms cursor window.
    # Interpolate adaptive SPICE output onto a uniform grid, then simultaneously
    # fit integer-period frequencies plus DC; avoid calling Vpp/2 a sine fit.
    end = float(time[-1])
    if end > 0.009:
        start, stop = 0.0045, 0.0055
    elif end < 0.001:
        start, stop = 0.0003, 0.0005
    else:
        start, stop = end - 0.002, end
    grid = np.linspace(start, stop, max(801, round((stop - start) / 0.00000025) + 1))
    frequencies = [1000, 2000, 9000, 10000, 11000, 19000, 20000, 21000] if end > 0.001 else [10000, 20000, 30000]
    columns = [np.ones_like(grid)]
    for frequency in frequencies:
        columns += [np.cos(2 * np.pi * frequency * grid), np.sin(2 * np.pi * frequency * grid)]
    design = np.stack(columns, axis=1)
    measurements = {}
    for node in ("v(out1)", "v(out2)", "outdiff", "v(b1)", "v(b2)", "v(b3)", "v(tail)"):
        values = np.interp(grid, time, data[:, names.index(node)])
        coeff, *_ = np.linalg.lstsq(design, values, rcond=None)
        measurements[node] = {
            "meanV": float(np.trapezoid(values, grid) / (grid[-1] - grid[0])),
            "minV": float(np.min(values)), "maxV": float(np.max(values)),
            "peakToPeakV": float(np.ptp(values)),
            "tonePeakV": {str(f): float(np.hypot(coeff[1 + i * 2], coeff[2 + i * 2])) for i, f in enumerate(frequencies)},
            "fitResidualRmsV": float(np.sqrt(np.mean((values - design @ coeff) ** 2))),
        }
    result = {"dc": dict(zip(dc_names[1:], map(float, dc[0, 1:]))), "analysisWindowSeconds": [start, stop],
              "transientRows": len(time), "measurements": measurements}
    if end > 0.009:
        values = data[:, names.index("v(out1)")]
        t1, t2 = 0.0047474, 0.0052404
        result["pdfCursorComparison"] = {"timesSeconds": [t1, t2], "deltaOut1V": float(abs(np.interp(t2, time, values) - np.interp(t1, time, values))),
                                         "note": "Same displayed cursor times; source phase is not specified in PDF, so shifted extrema are also reported."}
    return result


def run_case(executable: Path, directory: Path, deck: str, model: str) -> dict:
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "bc109c.lib").write_text(model + "\n", encoding="ascii")
    (directory / "circuit.cir").write_text(deck, encoding="ascii")
    completed = subprocess.run([str(executable), "-b", "circuit.cir"], cwd=directory, capture_output=True, timeout=90)
    log = (completed.stdout + completed.stderr).decode("utf-8", errors="replace")
    (directory / "ngspice.log").write_text(log, encoding="utf-8")
    if completed.returncode or re.search(r"\b(?:error|unknown|unrecognized|singular)\b", log, re.I):
        raise RuntimeError(f"ngspice diagnostic in {directory}:\n{log[:5000]}")
    return analyze(directory)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ngspice", type=Path, default=ROOT / "tmp/lab5-reference/Spice64/bin/ngspice_con.exe")
    parser.add_argument("--library", type=Path, default=COURSE_LIBRARY)
    parser.add_argument("--output", type=Path, default=ROOT / "tmp/lab5-reference/results")
    args = parser.parse_args()
    original, digest = course_model(args.library)
    reduced = ".model BC109C NPN(IS=7.049f BF=677 BR=2.209 TNOM=26.85)"
    metadata = {"engine": "ngspice-47", "officialDownload": "https://ngspice.sourceforge.io/download.html",
                "archiveSHA256": "59225971bd68cdd1199443649aa4615a9e6d684933f205ab49006a3942518f5a",
                "courseLibrary": str(args.library), "courseLibrarySHA256": digest, "temperatureKelvin": 300,
                "scope": "Lossless ideal CT transformer; explicit ratio scenarios; no real CS195 model or tuning to report",
                "fullModelNominalCelsius": 27, "reducedModelNominalCelsius": 26.85}
    cases = []
    for model_name, model, temperature in [("course-full", original, 26.85), ("course-full-27C", original, 27.0), ("reduced-ebers-moll", reduced, 26.85)]:
        for circuit, ratio in [(1, 1), (2, 1), (2, 2), (3, 1), (3, 2)]:
            name = f"circuit{circuit}-ratio{ratio}-{model_name}"
            print(f"Running {name}", flush=True)
            directory = args.output.resolve() / name
            result = run_case(args.ngspice.resolve(), directory, make_deck(circuit, ratio, model_name, temperature_celsius=temperature), model)
            cases.append({"id": name, "circuit": circuit, "ratioPrimaryToFullSecondary": ratio,
                          "model": model_name, "temperatureCelsius": temperature, **result})
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "comparison.json").write_text(json.dumps({"metadata": metadata, "cases": cases}, indent=2), encoding="utf-8")
    print(json.dumps({"cases": len(cases), "output": str(args.output / "comparison.json")}, indent=2))


if __name__ == "__main__":
    main()
