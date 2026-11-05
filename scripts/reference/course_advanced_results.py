"""Reproducible course 6–10/project audit using SciPy, formulas and ngspice.

Run the adjacent course_advanced_app_results.mjs first. Original PDFs, MATLAB
files and audio are read only. Public results contain generated signals and
numeric summaries. Captured audio, PDF images and student identities stay local.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import scipy
from scipy import signal
from scipy.io import wavfile

from lab5_ngspice import course_model, load_table


ROOT = Path(__file__).resolve().parents[2]
SCRATCH = ROOT / "tmp/course-advanced-reference"
CASES: list[dict] = []


def ref(file: str, pages: list[int], authority: str = "course-instruction") -> dict:
    return {"file": file, "pages": pages, "authority": authority}


def metric(key: str, label: str, value: float, reference: float | None = None,
           unit: str = "", tolerance: float | None = None, basis: str = "") -> dict:
    item = {"key": key, "label": label, "value": float(value), "unit": unit, "basis": basis}
    if reference is not None:
        item["reference"] = float(reference)
        if reference:
            item["relativeErrorPercent"] = float(abs(value - reference) / abs(reference) * 100)
    if tolerance is not None:
        item["tolerance"] = float(tolerance)
    return item


def waveform(time: np.ndarray, unit: str = "normalized", time_unit: str = "s", **series: np.ndarray) -> dict:
    """Bounded preview of one case. ``time_unit`` names the horizontal axis.

    "s" is seconds. "sample" is a discrete index for sequences whose source gives no
    sampling frequency; the viewer must not relabel it as time.
    """
    if time_unit not in ("s", "sample"):
        raise ValueError(f"Unknown waveform time unit: {time_unit}")
    # A contiguous native-rate preview avoids inventing aliasing by display decimation.
    count = min(1024, len(time))
    axis = np.asarray(time[:count], float)
    if time_unit == "sample" and not (np.all(axis == np.round(axis)) and np.all(np.diff(axis) == 1)):
        raise ValueError("A sample axis must be consecutive integers")
    wave = {"time": axis.tolist(),
            "series": [{"label": label, "values": np.asarray(values[:count], float).tolist()} for label, values in series.items()],
            "unit": unit}
    # Seconds stay implicit so every existing waveform keeps its published shape.
    if time_unit != "s":
        wave["timeUnit"] = time_unit
    return wave


def add(case_id: str, experiment: str, title: str, sources: list[dict], conditions: list[str],
        metrics: list[dict], notes: list[str] | None = None, kind: str = "dsp",
        status: str | None = None, wave: dict | None = None, **extra) -> dict:
    checked = [m for m in metrics if "reference" in m and "tolerance" in m]
    if status is None:
        status = "pass" if checked and all(abs(m["value"] - m["reference"]) <= m["tolerance"] for m in checked) else "mismatch" if checked else "reference-missing"
    case = {"id": case_id, "experimentId": experiment, "title": title, "kind": kind,
            "status": status, "sources": sources, "conditions": conditions, "metrics": metrics,
            "notes": notes or [], **extra}
    if wave:
        case["waveform"] = wave
    CASES.append(case)
    return case


def projection(time: np.ndarray, values: np.ndarray, frequency: float, start: float = .005, end: float = .015) -> float:
    inside = (time > start) & (time < end)
    t = np.concatenate(([start], time[inside], [end]))
    v = np.concatenate(([np.interp(start, time, values)], values[inside], [np.interp(end, time, values)]))
    coefficient = 2 * np.trapezoid(v * np.exp(-2j * np.pi * frequency * t), t) / (end - start)
    return float(abs(coefficient))


def spice_deck(case: dict) -> str:
    definition, config = case["definition"], case["config"]
    source = config["source"]
    carrier = f"sin(2*pi*1000*time+pi/2)"
    if definition["modulation"] == "am":
        carrier = f"(1+0.2*cos(2*pi*300*time))*({carrier})"
    elif definition["modulation"] == "dsb":
        carrier = f"cos(2*pi*{definition['modulationFrequencyHz']}*time)*({carrier})"
    lo = config["extraSources"][0]["amplitudePeak"]
    frequency = definition["localOscillatorHz"]
    lines = ["Course project capacitor-coupled BC109C mixer", ".include bc109c.lib",
             ".options temp=26.85 reltol=1e-8 abstol=1e-13 vntol=1e-10 method=trap",
             "VCC vcc 0 9", f"BRF rf 0 V=(time>0?{source['amplitudePeak']:.16g}*({carrier}):0)",
             f"BLOP lo_plus 0 V=(time>0?{lo:.16g}*cos(2*pi*{frequency}*time):0)",
             f"BLON lo_minus 0 V=(time>0?-{lo:.16g}*cos(2*pi*{frequency}*time):0)",
             "Q1 out1 b1 tail BC109C", "Q2 out2 b2 tail BC109C", "Q3 tail b3 e3 BC109C",
             "RC1 vcc out1 10k", "RC2 vcc out2 10k", "RBB3 vcc b3 82k", "RBB4 b3 0 12k", "REE e3 0 1k",
             "RB11 vcc b1 62k", "RB12 b1 0 30k", "RB21 vcc b2 62k", "RB22 b2 0 30k",
             "CE e3 0 100u", "CIN rf b3 100u", "CLO1 lo_plus b1 1u", "CLO2 lo_minus b2 1u",
             ".control", "set noaskquit", "set numdgt=15", "set wr_singlescale", "set wr_vecnames", "op",
             "wrdata dc.txt v(out1) v(out2) v(tail) v(b1) v(b2) v(b3)",
             "tran 0.5u 15m 0 0.5u", "wrdata transient.txt v(out1) v(out2) v(tail) v(b1) v(b2) v(b3)",
             "quit", ".endc", ".end"]
    return "\n".join(lines) + "\n"


def run_spice(executable: Path, case: dict, name: str, model: str) -> dict:
    directory = SCRATCH / "spice" / case["definition"]["id"] / name
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "bc109c.lib").write_text(model + "\n", encoding="ascii")
    (directory / "circuit.cir").write_text(spice_deck(case), encoding="ascii")
    execution = subprocess.run([str(executable), "-b", "circuit.cir"], cwd=directory, capture_output=True, timeout=60)
    log = (execution.stdout + execution.stderr).decode("utf-8", "replace")
    (directory / "ngspice.log").write_text(log, encoding="utf-8")
    if execution.returncode or re.search(r"\b(error|singular|unknown|unrecognized)\b", log, re.I):
        raise RuntimeError("Independent SPICE calculation failed; inspect local audit log")
    dc_names, dc = load_table(directory / "dc.txt")
    names, data = load_table(directory / "transient.txt")
    dc_values = dict(zip(dc_names[1:], dc[0, 1:]))
    time = data[:, 0]
    node = lambda net: data[:, names.index(f"v({net})")]
    definition = case["definition"]
    output = node("out1") - node("out2")
    metrics = {f"dc_{net.upper()}_V": float(dc_values[f"v({net})"]) for net in ["out1", "out2", "tail", "b1", "b2", "b3"]}
    metrics["lo_base_peak_V"] = projection(time, node("b1") - node("b2"), definition["localOscillatorHz"])
    metrics["if_output_peak_V"] = projection(time, output, definition["intermediateFrequencyHz"])
    if definition["modulation"] == "none":
        metrics["if_gain_V_per_V"] = metrics["if_output_peak_V"] / definition["rfPeak"]
    else:
        metrics["if_lower_peak_V"] = projection(time, output, definition["intermediateFrequencyHz"] - definition["modulationFrequencyHz"])
        metrics["if_upper_peak_V"] = projection(time, output, definition["intermediateFrequencyHz"] + definition["modulationFrequencyHz"])
    return {"metrics": metrics, "time": time, "difference": output}


def analog_cases(source_root: Path, executable: Path, app: dict):
    full_model, digest = course_model(source_root / "MyDac 매뉴얼/시뮬레이션 library/Transistors.lib")
    reduced_model = ".model BC109C NPN(IS=7.049f BF=677 BR=2.209 TNOM=26.85)"
    for item in app["cases"]:
        definition = item["definition"]
        sources = [ref(f"고급전자회로실험 설계과제 공지 {definition['year']}.pdf", [1, 2]), ref("Lab3_예비보고서.pdf", [10])]
        conditions = ["BC109C ×3, +9 V, 초기값 RBB3=82 kΩ/RBB4=12 kΩ/REE=1 kΩ/RC1=RC2=10 kΩ",
                      f"RF {definition['rfPeak']*1000:g} mV peak·1 kHz, LO {definition['localOscillatorHz']:g} Hz, 각 채널5 mV peak·180°차",
                      "LO 결합1 µF×2, 입력/바이패스100 µF, 15 ms·4096표본, 측정5~15 ms"]
        if "error" in item:
            add(definition["id"], definition["experimentId"], definition["title"], sources, conditions, [], [item["error"]], kind="analog", status="blocked")
            continue
        actual = item["metrics"]
        try:
            reduced = run_spice(executable, item, "reduced", reduced_model)
            full = run_spice(executable, item, "course-full", full_model)
        except (OSError, RuntimeError, subprocess.TimeoutExpired) as error:
            add(definition["id"], definition["experimentId"], definition["title"], sources, conditions, [], [str(error)], kind="analog", status="reference-missing")
            continue
        reduced_metrics = []
        measured = []
        for key, value in actual.items():
            reference = reduced["metrics"][key]
            # DC models have identical parameters. Transient tolerance includes
            # backward-Euler vs trapezoidal integration and finite output projection.
            tolerance = max(1e-6 if key.startswith("dc_") else 1e-5, abs(reference) * (.0002 if key.startswith("dc_") else .015))
            reduced_metrics.append(metric(key, key, value, reference, "V/V" if "gain" in key else "V", tolerance,
                                   "ngspice 독립 reduced Ebers–Moll,300 K. DC 0.02% 또는1 µV,과도1.5% 또는10 µV 절대허용오차"))
            reference = full["metrics"][key]
            tolerance = max(1e-5, abs(reference) * (.01 if key.startswith("dc_") else .05))
            measured.append(metric(key, key, value, reference, "V/V" if "gain" in key else "V", tolerance,
                                   "앱 reduced 값 대 수업 Transistors.lib BC109C 전체모델 ngspice,300 K. 감사기준 DC1%·과도5% 또는10 µV를 절대허용오차로 환산. 원문 지정 허용오차는 별도로 확인 필요"))
        time = np.asarray(item["result"]["time"])
        output = np.asarray(item["result"]["nodeVoltages"]["OUT1"]) - np.asarray(item["result"]["nodeVoltages"]["OUT2"])
        notes = ["공식 초기저항과 명시된 LO 커플링 선택을 계산했습니다. 과제의 최종 저항 설계·키트 검증은 별도입니다.",
                 "주 상태는 수업 전체 BC109C 모델과 비교합니다. 동일 reduced 모델의 독립 솔버 대조는 reducedSolverMetrics에 별도로 기록합니다.",
                 "앱 reduced Ebers–Moll에 생략된 Early 효과·고전류 동작·접합 전하 등이 전체모델과의 차이에 영향을 줍니다.",
                 "DC1%·과도5% 비교범위는 회귀 감사용입니다. 실제 소자·제조공차·학생 실측의 허용범위는 별도 검증이 필요합니다.",
                 f"수업 전체모델 파일 SHA-256 {digest}",
                 f"실제 계산 B1−B2 LO 진폭 {actual['lo_base_peak_V']*1000:.6g} mV peak. 과제 조건10 mV와의 차이도 확인하세요."]
        if definition["modulation"] == "none":
            gain = actual["if_gain_V_per_V"]
            full_gain, target = full["metrics"]["if_gain_V_per_V"], definition["targetGain"]
            judged = lambda value: "충족" if value > target else "미충족"
            notes.append(f"초기값 IF 이득: 축약 앱 모델 {gain:.6g} V/V({judged(gain)}), 수업 전체 BC109C 모델 {full_gain:.6g} V/V({judged(full_gain)}), 원문 목표>{target:g}. 목표 충족은 어느 모델로도 실물에서 확정하지 않았습니다.")
        add(definition["id"], definition["experimentId"], definition["title"] + " · 수업 전체모델 대조", sources + [ref("Transistors.lib", [], "course-instruction")], conditions, measured, notes,
            kind="analog", wave=waveform(time, unit="V", app_output=output, independent_reduced=np.interp(time, reduced["time"], reduced["difference"]),
                                         course_full=np.interp(time, full["time"], full["difference"])),
            modelComparison={key: {"app": value, "reducedNgspice": reduced["metrics"][key], "fullCourseNgspice": full["metrics"][key],
                                   "fullRelativeErrorPercent": abs(value-full["metrics"][key])/max(abs(full["metrics"][key]),1e-30)*100}
                             for key, value in actual.items()},
            reducedSolverMetrics=reduced_metrics,
            runtime={"factory": "buildAdvancedAnalogCase", "caseId": definition["id"]})
        print("analog", definition["id"], CASES[-1]["status"], flush=True)


def dsp_cases(app: dict):
    time = np.arange(1001) / 1000
    chirp = signal.chirp(time, 10, 1, 100, method="linear")
    expected = np.cos(2*np.pi*(10*time+45*time*time))
    add("lab6-linear-chirp", "lab-6", "예비 선형 chirp 10→100 Hz", [ref("Lab6_예비보고서.pdf", [3], "student-report")],
        ["fs=1 kHz, t=0~1 s, 시작10 Hz·1 s에서100 Hz"],
        [metric("waveform_max_error", "위상 적분식과 최대 파형 오차", np.max(abs(chirp-expected)), 0, "normalized", 1e-11, "f(t)=10+90t의 독립 적분식 cos(2π(10t+45t²))")], wave=waveform(time, chirp=chirp))
    fs = 8000
    for frequency, label in [(293.66, "D4"), (311.13, "Eb4"), (349.23, "F4"), (392, "G4")]:
        time = np.arange(fs) / fs
        values = np.cos(2*np.pi*frequency*time)
        peaks, _ = signal.find_peaks(values)
        measured = fs / np.mean(np.diff(peaks))
        add(f"lab6-tone-{label}", "lab-6", f"예비 음계 {label}", [ref("Lab6_예비보고서.pdf", [4], "student-report")],
            [f"fs=8 kHz, 원문 음계 {frequency:g} Hz, 주파수 검증창1초"],
            [metric("frequency_hz", "표본 peak 간격 주파수", measured, frequency, "Hz", .1, "원문 음계값,표본 peak위치 양자화에 대한0.1 Hz 허용범위")])
    for fs in [2000,4000,3000,1800,1600]:
        # The original p1 screenshot explicitly uses cos, including Nyquist.
        time = np.arange(fs+1)/fs
        values = np.cos(2*np.pi*1000*time)
        expected = abs((1000+fs/2)%fs-fs/2)
        spectrum = np.abs(np.fft.rfft(values[:-1]))
        actual = np.fft.rfftfreq(fs,1/fs)[np.argmax(spectrum)]
        add(f"lab7-alias-{fs}", "lab-7", f"1 kHz 표본화 · fs={fs} Hz", [ref("Lab7_예비보고서.pdf", [1,2])],
            [f"원문 cos(2π1000t), t=0~1 s, fs={fs} Hz", "FFT는 반복 끝점을 제외한 정확히1초 표본"],
            [metric("alias_frequency_hz", "주 스펙트럼 성분", actual, expected, "Hz", 1e-9, "주파수 접힘식 |((f+fs/2) mod fs)-fs/2|"),
             metric("sample_identity_error", "접힌 cos와 원표본 최대 차이", np.max(abs(values-np.cos(2*np.pi*expected*time))), 0, "normalized", 2e-11, "주파수 접힘의 표본 동일성")],
            ["fs=2 kHz의 cos는 Nyquist에서 ±1로 교대합니다. 입력 위상을 바꾸면 표본 진폭이 달라질 수 있습니다."] if fs==2000 else [], wave=waveform(time[:200], sampled=values[:200]))
    index = np.arange(1,51)
    values = np.where((index>=5)&(index<=45), 1.02**index+.5*np.cos(2*np.pi*index/8+np.pi/4), 0)
    coefficients = np.ones(7)/7
    convolved = np.convolve(values, coefficients)
    expected = np.asarray([sum(values[n-k] if 0<=n-k<len(values) else 0 for k in range(7))/7 for n in range(len(values)+6)])
    add("lab8-moving-average", "lab-8", "7-point running average", [ref("Lab8_예비보고서.pdf", [3,4,5], "student-report")],
        ["x[n]=1.02^n+0.5cos(2πn/8+π/4),5≤n≤45,전체50표본", "c[k]=1/7,k=0..6,full convolution 56표본"],
        [metric("convolution_max_error", "직접합과 convolution 최대 차이", np.max(abs(convolved-expected)), 0, "normalized", 1e-13, "각 n에서 독립 7항 직접합")],
        ["가로축은 시간(초)이 아니라 convolution 결과의 표본 위치(0부터)입니다. 입력 x[n]의 n=1이 위치 0이며, 원문에 표본화 주파수가 없어 초 단위로 환산하지 않았습니다."],
        wave=waveform(np.arange(len(convolved)), time_unit="sample", filtered=convolved, direct_sum=expected))
    frequencies = np.linspace(-np.pi,np.pi,201)
    for half, window in [(1000,"rectangular"),(20,"rectangular"),(20,"hamming")]:
        n = np.arange(-half,half+1)
        taps = .5*np.sinc(.5*n)
        if window == "hamming": taps *= .54-.46*np.cos(2*np.pi*np.arange(len(taps))/(len(taps)-1))
        _, measured = signal.freqz(taps, worN=frequencies)
        expected = np.exp(-1j*np.outer(frequencies,np.arange(len(taps))))@taps
        add(f"lab8-sinc-{len(taps)}-{window}", "lab-8", f"sinc FIR {len(taps)} taps · {window}", [ref("Lab8_예비보고서.pdf", [5,6,7], "student-report")],
            [f"0.5sinc(0.5n),n=-{half}..{half}", "ω=-π..π,간격π/100"],
            [metric("dtft_max_error", "freqz와 직접 DTFT 최대 차이", np.max(abs(measured-expected)), 0, "linear gain", 2e-11, "계수의 독립 복소지수 합")])
    fs, count = 10000, 1000
    time = np.arange(count)/fs
    tones = [(500,1),(750,.71),(1000,1.4)]
    values = sum(amplitude*np.sin(2*np.pi*frequency*time) for frequency,amplitude in tones)
    spectral = np.fft.rfft(values)*2/count
    add("lab9-baseband-tones", "lab-9", "500/750/1000 Hz 합성", [ref("Lab9_예비보고서.pdf", [2,3])],
        ["fs=10 kHz,0.1초,진폭1/0.71/1.4", "FFT의 반복 끝점은 제외"],
        [metric(f"amplitude_{f}", f"{f} Hz 진폭", abs(spectral[int(f*.1)]), a, "normalized peak", 1e-11, "원문 합성식의 개별 sine 진폭") for f,a in tones], wave=waveform(time, baseband=values))
    dsb = values*np.cos(2*np.pi*2500*time)
    spectrum = np.fft.rfft(dsb)*2/count
    add("lab9-dsb", "lab-9", "DSB · 반송파2.5 kHz", [ref("Lab9_예비보고서.pdf", [4,5])], ["원문3톤×cos(2π2500t),fs=10 kHz"],
        [metric(f"sideband_{2500+side*f}",f"{2500+side*f} Hz 진폭",abs(spectrum[int((2500+side*f)*.1)]),a/2,"normalized peak",1e-11,"독립 sin·cos 곱-합 공식") for f,a in tones for side in [-1,1]], wave=waveform(time, baseband=values, dsb=dsb))
    analytic = signal.hilbert(values)
    exact = sum(-1j*a*np.exp(2j*np.pi*f*time) for f,a in tones)
    add("lab9-hilbert", "lab-9", "Hilbert analytic signal", [ref("Lab9_예비보고서.pdf", [6,7])], ["fs=10 kHz,주기적인1000표본","z=x+jH{x}"],
        [metric("analytic_max_error","닫힌형태 analytic 식과 최대 오차",np.max(abs(analytic-exact)),0,"normalized",1e-11,"H{sinωt}=-cosωt의 독립 정현파 관계")], wave=waveform(time, real=analytic.real, hilbert=analytic.imag))
    for side in [1,-1]:
        modulated = (analytic if side==1 else np.conj(analytic))*np.exp(2j*np.pi*2500*time)
        expected = values*np.cos(2*np.pi*2500*time)-side*exact.imag*np.sin(2*np.pi*2500*time)
        add(f"lab9-{'usb' if side==1 else 'lsb'}","lab-9",f"실수 {'USB' if side==1 else 'LSB'} 변조",[ref("Lab9_예비보고서.pdf",[9])],
            ["fc=2.5 kHz,fs=10 kHz,원문 3톤 입력"],
            [metric("quadrature_max_error","복소 upconversion과 독립 직교식 차이",np.max(abs(modulated.real-expected)),0,"normalized",1e-11,"원문 1.3/1.4의 두 경로 및 닫힌형태 Hilbert 기준")], wave=waveform(time, ssb=modulated.real))
    fs, duration = 64000, .05
    time=np.arange(round(fs*duration))/fs
    left=np.sin(2*np.pi*500*time); right=.7*np.cos(2*np.pi*1000*time)
    for carrier in [16000,17000,18000,19000,22000]:
        sl=np.real(np.conj(signal.hilbert(left))*np.exp(2j*np.pi*carrier*time))
        sr=np.real(signal.hilbert(right)*np.exp(2j*np.pi*carrier*time))
        shifted=signal.hilbert(sl+sr)*np.exp(-2j*np.pi*carrier*time)
        spectrum=np.fft.fft(shifted); frequencies=np.fft.fftfreq(len(time),1/fs)
        restored_right=np.fft.ifft(np.where(frequencies>0,spectrum,0)).real
        restored_left=np.fft.ifft(np.where(frequencies<0,spectrum,0)).real
        add(f"lab10-stereo-demod-{carrier}","lab-10",f"분반 {carrier/1000:g} kHz · 양측대역 복원",[ref("Lab9_예비보고서.pdf",[9,10]),ref("Lab10_예비보고서.pdf",[7])],
            ["검증용 좌500 Hz·우1000 Hz 독립 합성신호","fs=64 kHz 선택,상한fc+5 kHz를Nyquist아래로 유지",f"fc={carrier} Hz,50 ms"],
            [metric("left_max_error","복원 Left 최대 오차",np.max(abs(restored_left-left)),0,"normalized",1e-10,"입력 Left의 닫힌 정현파 식"),metric("right_max_error","복원 Right 최대 오차",np.max(abs(restored_right-right)),0,"normalized",1e-10,"입력 Right의 닫힌 정현파 식")],
            ["원문 분반별 반송파의 수학적 복조를 독립 합성신호로 검사했습니다. 지정곡 원본과필터조건은별도사례입니다."], wave=waveform(time, input_left=left, restored_left=restored_left, input_right=right, restored_right=restored_right))
    for duplicate in [False,True]:
        fs=10000; count=fs+int(duplicate); time=np.arange(count)/fs
        values=np.cos(2*np.pi*1000*time+np.pi/4); transformed=np.fft.fft(values); bin_index=np.argmin(abs(np.fft.fftfreq(count,1/fs)-1000))
        amplitude=abs(transformed[bin_index])*2/count; phase=np.angle(transformed[bin_index],deg=True)
        add(f"lab10-phase-{'reported-endpoint' if duplicate else 'coherent'}","lab-10","1 kHz·45° FFT · "+("보고서 끝점 중복" if duplicate else "정확한1초 표본"),[ref("Lab10_예비보고서.pdf",[2,3,4,7],"student-report" if duplicate else "course-instruction")],
            [f"fs=10 kHz,N={count},x=cos(2π1000t+π/4)"],
            [metric("amplitude_peak","양의 주파수 peak 진폭",amplitude,1,"normalized",1e-10,"요구된 정현파 진폭"),metric("phase_degrees","양의 주파수 위상",phase,45,"degree",1e-8,"요구된 위상π/4")],
            ["학생 코드는0초와1초를 함께 포함해10001표본FFT를 계산합니다. 원문도약63°를기록합니다. 주파수 bin과위상편차를따로보존합니다."] if duplicate else ["한 주기열의 중복 끝점을 제외하는 FFT 조건입니다."],wave=waveform(time[:200],signal=values[:200]))
    for generated in app["generatedInputs"]:
        year=generated["year"]
        if "error" in generated:
            add(f"project-{year}-input-equation",f"project-{year}",f"{year} 변조 입력 생성식",[ref(f"고급전자회로실험 설계과제 공지 {year}.pdf",[1])],[],[],[generated["error"]],status="blocked")
            continue
        time=np.asarray(generated["time"]); values=np.asarray(generated["values"]); fm={2025:200,2023:300,2022:100}[year]
        expected=.01*((1+.2*np.cos(2*np.pi*fm*time)) if year==2023 else np.cos(2*np.pi*fm*time))*np.cos(2*np.pi*1000*time)
        add(f"project-{year}-input-equation",f"project-{year}",f"{year} 변조 입력 생성식",[ref(f"고급전자회로실험 설계과제 공지 {year}.pdf",[1])],
            [f"실제 앱 sourceVoltage,fc=1000 Hz,fm={fm} Hz,A=0.01 V,phase=90°","2023만 AM 깊이0.2,2022/2025는DSB-SC"],
            [metric("input_max_error","독립 원문 cos 식과 최대 오차",np.max(abs(values-expected)),0,"V",1e-12,"원문 수식을 Python에서 별도 직접 계산")],wave=waveform(time, unit="V", app_source=values, reference=expected))


def assets_and_gaps(source_root: Path):
    extensions={".wav",".m",".mat",".txt",".csv"}
    assets=[path for path in source_root.rglob("*") if path.is_file() and path.suffix.lower() in extensions]
    direct=[path for path in assets if any(path.is_relative_to(source_root/f"실험{i}") for i in range(6,11))]
    inventory={"allSourceAssetCounts":dict(Counter(path.suffix.lower() for path in assets)),"direct2025Lab6To10AssetCounts":dict(Counter(path.suffix.lower() for path in direct)),"historicalStandardAudio":[]}
    for name in ["piano_A4.wav","flute_A4.wav","violin_A4.wav"]:
        matches=sorted(path for path in assets if path.name.lower()==name.lower())
        if not matches: continue
        path=matches[0]; fs, data=wavfile.read(path)
        if data.ndim>1: data=data.mean(axis=1)
        values=np.asarray(data,float); duration=len(values)/fs
        if len(values)>fs:
            energy=signal.convolve(values[:min(len(values),fs*4)]**2,np.ones(min(fs//20,len(values)))/(min(fs//20,len(values))),mode="same",method="fft")
            start=max(0,min(int(np.argmax(energy)),len(values)-fs)); segment=values[start:start+fs]
        else: segment=values
        f,power=signal.periodogram(segment,fs,window="hann",nfft=max(65536,len(segment)),scaling="spectrum")
        near_a=(f>=400)&(f<=480); frequency=float(f[near_a][np.argmax(power[near_a])])
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        inventory["historicalStandardAudio"].append({"file":name,"sampleRateHz":int(fs),"samples":len(values),"durationSeconds":duration,"sha256":digest})
        add(f"lab10-historical-{name.split('_')[0]}","lab-10",f"과거 자료 {name} 기본주파수",[ref(name,[],"historical-source"),ref("Lab10_예비보고서.pdf",[8])],
            [f"파일fs={fs} Hz,길이{duration:.3f} s","에너지 최대 구간1초,Hann periodogram,400~480 Hz 대역 peak"],
            [metric("fundamental_hz","A4 부근 주요 주파수",frequency,440,"Hz",5,"A4 명칭의 기준440 Hz와유한창/튜닝을고려한사전±5 Hz 비교범위")],
            [f"과거학기 파일 SHA-256 {digest}","원오디오와 음성 표본은 공개 보고서에 포함하지 않습니다. 2025 지정파일과동일성은확인되지않았습니다."])
    for task_index, (label, experiment, sources, reason) in enumerate([
        ("마이크 녹음·지정곡 합성·음색", "lab-6", [ref("Lab6_결과보고서.pdf",[7,8,9,10,11,12,13,14,15,16,17,18,19])], "현재학기 원녹음/WAV·악보별 합성코드와 비교 기준파형이 필요합니다. 과거 She.wav의 존재는 inventory에 따로 기록했습니다."),
        ("악보·하모닉·음원10초 샘플링", "lab-7", [ref("Lab7_예비보고서.pdf",[3]),ref("Lab7_결과보고서.pdf",[3,4,5,6,7,8,9,10,11,12])], "해당분반 악보·구간·음원·리샘플링/재생률 선택을 고정할 입력 프로젝트가 필요합니다."),
        ("다섯대역 음악 분리·재합성", "lab-8", [ref("Lab8_예비보고서.pdf",[8,9,10]),ref("Lab8_결과보고서.pdf",[8,9,10,11,12,13,14,15,16,17,18,19])], "원문은0~1/1~2/2~3/3~4/4~5 kHz를 요구합니다. 필터차수·전이대역·허용리플·지정곡 조건 확정과 원결과 대조가 남았습니다."),
        ("FDATool 최소차수 Equiripple FIR", "lab-8", [ref("lab8_supp_filter_design_matlab.pdf",[3,4,5])], "일반 Hamming 설계와 별개의 Equiripple 최소차수 과제입니다. 수치 ripple/attenuation 조건과 원계수의 해당과제 대응을 확인해야 합니다."),
        ("저장데이터 LPF", "lab-8", [ref("Lab8. NI myDAQ AWG 2 보고서.pdf",[5,6,7])], "fs50 kHz,fpass200 Hz,fstop300 Hz 조건의 원문 측정파일·리플/감쇠 수치 대응이 필요합니다."),
        ("지정곡 stereo SSB", "lab-9", [ref("Lab9_예비보고서.pdf",[9,10]),ref("Lab9_결과보고서.pdf",[15,16,17,18,19,20,21])], "합성독립채널의 분반별 변복조 검증은 완료했습니다. 현재학기 지정곡·5 kHz LPF·채널별 기준출력 대조가 남았습니다."),
        ("piano/flute 음색 합성·두곡 결합", "lab-10", [ref("Lab10_예비보고서.pdf",[8,9]),ref("Lab10_결과보고서.pdf",[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24])], "과거 A4 원파일의 기본주파수를 검사했습니다. 현재학기 배음·위상·envelope 선택과 지정곡별 원합성 출력 대조가 남았습니다."),
    ]):
        add(f"{experiment}-remaining-signal-task-{task_index+1}",experiment,label,sources,[],[],[reason],status="reference-missing")
    for experiment, title, sources in [
        ("lab-6","myDAQ DSA 루프백·span/resolution/window",[ref("Lab6. NI myDAQ DSA 보고서.pdf",list(range(3,15)))]),
        ("lab-7","AWG sample/update rate·두채널 출력",[ref("Lab7. NI myDAQ AWG 보고서.pdf",list(range(2,12)))]),
        ("lab-8","AWG2 100 Hz·500/1000 S/s",[ref("Lab8. NI myDAQ AWG 2 보고서.pdf",[1,2,3,4])]),
    ]:
        add(f"{experiment}-external-acquisition",experiment,title,sources,[],[],["외부장비 계측 과제입니다. 실제 NI 장비의 캡처·출력 검증이 필요합니다."],kind="external",status="blocked")
    # Preserve distinct historic analog circuits. The report is a student design,
    # with internal transistor feedback and manufacturer-model correspondence open.
    for slug,title,pages in [("core","6-BJT OPAMP",[1,2]),("comparator","비교기 DC sweep",[3]),("noninverting","비반전 증폭기",[4,5]),("integrator","100 Hz 적분기",[6,7,8])]:
        add(f"project-2024-{slug}","project-2024",f"2024 사례 · {title}",[ref("Project_보고서 (2024).pdf",pages,"student-report")],
            ["±15 V,BC547B(NPN)/BC556B(PNP) 계열6개","학생보고서의 설계회로·PSpice·실물 측정을 각각 보존"],[],
            ["모든 내부 연결·정확한 소자모델 대응과 트랜지스터 피드백 안정성 검수가 남았습니다. 원도면 해상도와 모델 원본을 추가 대조해야 합니다."],kind="analog",status="blocked")
    for year,target in [(2025,3000),(2023,6000),(2022,4000)]:
        add(f"project-{year}-digital-filter",f"project-{year}",f"{year} {target/1000:g} kHz 디지털 필터",[ref(f"고급전자회로실험 설계과제 공지 {year}.pdf",[1,4,5,6])],
            [f"{target} Hz 주변 성분 필터링"],[],["원문은통과대역 폭·차수·리플 수치를고정하지 않습니다. 학생 설계계수·원측정파일과연도별회로의 대응을확인해야 합니다."],status="reference-missing")
    return inventory


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    # The original course material never lives in the repository: pass its folder or set COURSE_SOURCE_ROOT.
    parser.add_argument("--source-root",type=Path,default=os.environ.get("COURSE_SOURCE_ROOT"),required="COURSE_SOURCE_ROOT" not in os.environ)
    parser.add_argument("--ngspice",type=Path,default=ROOT/"tmp/lab5-reference/Spice64/bin/ngspice_con.exe")
    parser.add_argument("--output",type=Path,default=ROOT/"output/course-verification/labs-6-10-project.json")
    args=parser.parse_args()
    app=json.loads((SCRATCH/"app-results.json").read_text(encoding="utf-8"))
    analog_cases(args.source_root,args.ngspice,app)
    dsp_cases(app)
    inventory=assets_and_gaps(args.source_root)
    if len({case["id"] for case in CASES})!=len(CASES):
        raise ValueError("Duplicate verification case IDs")
    report={"schemaVersion":1,"generatedAt":datetime.now(timezone.utc).isoformat(),
            "scope":"실험6~10,2025 프로젝트,2022/2023/2024 연도별 변형",
            "engines":{"analogApp":"실제 simulation.ts","independentAnalog":"ngspice-47 reduced/full course models","dsp":f"SciPy {scipy.__version__}, NumPy {np.__version__}, 독립 닫힌식/직접합"},
            "inventory":inventory,"summary":dict(Counter(case["status"] for case in CASES)),"cases":CASES}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2,allow_nan=False),encoding="utf-8")
    print(json.dumps({"cases":len(CASES),"summary":report["summary"],"output":str(args.output)},ensure_ascii=False),flush=True)


if __name__=="__main__":
    main()
