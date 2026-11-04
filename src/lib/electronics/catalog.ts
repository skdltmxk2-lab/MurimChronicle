import type { ComponentDefinition, ComponentKind } from "./types";

const pins = (...labels: string[]) => labels.map((label, i) => ({ id: String(i + 1), label }));
const generic = (id: string, name: string, kind: ComponentKind, pkg: string, labels: string[], description: string): ComponentDefinition => ({
  id, name, kind, package: pkg, category: "기본 수동소자", pins: pins(...labels), mounting: "direct", pinoutStatus: "generic", description,
});
const verified = (id: string, name: string, kind: ComponentKind, pkg: string, labels: string[], sourceUrl: string, description: string): ComponentDefinition => ({
  id, name, kind, package: pkg, category: kind === "transistor" || kind === "mosfet" ? "트랜지스터" : kind === "opamp" ? "연산증폭기" : "다이오드", pins: pins(...labels), mounting: "direct", pinoutStatus: "datasheet", sourceUrl, description,
});

/** Reference entries deliberately contain no speculative physical pin mapping. */
const reference = (part: string, pkg: string, kind: ComponentKind, category: string, description: string, sourceUrl?: string): ComponentDefinition => ({
  id: `ref-${part.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${pkg.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: part, package: pkg, kind, category, description: `${description} 제조사·주문품번·패키지 도면과 핀맵 확인 전에는 자동 배치할 수 없습니다.`,
  pins: [], mounting: /SOIC|SOT|TSSOP|QFN|LQFP|SMD/.test(pkg) ? "adapter" : /Module|TO-3|TO-18/.test(pkg) ? "external" : "direct", pinoutStatus: "unverified", sourceUrl,
});

const core: ComponentDefinition[] = [
  generic("resistor-axial", "축형 저항", "resistor", "Axial 1/4W", ["1", "2"], "비극성 2단자 일반 모델. 값·허용오차·정격은 실제 부품으로 확인합니다. 저항값의 변형은 별도 소자 종류로 세지 않습니다."),
  generic("capacitor-ceramic", "세라믹 커패시터", "capacitor", "Radial", ["1", "2"], "비극성 2단자. 리드 간격은 실물에 맞춰 성형하고 내압을 확인합니다."),
  generic("capacitor-film", "필름 커패시터", "capacitor", "Radial film", ["1", "2"], "비극성 2단자. 몸체 폭과 리드 간격은 실물 확인이 필요합니다."),
  generic("capacitor-electrolytic", "전해 커패시터", "electrolytic", "Radial electrolytic", ["+", "−"], "1번은 +, 2번은 −인 논리적 삽입 모델. 실물의 음극 띠·리드 표시를 확인해 맞춥니다. 제조사 핀 번호를 의미하지 않습니다."),
  generic("led-5mm", "LED 5 mm", "led", "Radial 5mm", ["A", "K"], "1번 A(양극), 2번 K(음극)인 삽입 모델. 실물 극성 확인 필요. 직렬 전류제한 저항을 사용합니다."),
  generic("led-3mm", "LED 3 mm", "led", "Radial 3mm", ["A", "K"], "1번 A, 2번 K인 일반 모델. LED 색별 순방향 전압은 별도 확인합니다."),
  generic("inductor-axial", "축형 인덕터", "inductor", "Axial", ["1", "2"], "2단자 비극성 모델. 직류저항·포화전류·실물 치수를 확인합니다."),
  generic("connector-2pin", "2핀 연결 단자", "connector", "Header 2.54mm 1x2", ["1", "2"], "2.54 mm 단열 헤더의 일반 모델. 1번 표시는 조립 방향에 맞춰 확인합니다."),
  verified("diode-1n4148-vishay-do35", "Vishay 1N4148", "diode", "DO-35", ["A", "K"], "https://www.vishay.com/docs/81857/1n4148.pdf", "검은 띠가 K(음극). 여기서는 1=A, 2=K인 삽입 모델로 표시합니다. 제조사 데이터시트의 극성과 패키지를 확인했습니다."),
  verified("bjt-bc549c-onsemi-to92", "onsemi BC549C", "transistor", "TO-92", ["C", "B", "E"], "https://www.onsemi.com/pdf/datasheet/bc550-d.pdf", "평평한 인쇄면을 정면에서 보고 리드를 아래로 놓으면 왼쪽부터 1=C, 2=B, 3=E. onsemi CASE 135AN 계열 기준. 수업에 제공된 Motorola BC549 자료도 C-B-E이지만 실물 제조사를 확인합니다."),
  verified("bjt-bc556b-onsemi-to92", "onsemi BC556B", "transistor", "TO-92", ["C", "B", "E"], "https://www.onsemi.com/pdf/datasheet/bc556b-d.pdf", "PNP. 평평한 인쇄면을 정면에서 보고 리드를 아래로 놓으면 왼쪽부터 1=C, 2=B, 3=E. CASE 29 STYLE 17 기준."),
  verified("bjt-2n3904-onsemi-to92", "onsemi 2N3904", "transistor", "TO-92", ["E", "B", "C"], "https://www.onsemi.com/pdf/datasheet/2n3903-d.pdf", "NPN. 평평한 인쇄면을 정면에서 보고 리드를 아래로 놓으면 왼쪽부터 1=E, 2=B, 3=C. BC549와 핀 순서가 다릅니다."),
  verified("mosfet-2n7000ta-onsemi-to92", "onsemi 2N7000TA", "mosfet", "TO-92", ["S", "G", "D"], "https://www.onsemi.com/download/data-sheet/pdf/2n7000ta-d.pdf", "N채널. 평평한 인쇄면을 정면에서 보고 리드를 아래로 놓으면 왼쪽부터 1=S, 2=G, 3=D. 리드 성형 종류와 실제 제조사를 확인합니다."),
  verified("opamp-ua741cn-st-dip8", "ST UA741CN", "opamp", "DIP8", ["OFFSET 1", "IN−", "IN+", "V−", "OFFSET 2", "OUT", "V+", "NC"], "https://www.st.com/resource/en/datasheet/ua741.pdf", "윗면에서 홈을 위로 두면 왼쪽 위가 1번, 반시계 방향으로 번호가 증가합니다. 1·5번 오프셋 조정과 8번 NC를 임의 접지하지 않습니다. 핀맵 확인은 동작/성능 검증과 별개입니다."),
  { id: "bjt-bc109c-philips-to18", name: "Philips BC109C", category: "트랜지스터", kind: "transistor", package: "TO-18 SOT18", pins: pins("E", "B", "C / CASE"), mounting: "external", pinoutStatus: "datasheet", description: "사용자 제공 generalNPN_BC109.pdf(Philips, 1997-09-03) p.2: 1=E, 2=B, 3=C 및 금속 캔. 삼각 리드·탭 방향의 물리 배치가 필요해 현재 직선 3핀 자동 배치에서 제외합니다. TO-92와 자동 치환하지 않습니다." },
  reference("CS195", "Transformer Module", "transformer", "수업 특수부품", "수업 키트의 600 Ω:8 Ω, 3핀:2핀 매칭 트랜스. 실제 권선·센터탭·극성·단자 위치 미확정."),
  reference("CMA-4544PF-W", "Microphone Module", "microphone", "수업 특수부품", "일렉트릿 마이크. 케이스 접지와 바이어스·극성 확인이 필요합니다."),
  reference("MB102 Power Supply", "Power Module", "connector", "수업 특수부품", "빵판 전원 모듈. 점퍼 설정·입출력 전압·배열은 실제 보드별로 확인합니다."),
];

const analog: [string, string, ComponentKind, string][] = [
  ["LM358P", "DIP8", "opamp", "듀얼 연산증폭기"], ["LM324N", "DIP14", "opamp", "쿼드 연산증폭기"],
  ["TL071CP", "DIP8", "opamp", "JFET 입력 연산증폭기"], ["TL072CP", "DIP8", "opamp", "듀얼 JFET 입력 연산증폭기"], ["TL074CN", "DIP14", "opamp", "쿼드 JFET 입력 연산증폭기"],
  ["NE5532P", "DIP8", "opamp", "오디오 듀얼 연산증폭기"], ["NE5534P", "DIP8", "opamp", "오디오 연산증폭기"], ["LM301AN", "DIP8", "opamp", "외부 보상 연산증폭기"],
  ["OP07CP", "DIP8", "opamp", "정밀 연산증폭기"], ["OPA2134PA", "DIP8", "opamp", "오디오 듀얼 연산증폭기"],
  ["LM311P", "DIP8", "ic", "비교기"], ["LM393P", "DIP8", "ic", "듀얼 비교기"], ["LM339N", "DIP14", "ic", "쿼드 비교기"],
  ["NE555P", "DIP8", "ic", "범용 타이머"], ["NE556N", "DIP14", "ic", "듀얼 타이머"], ["TLC555CP", "DIP8", "ic", "CMOS 타이머"],
  ["LM386N-1", "DIP8", "ic", "오디오 전력증폭기"], ["INA128P", "DIP8", "ic", "계측증폭기"], ["AD620ANZ", "DIP8", "ic", "계측증폭기"],
  ["LM13700N", "DIP16", "ic", "트랜스컨덕턴스 증폭기"], ["AD633JN", "DIP8", "ic", "아날로그 곱셈기"],
  ["LM7805CT", "TO-220", "ic", "5 V 레귤레이터"], ["LM7812CT", "TO-220", "ic", "12 V 레귤레이터"], ["LM7912CT", "TO-220", "ic", "음전압 레귤레이터"],
  ["LM317T", "TO-220", "ic", "가변 양전압 레귤레이터"], ["LM337T", "TO-220", "ic", "가변 음전압 레귤레이터"], ["TL431CLP", "TO-92", "ic", "가변 션트 기준전압"],
  ["LM35DZ", "TO-92", "ic", "아날로그 온도 센서"], ["TMP36GT9Z", "TO-92", "ic", "아날로그 온도 센서"],
  ["MCP3008-I/P", "DIP16", "ic", "SPI ADC"], ["MCP3208-CI/P", "DIP16", "ic", "SPI ADC"], ["MCP4921-E/P", "DIP8", "ic", "SPI DAC"],
  ["ADC0804LCN", "DIP20", "ic", "병렬 ADC"], ["DAC0808LCN", "DIP16", "ic", "전류출력 DAC"],
  ["LM358DR", "SOIC8", "opamp", "표면실장 듀얼 연산증폭기"], ["UA741CD", "SOIC8", "opamp", "표면실장 741"],
  ["MCP6002-I/P", "DIP8", "opamp", "듀얼 저전압 연산증폭기"], ["MCP6022-I/P", "DIP8", "opamp", "듀얼 연산증폭기"],
];

const digital: [string, string, string][] = [
  ["SN74HC00N", "DIP14", "NAND"], ["SN74HC02N", "DIP14", "NOR"], ["SN74HC04N", "DIP14", "인버터"], ["SN74HC08N", "DIP14", "AND"],
  ["SN74HC32N", "DIP14", "OR"], ["SN74HC86N", "DIP14", "XOR"], ["SN74HC14N", "DIP14", "슈미트 인버터"],
  ["SN74HC74N", "DIP14", "D 플립플롭"], ["SN74HC112N", "DIP16", "JK 플립플롭"], ["SN74HC123N", "DIP16", "원샷"],
  ["SN74HC138N", "DIP16", "3:8 디코더"], ["SN74HC139N", "DIP16", "듀얼 2:4 디코더"], ["SN74HC151N", "DIP16", "8:1 MUX"],
  ["SN74HC153N", "DIP16", "듀얼 4:1 MUX"], ["SN74HC157N", "DIP16", "쿼드 2:1 MUX"], ["SN74HC161N", "DIP16", "4비트 동기 카운터·비동기 클리어"], ["SN74HC163N", "DIP16", "4비트 동기 카운터"],
  ["SN74HC164N", "DIP14", "직렬입력 시프트 레지스터"], ["SN74HC165N", "DIP16", "병렬입력 시프트 레지스터"], ["SN74HC193N", "DIP16", "업다운 카운터"],
  ["SN74HC245N", "DIP20", "버스 트랜시버"], ["SN74HC373N", "DIP20", "8비트 래치"], ["SN74HC595N", "DIP16", "출력 래치 시프트 레지스터"],
  ["SN74LS00N", "DIP14", "TTL NAND"], ["SN74LS04N", "DIP14", "TTL 인버터"], ["SN74LS08N", "DIP14", "TTL AND"],
  ["SN74LS32N", "DIP14", "TTL OR"], ["SN74LS47N", "DIP16", "7세그먼트 디코더"], ["SN74LS74AN", "DIP14", "TTL D 플립플롭"],
  ["CD4001BE", "DIP14", "CMOS NOR"], ["CD4011BE", "DIP14", "CMOS NAND"], ["CD4013BE", "DIP14", "CMOS D 플립플롭"],
  ["CD4017BE", "DIP16", "10진 카운터"], ["CD4027BE", "DIP16", "CMOS JK 플립플롭"], ["CD4040BE", "DIP16", "12비트 카운터"],
  ["CD4046BE", "DIP16", "PLL"], ["CD4047BE", "DIP14", "단안정/비안정 멀티바이브레이터"], ["CD4051BE", "DIP16", "8채널 아날로그 MUX"],
  ["CD4052BE", "DIP16", "듀얼 아날로그 MUX"], ["CD4053BE", "DIP16", "트리플 아날로그 스위치"], ["CD4066BE", "DIP14", "쿼드 아날로그 스위치"],
  ["CD4069UBE", "DIP14", "비버퍼 인버터"], ["CD4093BE", "DIP14", "슈미트 NAND"], ["CD4511BE", "DIP16", "BCD 7세그먼트"],
  ["ULN2003AN", "DIP16", "다알링턴 드라이버"], ["ULN2803AN", "DIP18", "8채널 드라이버"], ["L293D", "DIP16", "모터 H브리지"],
  ["MAX232CPE", "DIP16", "RS-232 변환"], ["SN75176BP", "DIP8", "RS-485 트랜시버"],
];

const discrete: [string, string, ComponentKind, string][] = [
  ["2N3906", "TO-92", "transistor", "PNP"], ["PN2222A", "TO-92", "transistor", "NPN 스위칭"], ["PN2907A", "TO-92", "transistor", "PNP 스위칭"],
  ["BC547B", "TO-92", "transistor", "NPN"], ["BC548B", "TO-92", "transistor", "NPN"], ["BC550C", "TO-92", "transistor", "저잡음 NPN"],
  ["BC557B", "TO-92", "transistor", "PNP"], ["BC558B", "TO-92", "transistor", "PNP"], ["2SC1815", "TO-92", "transistor", "NPN"], ["2SA1015", "TO-92", "transistor", "PNP"],
  ["TIP31C", "TO-220", "transistor", "전력 NPN"], ["TIP32C", "TO-220", "transistor", "전력 PNP"], ["BD139", "TO-126", "transistor", "NPN 드라이버"], ["BD140", "TO-126", "transistor", "PNP 드라이버"],
  ["BS170", "TO-92", "mosfet", "N채널 MOSFET"], ["BS250", "TO-92", "mosfet", "P채널 MOSFET"], ["IRF510", "TO-220", "mosfet", "N채널 전력 MOSFET"],
  ["IRF540N", "TO-220", "mosfet", "N채널 전력 MOSFET"], ["IRLZ44N", "TO-220", "mosfet", "로직레벨 MOSFET"], ["2N7002", "SOT23", "mosfet", "표면실장 MOSFET"],
  ["J201", "TO-92", "transistor", "N채널 JFET"], ["2N5457", "TO-92", "transistor", "N채널 JFET"], ["J113", "TO-92", "transistor", "N채널 JFET"],
  ["1N4001", "DO-41", "diode", "정류 다이오드"], ["1N4007", "DO-41", "diode", "정류 다이오드"], ["1N5817", "DO-41", "diode", "쇼트키 다이오드"],
  ["1N5819", "DO-41", "diode", "쇼트키 다이오드"], ["BAT85", "DO-35", "diode", "소신호 쇼트키"], ["1N4733A", "DO-41", "diode", "제너 다이오드"],
  ["1N4735A", "DO-41", "diode", "제너 다이오드"], ["BZX55C5V1", "DO-35", "diode", "제너 다이오드"],
  ["PC817", "DIP4", "ic", "광커플러"], ["4N35", "DIP6", "ic", "광커플러"], ["MOC3021", "DIP6", "ic", "광트라이액 드라이버"],
  ["ATmega328P-PU", "DIP28", "ic", "마이크로컨트롤러"], ["PIC16F877A-I/P", "DIP40", "ic", "마이크로컨트롤러"],
];

// Manufacturer PDIP top-view pin tables reviewed 2026-11-04. / denotes active-low.
// Names deliberately distinguish complementary outputs and asynchronous controls.
const quadGate = ["1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"];
const hexInverter = ["1A", "1Y", "2A", "2Y", "3A", "3Y", "GND", "4Y", "4A", "5Y", "5A", "6Y", "6A", "VCC"];
const dualAmp = ["OUT1", "IN1−", "IN1+", "V−", "IN2+", "IN2−", "OUT2", "V+"];
const quadAmp = ["OUT1", "IN1−", "IN1+", "V+", "IN2+", "IN2−", "OUT2", "OUT3", "IN3−", "IN3+", "V−", "IN4+", "IN4−", "OUT4"];
const counter = ["/CLR", "CLK", "A", "B", "C", "D", "ENP", "GND", "/LOAD", "ENT", "QD", "QC", "QB", "QA", "RCO", "VCC"];
const reviewedDip: Record<string, { document: string; labels: string[]; note?: string }> = {
  LM358P: { document: "lm358", labels: dualAmp },
  LM324N: { document: "lm324", labels: quadAmp },
  TL072CP: { document: "tl072", labels: dualAmp },
  TL074CN: { document: "tl072", labels: quadAmp },
  LM393P: { document: "lm393", labels: ["OUT1", "IN1−", "IN1+", "GND", "IN2+", "IN2−", "OUT2", "VCC"], note: "오픈 컬렉터 출력에는 외부 풀업이 필요합니다." },
  LM339N: { document: "lm339", labels: ["OUT (IN6/7)", "OUT (IN4/5)", "VCC", "IN− (OUT2)", "IN+ (OUT2)", "IN− (OUT1)", "IN+ (OUT1)", "IN3−", "IN3+", "IN4−", "IN4+", "GND", "OUT4", "OUT3"], note: "출력 명칭의 제조사별 채널 번호 차이를 피하기 위해 첫 두 출력에 대응 물리 입력핀을 명시했습니다. 오픈 컬렉터 출력 풀업 필요." },
  NE555P: { document: "ne555", labels: ["GND", "TRIG", "OUT", "/RESET", "CONT", "THRES", "DISCH", "VCC"] },
  NE556N: { document: "ne556", labels: ["DISCH1", "THRES1", "CONT1", "/RESET1", "OUT1", "TRIG1", "GND", "TRIG2", "OUT2", "/RESET2", "CONT2", "THRES2", "DISCH2", "VCC"] },
  SN74HC00N: { document: "sn74hc00", labels: quadGate },
  SN74HC02N: { document: "sn74hc02", labels: ["1Y", "1A", "1B", "2Y", "2A", "2B", "GND", "3A", "3B", "3Y", "4A", "4B", "4Y", "VCC"] },
  SN74HC04N: { document: "sn74hc04", labels: hexInverter },
  SN74HC08N: { document: "sn74hc08", labels: quadGate },
  SN74HC32N: { document: "sn74hc32", labels: quadGate },
  SN74HC86N: { document: "sn74hc86", labels: quadGate },
  SN74HC14N: { document: "sn74hc14", labels: hexInverter },
  SN74HC74N: { document: "sn74hc74", labels: ["/CLR1", "D1", "CLK1", "/PRE1", "Q1", "/Q1", "GND", "/Q2", "Q2", "/PRE2", "CLK2", "D2", "/CLR2", "VCC"] },
  SN74HC138N: { document: "sn74hc138", labels: ["A", "B", "C", "/G2A", "/G2B", "G1", "/Y7", "GND", "/Y6", "/Y5", "/Y4", "/Y3", "/Y2", "/Y1", "/Y0", "VCC"] },
  SN74HC157N: { document: "sn74hc157", labels: ["A/B SELECT", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3B", "3A", "4Y", "4B", "4A", "/G", "VCC"] },
  SN74HC161N: { document: "sn74hc161", labels: counter, note: "CLR은 비동기 active-low입니다." },
  SN74HC163N: { document: "sn74hc163", labels: counter, note: "CLR은 동기 active-low입니다. HC161과 동작이 다릅니다." },
  SN74HC164N: { document: "sn74hc164", labels: ["A", "B", "QA", "QB", "QC", "QD", "GND", "CLK", "/CLR", "QE", "QF", "QG", "QH", "VCC"] },
  SN74HC165N: { document: "sn74hc165", labels: ["SH-/LD", "CLK", "E", "F", "G", "H", "/QH", "GND", "QH", "SER", "A", "B", "C", "D", "CLK INH", "VCC"] },
  SN74HC595N: { document: "sn74hc595", labels: ["QB", "QC", "QD", "QE", "QF", "QG", "QH", "GND", "QH SERIAL", "/SRCLR", "SRCLK", "RCLK", "/OE", "SER", "QA", "VCC"] },
  CD4066BE: { document: "cd4066b", labels: ["A IN/OUT", "A OUT/IN", "B OUT/IN", "B IN/OUT", "CTRL B", "CTRL C", "VSS", "C IN/OUT", "C OUT/IN", "D OUT/IN", "D IN/OUT", "CTRL D", "CTRL A", "VDD"] },
  CD4013BE: { document: "cd4013b", labels: ["Q1", "/Q1", "CLK1", "RESET1", "D1", "SET1", "VSS", "SET2", "D2", "RESET2", "CLK2", "/Q2", "Q2", "VDD"] },
  CD4051BE: { document: "cd4051b", labels: ["CH4", "CH6", "COM", "CH7", "CH5", "INH", "VEE", "VSS", "C", "B", "A", "CH3", "CH0", "CH1", "CH2", "VDD"] },
  CD4052BE: { document: "cd4051b", labels: ["Y0", "Y2", "Y COM", "Y3", "Y1", "INH", "VEE", "VSS", "B", "A", "X3", "X0", "X COM", "X1", "X2", "VDD"] },
  CD4053BE: { document: "cd4051b", labels: ["BY", "BX", "CY", "C COM", "CX", "INH", "VEE", "VSS", "C", "B", "A", "AX", "AY", "A COM", "B COM", "VDD"] },
};

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  ...core,
  ...analog.map(([part, pkg, kind, description]) => reference(part, pkg, kind, "아날로그·전원·변환", description)),
  ...digital.map(([part, pkg, description]) => reference(part, pkg, "ic", "디지털·인터페이스", description)),
  ...discrete.map(([part, pkg, kind, description]) => reference(part, pkg, kind, "개별반도체·센서", description)),
].map((part): ComponentDefinition => {
  const reviewed = reviewedDip[part.name];
  if (!reviewed) return part;
  return { ...part, name: `TI ${part.name}`, pins: pins(...reviewed.labels), pinoutStatus: "datasheet", sourceUrl: `https://www.ti.com/lit/ds/symlink/${reviewed.document}.pdf`, description: `${part.description.split(" 제조사")[0]} TI DIP 핀 표 확인. 윗면에서 홈을 위로 두면 왼쪽 위가 1번이며 반시계 방향으로 번호가 증가합니다. /는 active-low 또는 보수 출력을 뜻합니다. 전원 범위·입력 처리·디커플링은 데이터시트를 따르세요. ${reviewed.note ?? ""}` };
});

export const getDefinition = (id: string): ComponentDefinition | undefined => COMPONENT_CATALOG.find((part) => part.id === id);
