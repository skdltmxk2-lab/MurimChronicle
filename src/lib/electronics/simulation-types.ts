/** Numerical scope: ideal linear R/C and the explicitly verified UA741 pin map. */
export type SimulationWaveform = "sine" | "square" | "triangle" | "dc" | "pulse" | "sawtooth" | "am";

export type SimulationSource = {
  netId: string;
  waveform: SimulationWaveform;
  frequencyHz: number;
  amplitudePeak: number;
  offset: number;
  phaseDegrees?: number;
  /** Pulse high-state fraction, 1–99 percent; omitted means 50. */
  dutyCyclePercent?: number;
  /** AM envelope frequency; omitted means 100 Hz. Carrier uses frequencyHz. */
  modulationFrequencyHz?: number;
  /** AM envelope depth, 0–1; omitted means 0.2. */
  modulationDepth?: number;
};

export type SimulationConfig = {
  groundNetId: string;
  source: SimulationSource;
  /** Additional transient drives; AC excitation remains on the primary source. */
  extraSources?: SimulationSource[];
  opampModel?: "ideal" | "educational-dynamic";
  startupPerturbationVolts?: number;
  supplies: { netId: string; voltage: number }[];
  durationSeconds: number;
  sampleCount: number;
  acStartHz: number;
  acStopHz: number;
  acPoints: number;
};

export type SimulationResult = {
  model: "linear-ideal" | "nonlinear-educational";
  transientMethod: "backward-euler";
  /** Includes t=0; capacitors start at the DC operating point of source.offset. */
  time: number[];
  nodeVoltages: Record<string, number[]>;
  dc: {
    nodeVoltages: Record<string, number>;
    /** Resistor current from pin 1 to pin 2; ideal capacitor DC current is zero. */
    componentCurrents: Record<string, number>;
    /** Positive current flows from the driven net into its ideal voltage source. */
    sourceCurrents: Record<string, number>;
    /** Nonlinear pin currents, positive into each device terminal. */
    deviceCurrents?: Record<string, Record<string, number>>;
  };
  ac: {
    frequenciesHz: number[];
    /** Output/input voltage ratio for a unit AC excitation of config.source. */
    nodeGainMagnitude: Record<string, number[]>;
    nodePhaseDegrees: Record<string, number[]>;
  };
  acUnavailableReason?: string;
  warnings: string[];
};
