import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FiClock, FiSun, FiMoon } from 'react-icons/fi';

interface TemporalPatternsProps {
    results: Array<{
        posted_at: string;
        similarity: number;
    }>;
}

export const TemporalPatterns: React.FC<TemporalPatternsProps> = ({ results }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const data = useMemo(() => {
        if (!results.length) return null;

        const hourly: Record<number, { count: number; avgSimilarity: number }> = {};
        for (let i = 0; i < 24; i++) {
            hourly[i] = { count: 0, avgSimilarity: 0 };
        }

        results.forEach(r => {
            const hour = new Date(r.posted_at).getHours();
            hourly[hour].count += 1;
            hourly[hour].avgSimilarity += r.similarity;
        });

        for (const hour in hourly) {
            if (hourly[hour].count > 0) {
                hourly[hour].avgSimilarity = hourly[hour].avgSimilarity / hourly[hour].count;
            }
        }

        return Object.entries(hourly).map(([hour, data]) => ({
            hour: parseInt(hour),
            count: data.count,
            avgSimilarity: data.avgSimilarity,
        }));
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, 23])
            .range([0, width]);

        const yScaleCount = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 1])
            .range([height, 0]);

        const yScaleSimilarity = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        const barWidth = width / 24 * 0.7;

        data.forEach((d, i) => {
            const x = xScale(d.hour) - barWidth / 2;

            const bar = g.append('rect')
                .attr('x', x)
                .attr('y', height)
                .attr('width', barWidth)
                .attr('height', 0)
                .attr('rx', 1)
                .attr('ry', 1)
                .attr('fill', 'rgba(34, 211, 238, 0.3)')
                .style('transition', 'all 0.8s ease');

            setTimeout(() => {
                bar
                    .attr('y', yScaleCount(d.count))
                    .attr('height', height - yScaleCount(d.count));
            }, 100 + i * 20);
        });

        const line = d3.line<typeof data[0]>()
            .x(d => xScale(d.hour))
            .y(d => yScaleSimilarity(d.avgSimilarity))
            .curve(d3.curveMonotoneX);

        const path = g.append('path')
            .datum(data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#a855f7')
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0);

        const totalLength = path.node()?.getTotalLength() || 0;
        path
            .attr('stroke-dasharray', totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0)
            .attr('opacity', 1);

        const xAxis = d3.axisBottom(xScale)
            .ticks(12)
            .tickFormat(d => `${d}:00`)
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        const yAxis = d3.axisLeft(yScaleCount)
            .ticks(4)
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        g.append('rect')
            .attr('x', xScale(6))
            .attr('y', 0)
            .attr('width', xScale(18) - xScale(6))
            .attr('height', height)
            .attr('fill', 'rgba(255, 255, 255, 0.02)')
            .attr('rx', 2);

        g.append('text')
            .attr('x', xScale(12))
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('fill', 'rgba(255,255,255,0.05)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('☀️ Day');

        g.append('text')
            .attr('x', xScale(22))
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('fill', 'rgba(255,255,255,0.05)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('🌙 Night');

    }, [data]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm font-mono">
                No temporal data available
            </div>
        );
    }

    const peakHour = data.reduce((a, b) => a.count > b.count ? a : b);
    const bestHour = data.reduce((a, b) => a.avgSimilarity > b.avgSimilarity ? a : b);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Temporal Patterns</h3>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <FiSun className="w-3 h-3 text-yellow-400" />
                        Peak: {peakHour.hour}:00 ({peakHour.count} results)
                    </span>
                    <span className="flex items-center gap-1">
                        <FiMoon className="w-3 h-3 text-cyan-400" />
                        Best: {bestHour.hour}:00 ({(bestHour.avgSimilarity * 100).toFixed(0)}%)
                    </span>
                </div>
            </div>
            <div className="bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 200 }} />
            </div>
        </div>
    );
};