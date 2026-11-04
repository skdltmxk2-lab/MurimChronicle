import type { NonlinearDevice } from "./simulation-models";

type Matrix = Float64Array[];
type Evaluation = { currents: number[]; jacobian: number[][] };
type IndexedDevice = { device: NonlinearDevice; indices: (number | undefined)[] };

/** Solver-only convergence failure; callers may retry with source stepping. */
export class NewtonConvergenceError extends Error {
  constructor(message: string) { super(message); this.name = "NewtonConvergenceError"; }
}

export function createNewtonSolver(devices: NonlinearDevice[], index: Map<string, number>, nodeCount: number,
  solveLinear: (matrix: Matrix, rhs: Float64Array) => Float64Array, charge: (work: number) => void, drivenIndices: number[] = []) {
  const indexed: IndexedDevice[] = devices.map(device => ({ device, indices: device.pins.map(pin => index.get(pin)) }));
  const evaluations = (state: Float64Array): Evaluation[] => indexed.map(({ device, indices }) => {
    const result = device.evaluate(indices.map(i => i === undefined ? 0 : state[i]));
    if (result.currents.some(value => !Number.isFinite(value)) || result.jacobian.some(row => row.some(value => !Number.isFinite(value)))) throw new NewtonConvergenceError(`${device.id}: 비선형 모델의 수치 범위를 벗어났습니다.`);
    return result;
  });
  const linearize = (base: Matrix, state: Float64Array, values = evaluations(state), gmin = 0) => {
    const matrix = base.map(row => row.slice());
    for (let i = 0; i < nodeCount; i++) matrix[i][i] += gmin;
    indexed.forEach(({ indices }, d) => indices.forEach((row, pin) => {
      if (row === undefined) return;
      indices.forEach((column, other) => { if (column !== undefined) matrix[row][column] += values[d].jacobian[pin][other]; });
    }));
    return matrix;
  };
  const residual = (base: Matrix, rhs: Float64Array, state: Float64Array, values: Evaluation[], gmin: number) => {
    charge(base.length ** 2 + devices.length * 30);
    const errors = new Float64Array(base.length), scales = new Float64Array(base.length);
    for (let row = 0; row < base.length; row++) {
      errors[row] = -rhs[row]; scales[row] = Math.abs(rhs[row]);
      for (let column = 0; column < base.length; column++) { const value = base[row][column] * state[column]; errors[row] += value; scales[row] += Math.abs(value); }
      if (row < nodeCount) { errors[row] += gmin * state[row]; scales[row] += Math.abs(gmin * state[row]); }
    }
    indexed.forEach(({ indices }, d) => indices.forEach((row, pin) => { if (row !== undefined) { errors[row] += values[d].currents[pin]; scales[row] += Math.abs(values[d].currents[pin]); } }));
    let norm = 0;
    for (let row = 0; row < errors.length; row++) norm = Math.max(norm, Math.abs(errors[row]) / ((row < nodeCount ? 1e-10 : 1e-8) + 1e-7 * scales[row]));
    return norm;
  };
  const solve = (base: Matrix, rhs: Float64Array, initial: Float64Array, iterations = 40, gmin = 0): Float64Array => {
    let state: Float64Array = initial.slice();
    // Ideal sources are exact constraints, not nonlinear junction guesses. Keeping
    // them fixed avoids damping a source's new value by tiny fractions at clipping.
    drivenIndices.forEach((node, source) => { state[node] = rhs[nodeCount + source]; });
    for (let iteration = 0; iteration < iterations; iteration++) {
      const values = evaluations(state), norm = residual(base, rhs, state, values, gmin);
      const matrix = linearize(base, state, values, gmin), linearRhs = rhs.slice();
      indexed.forEach(({ indices }, d) => indices.forEach((row, pin) => {
        if (row === undefined) return;
        let offset = -values[d].currents[pin];
        indices.forEach((column, other) => { if (column !== undefined) offset += values[d].jacobian[pin][other] * state[column]; });
        linearRhs[row] += offset;
      }));
      charge(base.length ** 3 / 3 + 2 * base.length ** 2);
      let target: Float64Array;
      try { target = solveLinear(matrix, linearRhs); }
      catch (error) { throw new NewtonConvergenceError(error instanceof Error ? error.message : "특이한 비선형 회로입니다."); }
      // Factorization is mandatory even at zero residual: a floating zero-bias
      // node must not pass merely because an arbitrary zero vector satisfies KCL.
      let largestVoltageStep = 0;
      for (let i = 0; i < nodeCount; i++) largestVoltageStep = Math.max(largestVoltageStep, Math.abs(target[i] - state[i]));
      if (norm <= 1 && largestVoltageStep <= 1e-7) return state;
      let alpha = Math.min(1, 0.5 / Math.max(largestVoltageStep, 1e-30));
      let accepted: Float64Array | undefined;
      for (let search = 0; search < 16; search++, alpha *= 0.5) {
        const candidate = Float64Array.from(state, (value, i) => value + alpha * (target[i] - value));
        try {
          const candidateNorm = residual(base, rhs, candidate, evaluations(candidate), gmin);
          if (candidateNorm < norm || candidateNorm <= 1) { accepted = candidate; break; }
        } catch (error) { if (!(error instanceof NewtonConvergenceError)) throw error; }
      }
      if (!accepted) throw new NewtonConvergenceError("Newton 반복의 잔차가 줄어들지 않습니다.");
      state = accepted;
    }
    throw new NewtonConvergenceError(`Newton 반복 ${iterations}회 안에 수렴하지 않았습니다.`);
  };
  const operatingPoint = (base: Matrix, rhs: Float64Array): Float64Array => {
    const zero = new Float64Array(rhs.length);
    try { return solve(base, rhs, zero); }
    catch (error) { if (!(error instanceof NewtonConvergenceError)) throw error; }
    let state: Float64Array = zero;
    // Temporary conductance is a numerical continuation aid only. The accepted
    // final operating point must solve the original circuit with gmin exactly 0.
    for (let step = 0; step <= 10; step++) state = solve(base, Float64Array.from(rhs, value => value * step / 10), state, 60, 1e-7);
    for (const gmin of [1e-9, 1e-11, 0]) state = solve(base, rhs, state, 60, gmin);
    return state;
  };
  return { solve, operatingPoint, linearize };
}
