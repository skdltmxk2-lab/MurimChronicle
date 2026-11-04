"""Build a self-contained, PII-free review artifact with reconstructed schematics."""
from __future__ import annotations
import base64
import html
import json
from pathlib import Path
from lab5_ngspice import ROOT

SOURCE = ROOT / "tmp/lab5-reference"
OUT = ROOT / "output/lab5"
ESC = html.escape


def schematic(number: int) -> str:
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 820" role="img" aria-label="Lab 5 회로 {number} 재구성 회로도"><style>text{{font:19px Arial,\'Malgun Gothic\',sans-serif;fill:#24262a}}.wire{{stroke:#34383f;stroke-width:2.5;fill:none}}.small{{font-size:15px;fill:#5e6470}}.title{{font-size:24px;font-weight:bold}}</style><rect width="1400" height="820" fill="#fafafa"/>']
    def line(x1, y1, x2, y2): parts.append(f'<path stroke="#34383f" stroke-width="2.5" fill="none" d="M{x1},{y1} L{x2},{y2}"/>')
    def text(x, y, value, cls="", anchor="start"):
        size = 15 if cls == "small" else 24 if cls == "title" else 19
        parts.append(f'<text x="{x}" y="{y}" font-family="Arial,Malgun Gothic,sans-serif" font-size="{size}" fill="#24262a" text-anchor="{anchor}">{ESC(value)}</text>')
    def dot(x, y): parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#34383f"/>')
    def net(x, y, name, anchor="start"):
        text(x, y, name, "", anchor)
    def gnd(x, y):
        line(x, y - 12, x, y)
        for yy, width in [(0, 15), (6, 10), (12, 4)]: line(x - width, y + yy, x + width, y + yy)
    def resistor(x, y, label, value):
        line(x, y - 42, x, y - 25)
        parts.append(f'<rect x="{x-10}" y="{y-25}" width="20" height="50" fill="white" stroke="#34383f" stroke-width="2.5"/>')
        line(x, y + 25, x, y + 42)
        text(x + 20, y - 5, label, "small")
        text(x + 20, y + 18, value)
    def capacitor(x, y, label, horizontal=False):
        if horizontal:
            line(x - 42, y, x - 5, y); line(x + 5, y, x + 42, y)
            line(x - 5, y - 18, x - 5, y + 18); line(x + 5, y - 18, x + 5, y + 18)
            text(x, y - 30, label, "small", "middle"); text(x, y + 42, "100 µF", "", "middle")
        else:
            line(x, y - 42, x, y - 5); line(x, y + 5, x, y + 42)
            line(x - 18, y - 5, x + 18, y - 5); line(x - 18, y + 5, x + 18, y + 5)
            text(x + 28, y - 5, label, "small"); text(x + 28, y + 20, "100 µF")
    def transistor(x, y, name, base_right=False):
        direction = -1 if base_right else 1
        parts.append(f'<circle cx="{x}" cy="{y}" r="31" fill="white" stroke="#34383f" stroke-width="2.3"/>')
        bx = x - 11 * direction
        line(bx, y - 19, bx, y + 19)
        line(bx, y, x - 45 * direction, y)
        line(bx, y - 10, x + 10 * direction, y - 24); line(x + 10 * direction, y - 24, x, y - 40)
        line(bx, y + 10, x + 13 * direction, y + 27); line(x + 13 * direction, y + 27, x, y + 40)
        ax, ay = x + 9 * direction, y + 24
        parts.append(f'<path d="M{ax},{ay} l{-10*direction},-1 l{5*direction},-7 Z" fill="#34383f"/>')
        label_x = x - 120 if base_right else x + 43
        text(label_x, y - 13, name); text(label_x, y + 13, "BC109C", "small")
        text(x - 6, y - 47, "C", "small"); text(x - 6, y + 58, "E", "small")
    def source(x, y, label, setting):
        parts.append(f'<circle cx="{x}" cy="{y}" r="25" fill="white" stroke="#34383f" stroke-width="2.3"/><path stroke="#34383f" stroke-width="2.5" fill="none" d="M{x-15},{y} Q{x-7},{y-20} {x},{y} Q{x+7},{y+20} {x+15},{y}"/>')
        text(x - 40, y - 36, label); text(x, y + 50, setting, "small", "middle")
    def divider(x, target, top_label, bottom_label):
        net(x, 50, "+9 V", "middle"); line(x, 57, x, 83)
        resistor(x, 125, top_label, "62 kΩ"); line(x, 167, x, 205)
        dot(x, 205); line(x, 205, x + 65, 205); net(x + 72, 211, target)
        line(x, 205, x, 223); resistor(x, 265, bottom_label, "30 kΩ"); line(x, 307, x, 325); gnd(x, 325)
    text(45, 26, f"회로 {number} · 원문 연결을 옮긴 수치 회로도", "title")
    if number < 3: divider(115, "B1", "RB11", "RB12")
    else:
        text(55, 105, "회로 2의 B1 분압기 제거", "small")
        text(55, 134, "B1은 변압기 S−에만 연결", "small")
    divider(385, "B2" if number == 1 else "CT", "RB21" if number == 1 else "RBCT1", "RB22" if number == 1 else "RBCT2")
    # Collector-loaded differential pair and lower common-emitter input device.
    line(850, 55, 1160, 55); text(1005, 47, "+9 V", "", "middle")
    for x, label, transistor_id, node in [(850, "RC1", "Q1", "OUT1"), (1160, "RC2", "Q2", "OUT2")]:
        line(x, 55, x, 68); resistor(x, 110, label, "10 kΩ"); line(x, 152, x, 170)
        dot(x, 160); line(x, 160, x + 70, 160); net(x + 75, 166, node)
        transistor(x, 210, transistor_id, x == 1160)
        line(x, 250, x, 300); line(x, 300, 1005, 300)
    net(790, 216, "B1", "end"); line(795, 210, 805, 210)
    net(1220, 216, "B2"); line(1205, 210, 1215, 210)
    dot(1005, 300); line(1005, 300, 1005, 460); net(1020, 330, "S / TAIL")
    transistor(1005, 500, "Q3")
    net(945, 506, "B3", "end"); line(950, 500, 960, 500)
    line(1005, 540, 1005, 590); dot(1005, 580); net(1020, 575, "E3")
    line(1005, 580, 1150, 580); line(1150, 580, 1150, 608)
    resistor(1005, 650, "REE", "1 kΩ"); line(1005, 590, 1005, 608); line(1005, 692, 1005, 740)
    capacitor(1150, 650, "CE"); line(1150, 692, 1150, 740); line(1005, 740, 1150, 740); gnd(1080, 740)
    # Q3's independent bias network. Named B3 connects to the transistor base.
    net(720, 391, "+9 V", "middle"); line(720, 399, 720, 403)
    resistor(720, 445, "RB31", "82 kΩ"); line(720, 487, 720, 510)
    dot(720, 510); line(720, 510, 775, 510); net(782, 516, "B3")
    line(720, 510, 720, 538); resistor(720, 580, "RB32", "12 kΩ"); line(720, 622, 720, 650); gnd(720, 650)
    if number == 1:
        text(70, 420, "변압기 없음", "title")
        text(70, 455, "B1·B2는 각자의 62 kΩ / 30 kΩ으로 바이어스", "small")
    else:
        # Transformer schematic only: named terminals avoid false crossing junctions.
        source(155, 445, "VC / LO", "10 mV peak · 10 kHz")
        line(155, 420, 155, 385); line(155, 385, 300, 385)
        line(155, 470, 70, 470); line(70, 470, 70, 505); line(70, 505, 300, 505); gnd(70, 545); line(70, 505, 70, 533)
        parts.append('<rect x="300" y="360" width="235" height="170" rx="10" fill="#f0f1f3" stroke="#a9afb8"/>')
        text(417, 350, "T1 · 이상 센터탭 변압기", "small", "middle")
        line(300, 385, 350, 385); line(300, 505, 350, 505)
        parts.append('<path stroke="#34383f" stroke-width="2.5" fill="none" d="M350,385 q28,10 0,20 q28,10 0,20 q28,10 0,20 q28,10 0,20 q28,10 0,20 q28,10 0,20"/>')
        line(394, 382, 394, 508); line(402, 382, 402, 508)
        parts.append('<path stroke="#34383f" stroke-width="2.5" fill="none" d="M448,385 q-28,10 0,20 q-28,10 0,20 q-28,10 0,20 q-28,10 0,20 q-28,10 0,20 q-28,10 0,20"/>')
        for y, label, pin in [(385, "B2", "S+"), (445, "CT", "CT"), (505, "B1", "S−")]:
            line(448, y, 555, y); net(565, y + 6, label); text(482, y - 10, pin, "small")
        text(315, 377, "P+", "small"); text(315, 521, "P−", "small")
        text(417, 555, "Np : 전체 Ns = 1:1 가정", "small", "middle")
        text(417, 580, "실제 권선비·손실 파라미터는 원문에 없음", "small", "middle")
    if number != 2:
        amplitude = "20 mV" if number == 1 else "10 mV"
        source(285, 700, "VM / RF", f"{amplitude} peak · 1 kHz")
        line(285, 675, 285, 635); line(285, 635, 423, 635)
        capacitor(465, 635, "CIN", horizontal=True); line(507, 635, 555, 635); net(565, 641, "B3")
        line(285, 725, 170, 725); line(170, 725, 170, 760); gnd(170, 760)
    else:
        text(70, 660, "Q3 입력원과 CIN 제거", "title")
        text(70, 698, "B3는 82 kΩ / 12 kΩ 분압의 DC 바이어스만 인가", "small")
    text(800, 795, "같은 노드명은 서로 연결 · OUT1/OUT2는 별도 노드 · GND 공통", "small", "middle")
    parts.append("</svg>")
    return "".join(parts)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    comparison = json.loads((SOURCE / "numerical-comparison.json").read_text(encoding="utf-8"))
    raw = json.loads((SOURCE / "app-results.json").read_text(encoding="utf-8"))
    cases = {case["caseId"]: case for case in raw["cases"] if case["ratio"] == "1:1"}
    image = base64.b64encode((SOURCE / "lab5-waveform-comparison.png").read_bytes()).decode("ascii")
    rows = "".join(f'<tr><th>{ESC(row["quantity"])}</th><td>{row["pdf"]:.6f}</td><td>{row["fullModel"]:.6f}<small>{row["fullErrorPercent"]:+.3f}%</small></td><td>{row["actualApp"]:.6f}<small>{row["actualAppErrorPercent"]:+.3f}%</small></td></tr>' for row in comparison["rows"])
    circuits = []
    for i, key in [(1, "c1-drive"), (2, "c2-drive"), (3, "c3-mix")]:
        case = cases[key]
        svg = schematic(i)
        (OUT / f"circuit-{i}.svg").write_text(svg, encoding="utf-8")
        component_rows = []
        for part in case["circuit"]["components"]:
            if part["id"].startswith("Q"):
                pins = "C=" + part["pinNets"]["3"] + ", B=" + part["pinNets"]["2"] + ", E=" + part["pinNets"]["1"]
            elif part["id"] == "T1":
                pins = "P+=LO, P−=GND, S+=B2, CT=CT, S−=B1"
            else:
                pins = " ↔ ".join(part["pinNets"].values())
            component_rows.append(f'<tr><th>{ESC(part["id"])}</th><td>{ESC(part["value"])}</td><td>{ESC(pins)}</td></tr>')
        condition = case["definition"]["condition"]
        window = {1: "0–10 ms 실행 · 4.5–5.5 ms에서 peak 비교", 2: "0–0.5 ms 실행 · 0.3–0.5 ms에서 peak 비교", 3: "0–5 ms 실행 · 3–5 ms에서 9/10/11 kHz 성분 비교"}[i]
        circuits.append(f'<section id="c{i}" class="circuit"><h2>회로 {i}</h2><p>{ESC(condition)} · +9 V</p><p class="muted">{window}. {ESC(case["definition"]["sourcePages"])}</p><div class="schematic">{svg}</div><details><summary>전체 소자값과 연결 노드 확인</summary><table><thead><tr><th>소자</th><th>값</th><th>연결</th></tr></thead><tbody>{"".join(component_rows)}</tbody></table></details></section>')
    html_text = '''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lab 5 회로 재현 검증</title><style>
    :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f3f3f4;color:#25262a;font:16px/1.7 system-ui,"Malgun Gothic",sans-serif}main{max-width:1260px;margin:auto;padding:48px 28px}h1{font-size:36px;line-height:1.3;margin:10px 0 24px}h2{font-size:24px;margin:0 0 12px}p{margin:10px 0}.eyebrow{letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:700;color:#666b73}.lead{font-size:20px;max-width:1000px}.muted,small{color:#656a73}section,.card{background:#fff;border:1px solid #dedfe3;border-radius:15px;padding:26px;margin:24px 0}.verdict{border-left:4px solid #41454d}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:24px 0}.metric{background:#e9eaed;border-radius:12px;padding:18px}.metric strong{font-size:28px;display:block}nav{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}a{color:#363a43}nav a{background:#fff;border:1px solid #d6d8de;border-radius:9px;padding:7px 16px;text-decoration:none}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:13px 12px;border-bottom:1px solid #e3e5e8;text-align:left;vertical-align:top}thead{background:#f0f1f3}tbody th{font-weight:500}small{display:block}.plot{width:100%;height:auto;border-radius:10px}.schematic{overflow:auto;background:#fafafa;border:1px solid #e2e4e7;border-radius:10px}.schematic svg{display:block;width:100%;min-width:820px;height:auto}summary{cursor:pointer;font-weight:600;padding:12px 0}ul{padding-left:24px}li{margin:10px 0}code{background:#eeeef1;border-radius:4px;padding:2px 5px}footer{color:#666b73;font-size:13px;margin-top:36px}@media(max-width:650px){main{padding:24px 14px}h1{font-size:28px}section,.card{padding:18px}.metrics{grid-template-columns:1fr}.lead{font-size:18px}}
    </style><main><div class="eyebrow">Electronics lab / Independent verification / 2026-11-04</div><h1>Lab 5 · 세 회로를 다시 만들고 비교했습니다</h1>
    <p class="lead">원문 세 회로를 구분해서 재구성하고, 사이트 실제 계산 엔진과 독립 ngspice로 실행했습니다. 현재 사이트 모델의 오차와, 수업의 전체 BC109C 모델을 사용했을 때의 결과를 따로 보여줍니다.</p>
    <div class="card verdict"><strong>대표 비교값: 전체 SPICE 모델은 원문 시뮬레이션과 약 0.51% 이내, 현재 사이트 엔진은 일부 성분에서 약 18.54% 차이.</strong><p>변압기를 이상적 1:1로 가정한 시나리오입니다. 원문에 권선비·손실·온도 조건이 완전히 기재되지 않아, 이 일치가 실제 부품의 동일성을 증명하지는 않습니다. 전체 모델은 독립 검증에 사용했으며 사이트에 반영된 모델이라고 표시하지 않습니다.</p></div>
    <div class="metrics"><div class="metric"><span>재구성</span><strong>3개 회로</strong><small>DC·단일 입력·두 입력 혼합</small></div><div class="metric"><span>독립 SPICE</span><strong>15개 조건</strong><small>전체/축약 모델 · 1:1/2:1 · 온도</small></div><div class="metric"><span>사이트 엔진 검증</span><strong>7회 실행</strong><small>동일 축약 SPICE 대비 파형 차이 0.06% 이내</small></div></div>
    <nav><a href="#results">수치 비교</a><a href="#waves">파형</a><a href="#c1">회로 1</a><a href="#c2">회로 2</a><a href="#c3">회로 3</a><a href="#limits">원문 충돌·한계</a></nav>
    <section id="results"><h2>대표 수치 비교</h2><p>단위 V. 회로 1·2의 peak는 선택 구간의 Vpp/2이며, 회로 3은 차동 출력의 해당 주파수 사인 성분 peak입니다. 서로 다른 측정 정의를 섞지 않았습니다.</p><div class="table-wrap"><table><thead><tr><th>측정값</th><th>원문 시뮬레이션</th><th>수업 전체 모델 · ngspice</th><th>사이트 실제 엔진 · 축약 모델</th></tr></thead><tbody>__ROWS__</tbody></table></div><p class="muted">오차는 원문 대비. 전체 모델 27°C, 사이트 모델 300 K(26.85°C). 동일 300 K의 전체 모델도 별도로 실행했습니다. 사이트 결과는 실제 소스 모듈을 로컬에서 직접 실행한 값이며 운영 브라우저 캡처는 아닙니다.</p></section>
    <section id="waves"><h2>직접 계산한 파형</h2><img class="plot" alt="세 회로의 전체 SPICE 모델과 사이트 실제 계산 엔진 파형 비교" src="data:image/png;base64,__IMAGE__"><p class="muted">회로 1은 커패시터의 충전 때문에 초기 진폭이 변합니다. 원문 커서가 있는 약 5 ms 구간을 맞춰 비교했습니다.</p></section>
    __CIRCUITS__
    <section id="limits"><h2>원문에서 확인한 충돌과 남은 한계</h2><ul>
    <li><strong>회로 1 입력:</strong> 한 회로도에는 10 mV라고 쓰여 있지만 지시문·입력 파형·표는 20 mV peak를 가리킵니다. 본 비교는 20 mV 조건이며 10 mV 표기를 원문 충돌로 남겼습니다.</li>
    <li><strong>회로 3 반송파 입력:</strong> 캡처의 ‘1 Vac’ 표기만으로 시간영역 입력을 확정할 수 없어 본문의 10 mV peak·10 kHz 조건을 적용했습니다.</li>
    <li><strong>변압기:</strong> 원문은 XFRM_LIN/CT-PRI 기호만 보여줍니다. 권선비·인덕턴스·권선저항·결합계수가 없습니다. 1:1과 2:1 시나리오를 모두 실행했으며, 결과가 잘 맞는다는 이유로 1:1을 확인된 실물값으로 바꾸지 않았습니다.</li>
    <li><strong>회로 2의 CT:</strong> B1 분압기가 남아 있으므로 CT는 AC 접지가 아닙니다. 이 비대칭 부하 때문에 10 mV 차동 권선 전압에서도 B1의 대지 진폭은 약 2.5 mV가 됩니다. 회로 3에서는 이 분압기가 제거됩니다.</li>
    <li><strong>11 kHz 성분:</strong> 그래프 커서는 10.989 kHz에서 145.570 mV, 본문은 153.721 mV입니다. 표는 정확한 11 kHz 성분과 본문값을 비교합니다. 그래프의 다른 커서값을 덮어쓰지 않았습니다.</li>
    <li><strong>스펙트럼 배율:</strong> 원문의 주파수 진폭 ×2 및 계수 a·b 계산은 정규화 정의와 일부 숫자가 충돌합니다. 실측 DSA의 dBVrms도 peak와 같은 단위가 아닙니다. 이 계수를 정답으로 삼아 모델을 맞추지 않았습니다.</li>
    <li><strong>실측 결과:</strong> 실제 OUT1/OUT2의 DC 불균형과 큰 이득 차이는 동일한 이상 부품으로 재현되지 않습니다. 실제 부품값·변압기 특성·측정 부하 확인이 필요합니다. myDAQ DSA 화면 자체는 요청에 따라 제외했습니다.</li>
    <li><strong>b를 1.2배로 만드는 설계:</strong> 두 보고서 모두 ‘수행하지 않음’입니다. 따라서 비교할 네 번째 완성 회로나 결과가 없습니다.</li>
    <li><strong>빵판:</strong> 여기의 회로도 수치 검증은 BC109C TO-18 리드와 변압기의 실제 빵판 삽입 검증을 뜻하지 않습니다. 자동으로 다른 트랜지스터로 대체하지 않았습니다.</li>
    </ul></section>
    <section><h2>검증 방법</h2><p>원본 PDF는 수정하지 않았습니다. 수업 Transistors.lib의 BC109C 전체 모델을 변경 없이 사용했고, 공식 ngspice 47로 별도 계산했습니다. 사이트의 동일 축약 모델도 ngspice에서 다시 풀어 수치 엔진 자체를 대조했습니다. 파형 측정은 회로별 지정 구간에서 수행했습니다.</p><p>현재 사이트 엔진과 동일 축약 ngspice는 DC 약 1.2 µV, 파형 대표값 약 0.06% 이내에서 일치했습니다. 원문과의 나머지 차이를 단순 계산 오류나 화면 문제로 숨기지 않고 반도체 모델 차이로 구분했습니다.</p><p class="muted">모델: 전체 BC109C는 Early 효과·누설·접합 용량·전달시간 등을 포함합니다. 현재 사이트는 Is/BF/BR 중심의 축약 모델입니다. 변압기 철손·포화·주파수 특성은 이번 이상 모델에 포함되지 않습니다.</p></section>
    <footer>개인 식별정보를 제외한 독립 검증 자료. 이 파일은 외부 서버 연결 없이 열립니다. 재현 스크립트: lab5_ngspice.py → lab5_app_results.mjs → lab5_report.py → lab5_html.py.</footer></main></html>'''
    html_text = html_text.replace("__ROWS__", rows).replace("__IMAGE__", image).replace("__CIRCUITS__", "".join(circuits))
    (OUT / "lab5-comparison.html").write_text(html_text, encoding="utf-8")
    (OUT / "numerical-comparison.json").write_text(json.dumps(comparison, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "lab5-waveform-comparison.png").write_bytes((SOURCE / "lab5-waveform-comparison.png").read_bytes())
    print(str(OUT / "lab5-comparison.html"))


if __name__ == "__main__":
    main()
