import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { FiClock, FiZap, FiCalendar } from 'react-icons/fi';
import { formatTimeAgo } from '../../utils/formatters';

interface SearchTimelineProps {
    results: Array<{
        posted_at: string;
        similarity: number;
        platform: string;
        confidence: string;
    }>;
    onPointClick?: (result: any) => void;
}

export const SearchTimeline: React.FC<SearchTimelineProps> = ({ results, onPointClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const timelineData = useMemo(() => {
        if (!results.length) return null;

        const sorted = [...results].sort(
            (a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()
        );
        return sorted.map((r, i) => ({
            ...r, index: i, date: new Date(r.posted_at),
        }));
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !timelineData) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const margin = { top: 30, right: 30, bottom: 30, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        svg.attr('viewbox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .domain(d3.extent(timelineData, d => d.date) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        const line = d3.line<typeof timelineData[0]>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.similarity))
            .curve(d3.curveMonotoneX);

        const area = d3.area<typeof timelineData[0]>()
            .x(d => xScale(d.date))
            .y0(height)
            .y1(d => yScale(d.similarity))
            .curve(d3.curveMonotoneX);

        const areaGradient = g.append('defs')
            .append('linearGradient')
            .attr('id', 'timeline-area')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        areaGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(34, 211, 238, 0.2)');

        areaGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(34, 211, 238, 0)');

        g.append('path')
            .datum(timelineData)
            .attr('d', area)
            .attr('fill', 'url(#timeline-area)')
            .attr('opacity', 0);

        const path = g.append('path')
            .datum(timelineData)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
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

        g.append('path')
            .datum(timelineData)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 6)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0.1)
            .attr('filter', 'url(#glow)');

        const filter = g.append('defs')
            .append('filter')
            .attr('id', 'glow')
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
            .data(timelineData)
            .enter()
            .append('g')
            .attr('class', 'point')
            .style('cursor', 'pointer')
            .on('mouseover', function (d) {
                d3.select(this)
                    .select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 8)
                    .attr('opacity', 1);
                setHoveredPoint(d);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 4)
                    .attr('opacity', 0.6);
                setHoveredPoint(null);
            })
            .on('click', (d) => {
                onPointClick?.(d);
            });

        points.append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.similarity))
            .attr('r', 4)
            .attr('fill', d => d.similarity > 0.85 ? '#4ade80' : '#06b6d4')
            .attr('stroke', 'rgba(255,255,255,0.2)')
            .attr('stroke-width', 1)
            .attr('opacity', 0.6)
            .style('transition', 'all 0.3s ease');

        points.append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.similarity))
            .attr('r', 12)
            .attr('fill', 'none')
            .attr('stroke', d => d.similarity > 0.85 ? '#4ade80' : '#06b6d4')
            .attr('stroke-width', 1)
            .attr('opacity', 0.1)
            .style('pointer-events', 'none');

        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace');

        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => `${(d as number * 100).toFixed(0)}%`)
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace');

        const threshold = 0.7;
        g.append('line')
            .attr('x1', 0)
            .attr('y1', yScale(threshold))
            .attr('x2', width)
            .attr('y2', yScale(threshold))
            .attr('stroke', 'rgba(255,255,255,0.05)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

        g.append('text')
            .attr('x', width - 5)
            .attr('y', yScale(threshold) - 5)
            .attr('text-anchor', 'end')
            .style('fill', 'rgba(255,255,255,0.1)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('threshold');

    }, [timelineData, onPointClick]);

    if (!timelineData) {
        return (
            <div className='flex items-center justify-center h-[250px] text=gray-500 text-sm-font-memo'>No timeline data available</div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Search Timeline</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <FiZap className="w-3 h-3 text-cyan-400" />
                        {timelineData.length} results
                    </span>
                    <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-purple-400" />
                        {formatTimeAgo(timelineData[0].date)}
                    </span>
                </div>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/5 p-2 relative">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 250 }} />

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
                                    {hoveredPoint.date.toLocaleDateString()}
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