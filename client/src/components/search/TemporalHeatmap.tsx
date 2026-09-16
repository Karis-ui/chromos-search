import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { FiClock } from 'react-icons/fi';

interface TemporalHeatmapProps {
    results: Array<{
        posted_at: string;
        platform: string;
        similarity: number;
        confidence: string;
        likes?: number;
        shares?: number;
    }>;
    onDateSelect?: (date: string) => void;
}

export const TemporalHeatmap: React.FC<TemporalHeatmapProps> = ({ results, onDateSelect }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredCell, setHoveredCell] = useState<{ date: string; hour: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const heatmapData = useMemo(() => {
        if (!results.length) return null;

        const grouped: Record<string, Record<number, { count: number; avgConfidence: number; posts: any[] }>> = {};
        results.forEach(result => {
            const date = new Date(result.posted_at);
            const dateKey = date.toISOString().split('T')[0]
            const hour = date.getHours();

            if (!grouped[dateKey]) grouped[dateKey] = {};
            if (!grouped[dateKey][hour]) {
                grouped[dateKey][hour] = { count: 0, avgConfidence: 0, posts: [] };
            }
            grouped[dateKey][hour].count += 1;
            grouped[dateKey][hour].avgConfidence += result.similarity;
            grouped[dateKey][hour].posts.push(result);
        });

        for (const date in grouped) {
            for (const hour in grouped[date]) {
                const data = grouped[date][hour];
                data.avgConfidence = data.avgConfidence / data.count;
            }
        }

        const dates = Object.keys(grouped).sort();
        const hours = Array.from({ length: 24 }, (_, i) => i);
        return { data: grouped, dates, hours };
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !heatmapData) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const { data, dates, hours } = heatmapData;
        const margin = { top: 30, right: 30, bottom: 40, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = Math.max(300, hours.length * 12 + margin.top + margin.bottom);
        svg.attr('viewBox', `0 0${width + margin.left + margin.right} ${height}`);
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(dates)
            .range([0, width])
            .padding(0.02);

        const yScale = d3.scaleBand()
            .domain(hours.map(h => `${h}:00`))
            .range([0, height - margin.top - margin.bottom])
            .padding(0.02);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, 1]);

        for (const date of dates) {
            for (const hour of hours) {
                const cellData = data[date]?.[hour];
                const x = xScale(date);
                const y = yScale(`${hour}:00`);

                if (x === undefined || y === undefined) continue;

                const rect = g.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', xScale.bandwidth())
                    .attr('height', yScale.bandwidth())
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('fill', cellData ? colorScale(cellData.avgConfidence) : '#1a1a2e')
                    .attr('stroke', 'rgba(255,255,255,0.03)')
                    .attr('stroke-width', 0.5)
                    .style('cursor', 'pointer')
                    .style('transition', 'all 0.2s ease')
                    .on('mouseover', function () {
                        d3.select(this)
                            .attr('stroke', 'rgba(255,255,255,0.3)')
                            .attr('stroke-width', 1.5);
                        if (cellData) {
                            setHoveredCell({ date, hour });
                        }
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .attr('stroke', 'rgba(255,255,255,0.03)')
                            .attr('stroke-width', 0.5);
                        setHoveredCell(null);
                    })
                    .on('click', () => {
                        setSelectedDate(date);
                        onDateSelect?.(date);
                    });

                if (cellData) {
                    const tooltip = g.append('g')
                        .attr('class', 'tooltip')
                        .style('opacity', 0)
                        .style('pointer-events', 'none');

                    tooltip.append('rect')
                        .attr('x', x + xScale.bandwidth() / 2 - 40)
                        .attr('y', y - 30)
                        .attr('width', 80)
                        .attr('height', 25)
                        .attr('rx', 4)
                        .attr('fill', 'rgba(0,0,0,0.8)')
                        .attr('stroke', 'rgba(255,255,255,0.05)');

                    tooltip.append('text')
                        .attr('x', x + xScale.bandwidth() / 2)
                        .attr('y', y - 15)
                        .attr('text-anchor', 'middle')
                        .style('fill', 'white')
                        .style('font-size', '7px')
                        .style('font-family', 'JetBrains Mono, monospace')
                        .text(`${cellData.count} matches`);

                    rect.on('mouseover', function () {
                        tooltip.style('opacity', 1);
                    }).on('mouseout', function () {
                        tooltip.style('opacity', 0);
                    });
                }
            }
        }

        const xAxis = d3.axisBottom(xScale)
            .tickValues(dates.filter((_, i) => i % Math.ceil(dates.length / 7) === 0))
            .tickFormat(d => d)
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        const yAxis = d3.axisLeft(yScale)
            .tickValues(['0:00', '6:00', '12:00', '18:00', '23:00'])
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        const legendGradient = g.append('defs')
            .append('linearGradient')
            .attr('id', 'temporal-legend')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        const legendStops = [0, 0.33, 0.66, 1];
        for (const stop of legendStops) {
            legendGradient.append('stop')
                .attr('offset', `${stop * 100}%`)
                .attr('stop-color', d3.interpolateViridis(stop))
                .attr('stop-opacity', 0.8);
        }

        const legend = g.append('g')
            .attr('transform', `translate(${width - 100}, ${height - margin.top - margin.bottom + 15})`);

        legend.append('rect')
            .attr('width', 80)
            .attr('height', 6)
            .attr('rx', 3)
            .style('fill', 'url(#temporal-legend)');

        legend.append('text')
            .attr('x', 0)
            .attr('y', 14)
            .style('fill', 'rgba(255,255,255,0.2)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Low');

        legend.append('text')
            .attr('x', 80)
            .attr('y', 14)
            .attr('text-anchor', 'end')
            .style('fill', 'rgba(255,255,255,0.2)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('High');

    }, [heatmapData, onDateSelect]);

    if (!heatmapData) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm font-mono">
                No temporal data available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Temporal Heatmap</h3>
                </div>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-1 bg-cyan-400/10 rounded-lg border border-cyan-400/20 text-[10px] text-cyan-400 font-mono"
                    >
                        📅 {selectedDate}
                    </motion.div>
                )}
            </div>

            <div className="w-full overflow-x-auto bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 300 }} />
            </div>

            <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono">
                <span>Darker = Higher confidence</span>
                <span>{results.length} total results</span>
            </div>
        </div>
    );
};