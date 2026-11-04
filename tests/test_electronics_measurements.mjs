import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/electronics/simulation-measurements.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module, exports: module.exports });
const { differentialResponse, amplitudeSpectrum } = module.exports;
const near = (value, expected, tolerance=1e-9) => assert.ok(Math.abs(value-expected) <= tolerance, `${value} != ${expected}`);
test('differential AC combines complex voltages, including inversion and common mode cancellation', () => {
  const result = differentialResponse([2, 1, 1], [0, 90, 45], [2, 1, 1], [180, 0, 45]);
  near(result.magnitude[0], 4); near(result.phase[0], 0); near(result.magnitude[1], Math.SQRT2); near(result.phase[1], 135); near(result.magnitude[2], 0);
  assert.throws(() => differentialResponse([1], [], [1], [0]));
});
test('Hann amplitude spectrum preserves a coherent tone amplitude and removes DC', () => {
  const n = 1024, fs = 32000, time = Array.from({length:n},(_,i)=>i/fs);
  const values = time.map(t=>3+0.4*Math.sin(2*Math.PI*1000*t));
  const spectrum = amplitudeSpectrum(time, values);
  near(spectrum.mean, 3); near(spectrum.binWidthHz, 31.25); near(spectrum.amplitudes[32], 0.4, 1e-5);
  assert.ok(spectrum.amplitudes[0] < 1e-6);
  near(spectrum.frequenciesHz.at(-1), fs/2);
});
test('mixing two tones exposes the actual sum and difference components', () => {
  const time = Array.from({length:2048},(_,i)=>i/64000);
  const spectrum = amplitudeSpectrum(time,time.map(t=>0.2*Math.cos(2*Math.PI*1000*t)*Math.cos(2*Math.PI*4000*t)));
  near(spectrum.amplitudes[96], 0.1, 1e-5); near(spectrum.amplitudes[160], 0.1, 1e-5);
  assert.ok(spectrum.amplitudes[32] < 1e-6);
});
test('FFT agrees with an independent direct DFT and zero padding does not claim extra resolution', () => {
  const count=750, fs=20000, time=Array.from({length:count},(_,i)=>i/fs), values=time.map((t,i)=>Math.sin(2*Math.PI*723*t)+0.1*Math.cos(i*0.31));
  const spectrum=amplitudeSpectrum(time,values), size=1024, mean=values.reduce((a,b)=>a+b,0)/count;
  for(const bin of [0,1,17,37,100,512]) {
    let re=0, im=0, sum=0;
    values.forEach((value,i)=>{ const w=0.5-0.5*Math.cos(2*Math.PI*i/(count-1)); sum+=w; re+=(value-mean)*w*Math.cos(-2*Math.PI*bin*i/size); im+=(value-mean)*w*Math.sin(-2*Math.PI*bin*i/size); });
    near(spectrum.amplitudes[bin],Math.hypot(re,im)/sum*(bin===0||bin===512?1:2));
  }
  near(spectrum.observationResolutionHz,fs/count); assert.ok(spectrum.binWidthHz < spectrum.observationResolutionHz);
});
test('invalid or nonuniform waveform data is rejected', () => {
  const time=Array.from({length:32},(_,i)=>i/1000), values=time.map(()=>0);
  assert.throws(()=>amplitudeSpectrum(time.slice(1),values));
  const jittered=[...time]; jittered[10]+=0.0002; assert.throws(()=>amplitudeSpectrum(jittered,values));
  values[0]=NaN; assert.throws(()=>amplitudeSpectrum(time,values));
});
