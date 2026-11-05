"use client";

import { scopeFormat } from "@/lib/electronics/simulation-scope";
import { sequenceChartModel } from "@/lib/electronics/sample-sequence";
import type { SequenceSeries } from "@/lib/electronics/sample-sequence";

const COLORS = ["#ddb768", "#79abd4", "#baa2d4"];
const WIDTH = 760, HEIGHT = 300, LEFT = 58, RIGHT = 16, TOP = 18, BOTTOM = 42;
const cell = (value: number) => String(Number(value.toPrecision(6)));

/**
 * Discrete samples against their sample number. The horizontal axis is an index, never seconds: sources
 * such as the Lab 8 running average give no sampling frequency, so no time scale is invented for them.
 */
export function SampleSequenceChart({ index, series, unit }: { index: number[]; series: SequenceSeries[]; unit: string }) {
  const shown = series.slice(0, COLORS.length);
  const model = sequenceChartModel(index, shown);
  if (!model) return <p className="lab5-error" role="alert">표본 번호 축 데이터가 올바르지 않아 그래프를 표시하지 않습니다.</p>;
  const plotWidth = WIDTH - LEFT - RIGHT, plotHeight = HEIGHT - TOP - BOTTOM;
  const x = (position: number) => LEFT + (position - model.xMin) / (model.xMax - model.xMin) * plotWidth;
  const y = (value: number) => TOP + (model.yMax - value) / (model.yMax - model.yMin) * plotHeight;
  const amplitude = unit === "normalized" ? "정규화 진폭" : unit;
  const label = `표본 번호 ${model.xMin}부터 ${model.xMax}까지 ${model.count}개 표본 · ${shown.map(item => item.label).join(", ")}`;
  return <figure className="course-sample-chart">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
      <title>{label}</title>
      {model.yTicks.map(tick => <g key={`y${tick}`}>
        <line className={tick === 0 ? "course-sample-zero" : "course-sample-grid"} x1={LEFT} x2={WIDTH - RIGHT} y1={y(tick)} y2={y(tick)} />
        <text className="course-sample-axis" x={LEFT - 8} y={y(tick) + 3} textAnchor="end">{scopeFormat(tick)}</text>
      </g>)}
      {model.xTicks.map(tick => <g key={`x${tick}`}>
        <line className="course-sample-grid" x1={x(tick)} x2={x(tick)} y1={TOP} y2={TOP + plotHeight} />
        <text className="course-sample-axis" x={x(tick)} y={HEIGHT - 24} textAnchor="middle">{tick}</text>
      </g>)}
      <text className="course-sample-axis" x={LEFT} y={12}>{amplitude}</text>
      <text className="course-sample-axis" x={LEFT + plotWidth / 2} y={HEIGHT - 6} textAnchor="middle">표본 번호 (시간이 아닌 이산 순번)</text>
      {shown.map((item, seriesIndex) => <g key={seriesIndex} data-sample-series={item.label} fill="none" stroke={COLORS[seriesIndex]}>
        {item.values.map((value, position) => {
          const px = x(index[position]);
          return seriesIndex === 0
            ? <g key={position}><line x1={px} x2={px} y1={y(0)} y2={y(value)} strokeWidth={1.4} /><circle cx={px} cy={y(value)} r={2.8} fill={COLORS[0]} /></g>
            : <circle key={position} cx={px} cy={y(value)} r={3.6 + seriesIndex * 2} strokeWidth={1.4} />;
        })}
      </g>)}
    </svg>
    <figcaption className="course-sample-legend">{shown.map((item, seriesIndex) => <span key={seriesIndex} style={{ color: COLORS[seriesIndex] }}>{seriesIndex === 0 ? "●" : "○"} {item.label}</span>)}</figcaption>
    <details className="course-sample-table">
      <summary>표본 값 표 · {model.count}개</summary>
      <div className="lab5-table-scroll"><table>
        <thead><tr><th>표본 번호</th>{shown.map((item, seriesIndex) => <th key={seriesIndex}>{item.label}</th>)}</tr></thead>
        <tbody>{index.map((position, row) => <tr key={position}><th>{position}</th>{shown.map((item, seriesIndex) => <td key={seriesIndex}>{cell(item.values[row])}</td>)}</tr>)}</tbody>
      </table></div>
    </details>
  </figure>;
}

export default SampleSequenceChart;
