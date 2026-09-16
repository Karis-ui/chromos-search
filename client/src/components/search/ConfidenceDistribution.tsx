import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FiBarChart2, FiTrendingUp, FiAward } from 'react-icons/fi';

interface ConfidenceDistributionProps {
    results: Array<{
        similarity: number;
        confidence: string;
        platform: string;
    }>;
}

export const ConfidenceDistribution: React.FC<ConfidenceDistributionProps> = ({ results }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const distributionData = useMemo(() => {
        if (!results.length) return null;
        const bins = Array.from({ length: 10 }, (_, i) => ({
            min: i * 0.1,
            max: (i + 1) * 0.1,
            count: 0,
            total: 0,
        }));

        results.forEach(result => {
            const bindIndex = Math.min(Math.floor(result.similarity / 0.1), 9);
            bins[bindIndex].count += 1;
            bins[bindIndex].total += result.similarity;
        });
        const maxCount = Math.max(...bins.map(b => b.count));
        return { bins, maxCount };
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !distributionData) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const { bins, maxCount } = distributionData;
        const margin = { top: 20, right: 20, bottom: 30, left: 30 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(bins.map((_, i) => `${(i * 10)}-${(i + 1) * 10}%`))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, maxCount || 1])
            .range([height, 0]);

        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, 1]);

        bins.forEach((bin, i) => {
            const x = xScale(`${(i * 10)}-${(i + 1) * 10}%`);
            const y = yScale(bin.count);
            const width = xScale.bandwidth();

            if (!x) return;

            const bar = g.append('rect')
                .attr('x', x)
                .attr('y', height)
                .attr('width', width)
                .attr('height', 0)
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('fill', colorScale(i / bins.length))
                .attr('stroke', 'rgba(255,255,255,0.05)')
                .attr('stroke-width', 0.5)
                .style('transition', 'all 0.8s ease');

            setTimeout(() => {
                bar
                    .attr('y', y)
                    .attr('height', height - y);
            }, 100 + i * 20);

            const tooltip = g.append('g')
                .style('opacity', 0)
                .style('pointer-events', 'none');

            tooltip.append('rect')
                .attr('x', x + width / 2 - 25)
                .attr('y', y - 25)
                .attr('width', 50)
                .attr('height', 20)
                .attr('rx', 4)
                .attr('fill', 'rgba(0,0,0,0.8)')
                .attr('stroke', 'rgba(255,255,255,0.05)');

            tooltip.append('text')
                .attr('x', x + width / 2)
                .attr('y', y - 11)
                .attr('text-anchor', 'middle')
                .style('fill', 'white')
                .style('font-size', '7px')
                .style('font-family', 'JetBrains Mono, monospace')
                .text(`${bin.count} matches`);

            bar.on('mouseover', function () {
                tooltip.style('opacity', 1);
                d3.select(this)
                    .attr('stroke', 'rgba(255,255,255,0.3)')
                    .attr('stroke-width', 1);
            }).on('mouseout', function () {
                tooltip.style('opacity', 0);
                d3.select(this)
                    .attr('stroke', 'rgba(255,255,255,0.05)')
                    .attr('stroke-width', 0.5);
            });
        });

        const xAxis = d3.axisBottom(xScale)
            .tickSize(0)
            .tickFormat(d => d);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '6px')
            .style('font-family', 'JetBrains Mono, monospace')
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');

    }, [distributionData]);

    if (!distributionData) {
        return (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm font-mono">
                No confidence data available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiBarChart2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Confidence Distribution</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <FiAward className="w-3 h-3 text-yellow-400" />
                        Avg: {(results.reduce((acc, r) => acc + r.similarity, 0) / results.length * 100).toFixed(1)}%
                    </span>
                    <span className="flex items-center gap-1">
                        <FiTrendingUp className="w-3 h-3 text-cyan-400" />
                        Max: {(Math.max(...results.map(r => r.similarity)) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 200 }} />
            </div>
        </div>
    );
};