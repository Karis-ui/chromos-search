import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FiBarChart2 } from 'react-icons/fi';

interface ConfidenceTrendsProps {
    results: Array<{
        similarity: number;
        platform: string;
        posted_at: string;
    }>;
}

export const ConfidenceTrends: React.FC<ConfidenceTrendsProps> = ({ results }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const data = useMemo(() => {
        if (!results.length) return null;

        const platforms = Array.from(new Set(results.map(r => r.platform)));
        const grouped: Record<string, number[]> = {};

        platforms.forEach(p => {
            grouped[p] = results.filter(r => r.platform === p).map(r => r.similarity);
        });

        return {
            platforms,
            grouped,
            averages: Object.entries(grouped).map(([platform, scores]) => ({
                platform,
                avg: scores.reduce((a, b) => a + b, 0) / scores.length,
                min: Math.min(...scores),
                max: Math.max(...scores),
                count: scores.length,
            })),
        };
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

        const xScale = d3.scaleBand()
            .domain(data.platforms)
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, data.platforms.length]);

        data.averages.forEach((item, i) => {
            const x = xScale(item.platform);
            if (!x) return;

            const barWidth = xScale.bandwidth();

            const bar = g.append('rect')
                .attr('x', x)
                .attr('y', height)
                .attr('width', barWidth)
                .attr('height', 0)
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('fill', colorScale(i / data.platforms.length))
                .attr('stroke', 'rgba(255,255,255,0.05)')
                .attr('stroke-width', 0.5)
                .style('transition', 'all 0.8s ease');

            setTimeout(() => {
                bar
                    .attr('y', yScale(item.avg))
                    .attr('height', height - yScale(item.avg));
            }, 200 + i * 100);

            g.append('line')
                .attr('x1', x + barWidth / 2)
                .attr('x2', x + barWidth / 2)
                .attr('y1', yScale(item.max))
                .attr('y2', yScale(item.min))
                .attr('stroke', 'rgba(255,255,255,0.1)')
                .attr('stroke-width', 1)
                .attr('opacity', 0)
                .transition()
                .delay(400 + i * 100)
                .attr('opacity', 1);

            g.append('circle')
                .attr('cx', x + barWidth / 2)
                .attr('cy', yScale(item.min))
                .attr('r', 2)
                .attr('fill', 'rgba(255,255,255,0.2)')
                .attr('opacity', 0)
                .transition()
                .delay(500 + i * 100)
                .attr('opacity', 1);

            g.append('circle')
                .attr('cx', x + barWidth / 2)
                .attr('cy', yScale(item.max))
                .attr('r', 2)
                .attr('fill', 'rgba(255,255,255,0.2)')
                .attr('opacity', 0)
                .transition()
                .delay(500 + i * 100)
                .attr('opacity', 1);

            g.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', yScale(item.avg) - 8)
                .attr('text-anchor', 'middle')
                .style('fill', 'rgba(255,255,255,0.5)')
                .style('font-size', '8px')
                .style('font-family', 'JetBrains Mono, monospace')
                .style('opacity', 0)
                .text(`${(item.avg * 100).toFixed(0)}%`)
                .transition()
                .delay(600 + i * 100)
                .style('opacity', 1);

            g.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', height + 15)
                .attr('text-anchor', 'middle')
                .style('fill', 'rgba(255,255,255,0.15)')
                .style('font-size', '7px')
                .style('font-family', 'JetBrains Mono, monospace')
                .text(`n=${item.count}`);
        });

        const xAxis = d3.axisBottom(xScale)
            .tickSize(0)
            .tickFormat(d => d.charAt(0).toUpperCase() + d.slice(1));

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

    }, [data]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm font-mono">
                No confidence data available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiBarChart2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Confidence by Platform</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                    {data.platforms.length} platforms
                </span>
            </div>
            <div className="bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 200 }} />
            </div>
        </div>
    );
};