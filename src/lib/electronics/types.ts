export type ComponentKind = "resistor" | "capacitor" | "electrolytic" | "diode" | "led" | "transistor" | "mosfet" | "opamp" | "ic" | "potentiometer" | "inductor" | "switch" | "connector" | "transformer" | "microphone";

export type ComponentDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  package: string;
  kind: ComponentKind;
  pins: { id: string; label: string }[];
  mounting: "direct" | "adapter" | "external";
  pinoutStatus: "generic" | "datasheet" | "unverified";
  sourceUrl?: string;
  maxVoltage?: number;
};

export type CircuitComponent = {
  id: string;
  definitionId: string;
  value: string;
  pinNets: Record<string, string>;
};

export type InstrumentConnection = {
  id: string;
  instrument: string;
  port: string;
  netId: string;
  setting?: string;
};

export type Circuit = {
  id: string;
  title: string;
  description: string;
  components: CircuitComponent[];
  netNames: Record<string, string>;
  instruments: InstrumentConnection[];
  notes: string[];
  reviewItems: { id: string; message: string; resolved: boolean }[];
  provenance?: string;
};

export type BoardOptions = { boards: 1 | 2; railMode: "split" | "continuous" };
export type BoardHole = {
  id: string;
  board: number;
  row: string;
  column: number;
  x: number;
  y: number;
  group: string;
};
export type BoardGeometry = { holes: BoardHole[]; width: number; height: number; options: BoardOptions };
export type PlacedComponent = {
  componentId: string;
  pins: Record<string, string>;
};
export type Jumper = { id: string; netId: string; from: string; to: string; color: string };
export type TerminalPlacement = { connectionId: string; holeId: string; netId: string };
export type ValidationIssue = { severity: "error" | "warning"; code: string; message: string; componentId?: string };
export type ValidationReport = {
  valid: boolean;
  issues: ValidationIssue[];
  checkedPins: number;
  checkedNets: number;
};
export type CircuitLayout = {
  board: BoardGeometry;
  placements: PlacedComponent[];
  jumpers: Jumper[];
  terminals: TerminalPlacement[];
  issues: ValidationIssue[];
};

export type AssemblyStep = {
  id: string;
  title: string;
  description: string;
  componentId?: string;
  jumperId?: string;
  connectionId?: string;
  holes: string[];
};

export type Experiment = {
  id: string;
  number: string;
  title: string;
  summary: string;
  mode: "circuit" | "instruments" | "signal" | "mixed";
  topics: string[];
  settings: { label: string; value: string }[];
  procedure: string[];
  templateIds: string[];
  future: string[];
};

export type SavedProject = {
  version: 1;
  id: string;
  title: string;
  updatedAt: string;
  circuit: Circuit;
  boardOptions: BoardOptions;
  layout?: CircuitLayout;
  completedSteps: string[];
  experimentId?: string;
};
