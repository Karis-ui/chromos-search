import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { formatTimeAgo } from '../../utils/formatters';

interface TimelineAxisProps {
    results: Array<{
        posted_at: string;
        similarity: number;
        platform: string;
        confidence: number;
    }>;
    onPointClick?: (result: any) => void;
    onRangeChange?: (start: Date, end: Date) => void;
}

export const TimelineAxis: React.FC<TimelineAxisProps> = ({
    results,
    onPointClick,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);

    const timelineData = useMemo(() => {
        if (!results.length) return null;

        const sorted = [...results].sort(
            (a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()
        );

        const grouped: Record<string, { count: number; avgSimilarity: number; posts: any[] }> = {};
        sorted.forEach(r => {
            const date = new Date(r.posted_at).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = { count: 0, avgSimilarity: 0, posts: [] };
            }
            grouped[date].count += 1;
            grouped[date].avgSimilarity += r.similarity;
            grouped[date].posts.push(r);
        });

        for (const date in grouped) {
            grouped[date].avgSimilarity = grouped[date].avgSimilarity / grouped[date].count;
        }

        const groupedData = Object.entries(grouped).map(([date, data]) => ({
            date: new Date(date),
            count: data.count,
            avgSimilarity: data.avgSimilarity,
            posts: data.posts,
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

        return {
            individual: sorted,
            grouped: groupedData,
            start: new Date(sorted[0].posted_at),
            end: new Date(sorted[sorted.length - 1].posted_at)
        };
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !timelineData) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .range([0, width])
            .domain([timelineData.start, timelineData.end]);

        const maxCount = d3.max(timelineData.grouped, d => d.count) ?? 1;

        const yScaleCount = d3.scaleLinear()
            .domain([0, maxCount])
            .range([height, 0]);

        const yScaleSimilarity = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        const area = d3.area<typeof timelineData.grouped[0]>()
            .x(d => xScale(d.date))
            .y0(height)
            .y1(d => yScaleSimilarity(d.avgSimilarity))
            .curve(d3.curveMonotoneX);

        const areaGradient = g.append('defs')
            .append('linearGradient')
            .attr('id', 'timeline-area-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        areaGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(34, 211, 238, 0.15)');

        areaGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(34, 211, 238, 0)');

        g.append('path')
            .datum(timelineData.grouped)
            .attr('d', area)
            .attr('fill', 'url(#timeline-area-gradient)')
            .attr('opacity', 0)
            .transition()
            .duration(800)
            .attr('opacity', 1);

        const barWidth = Math.min((width / timelineData.grouped.length) * 0.7, 10);

        timelineData.grouped.forEach((d, i) => {
            const x = xScale(d.date) - barWidth / 2;
            const barHeight = height - yScaleCount(d.count);

            const bar = g.append('rect')
                .attr('x', x)
                .attr('y', height)
                .attr('width', barWidth)
                .attr('height', 0)
                .attr('rx', 1)
                .attr('ry', 1)
                .attr('fill', `rgba(168, 85, 247, ${0.15 + (d.count / maxCount) * 0.3})`)
                .style('cursor', 'pointer')
                .on('click', () => {
                    if (onPointClick && d.posts.length > 0) {
                        onPointClick(d.posts[0]);
                    }
                });

            setTimeout(() => {
                bar
                    .transition()
                    .duration(800)
                    .delay(i * 20)
                    .attr('y', yScaleCount(d.count))
                    .attr('height', barHeight);
            }, 100);
        });

        const line = d3.line<typeof timelineData.grouped[0]>()
            .x(d => xScale(d.date))
            .y(d => yScaleSimilarity(d.avgSimilarity))
            .curve(d3.curveMonotoneX);

        const path = g.append('path')
            .datum(timelineData.grouped)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 2.5)
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

        g.append('path')
            .datum(timelineData.grouped)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 8)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0.05)
            .attr('filter', 'url(#timeline-glow)');

        const filter = g.append('defs')
            .append('filter')
            .attr('id', 'timeline-glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '6')
            .attr('result', 'blur');

        filter.append('feMerge')
            .selectAll('feMergeNode')
            .data(['blur', 'SourceGraphic'])
            .enter()
            .append('feMergeNode')
            .attr('in', d => d);

        const points = g.selectAll('.point')
            .data(timelineData.individual)
            .enter()
            .append('g')
            .attr('class', 'point')
            .style('cursor', 'pointer')
            .style('opacity', 0)
            .on('mouseover', function (d) {
                d3.select(this)
                    .select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 6)
                    .attr('opacity', 1);
                setHoveredPoint(d);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 3)
                    .attr('opacity', 0.5);
                setHoveredPoint(null);
            })
            .on('click', (d) => {
                onPointClick?.(d);
            });

        points.transition()
            .duration(1200)
            .delay((_d, i) => i * 10)
            .style('opacity', 1);

        points.append('circle')
            .attr('cx', d => xScale(new Date(d.posted_at)))
            .attr('cy', d => yScaleSimilarity(d.similarity))
            .attr('r', 3)
            .attr('fill', d => d.similarity > 0.85 ? '#4ade80' : '#06b6d4')
            .attr('stroke', 'rgba(255,255,255,0.1)')
            .attr('stroke-width', 1)
            .attr('opacity', 0.5)
            .style('transition', 'all 0.3s ease');

        points.append('circle')
            .attr('cx', d => xScale(new Date(d.posted_at)))
            .attr('cy', d => yScaleSimilarity(d.similarity))
            .attr('r', 10)
            .attr('fill', 'none')
            .attr('stroke', d => d.similarity > 0.85 ? '#4ade80' : '#06b6d4')
            .attr('stroke-width', 1)
            .attr('opacity', 0.05)
            .style('pointer-events', 'none');

        const xAxis = d3.axisBottom(xScale)
            .ticks(8)
            .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace')
            .selectAll('text')
            .attr('transform', 'rotate(-15)')
            .attr('text-anchor', 'end');

        const yAxis = d3.axisLeft(yScaleCount)
            .ticks(3)
            .tickFormat(d => d as number > 0 ? `${d}` : '')
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.15)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace');

        const threshold = 0.7;
        g.append('line')
            .attr('x1', 0)
            .attr('y1', yScaleSimilarity(threshold))
            .attr('x2', width)
            .attr('y2', yScaleSimilarity(threshold))
            .attr('stroke', 'rgba(255,255,255,0.05)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

        g.append('text')
            .attr('x', width - 5)
            .attr('y', yScaleSimilarity(threshold) - 5)
            .attr('text-anchor', 'end')
            .style('fill', 'rgba(255,255,255,0.1)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('threshold');

        const legend = g.append('g')
            .attr('transform', `translate(10, 0)`);

        legend.append('line')
            .attr('x1', 0)
            .attr('y1', 10)
            .attr('x2', 20)
            .attr('y2', 10)
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 25)
            .attr('y', 14)
            .style('fill', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Confidence');

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 18)
            .attr('width', 20)
            .attr('height', 4)
            .attr('rx', 2)
            .attr('fill', 'rgba(168,85,247,0.3)');

        legend.append('text')
            .attr('x', 25)
            .attr('y', 22)
            .style('fill', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Post Density');

    }, [timelineData, onPointClick]);

    if (!timelineData) {
        return (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm font-mono">
                No timeline data available
            </div>
        );
    }

    const totalResults = timelineData.individual.length;
    const dateRange = `${formatTimeAgo(timelineData.end)} - ${formatTimeAgo(timelineData.start)}`;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Temporal Timeline</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-cyan-400" />
                        {dateRange}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiTrendingUp className="w-3 h-3 text-purple-400" />
                        {totalResults} results
                    </span>
                </div>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/5 p-2 relative">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 200 }} />

                <AnimatePresence>
                    {hoveredPoint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-2 right-2 px-3 py-2 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10"
                        >
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-400 font-mono">
                                    {new Date(hoveredPoint.posted_at).toLocaleDateString()}
                                </span>
                                <span
                                    className="font-mono font-bold"
                                    style={{
                                        color: hoveredPoint.similarity > 0.85 ? '#4ade80' : '#06b6d4',
                                    }}
                                >
                                    {(hoveredPoint.similarity * 100).toFixed(1)}%
                                </span>
                                <span className="text-gray-500 capitalize">
                                    {hoveredPoint.platform}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};