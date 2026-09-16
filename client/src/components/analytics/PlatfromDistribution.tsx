import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FiPieChart, FiGlobe } from 'react-icons/fi';
import { getPlatformColor } from '../../utils/formatters';

interface PlatformDistributionProps {
    results: Array<{
        platform: string;
        similarity: number;
    }>;
    onPlatformClick?: (platform: string) => void;
}

export const PlatformDistribution: React.FC<PlatformDistributionProps> = ({ results, onPlatformClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const platformData = useMemo(() => {
        if (!results.length) return null;

        const grouped: Record<string, { count: number; totalConfidence: number; avgConfidence: number }> = {};

        results.forEach(result => {
            if (!grouped[result.platform]) {
                grouped[result.platform] = { count: 0, totalConfidence: 0, avgConfidence: 0 };
            }
            grouped[result.platform].count += 1;
            grouped[result.platform].totalConfidence += result.similarity;
        });

        for (const platform in grouped) {
            grouped[platform].avgConfidence = grouped[platform].totalConfidence / grouped[platform].count;
        }

        const data = Object.entries(grouped)
            .map(([platform, data]) => ({
                platform,
                count: data.count,
                avgConfidence: data.avgConfidence,
                percentage: data.count / results.length,
            }))
            .sort((a, b) => b.count - a.count);

        return data;
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !platformData) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = Math.min(300, width);
        const radius = Math.min(width, height) / 2;

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        const pie = d3.pie<{ platform: string; count: number; percentage: number; avgConfidence: number }>()
            .value(d => d.count)
            .sort(null);

        const arc = d3.arc<d3.PieArcDatum<{ platform: string; count: number; percentage: number; avgConfidence: number }>>()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.9);

        const arcHover = d3.arc<d3.PieArcDatum<{ platform: string; count: number; percentage: number; avgConfidence: number }>>()
            .innerRadius(radius * 0.35)
            .outerRadius(radius * 0.95);

        const arcs = pie(platformData);

        arcs.forEach((arcData, i) => {
            const path = g.append('path')
                .attr('d', arc(arcData))
                .attr('fill', getPlatformColor(arcData.data.platform))
                .attr('stroke', 'rgba(0,0,0,0.3)')
                .attr('stroke-width', 1)
                .attr('opacity', 0.8)
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease')
                .on('mouseover', function () {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arcHover(arcData))
                        .attr('opacity', 1);
                })
                .on('mouseout', function () {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arc(arcData))
                        .attr('opacity', 0.8);
                })
                .on('click', () => {
                    onPlatformClick?.(arcData.data.platform);
                });

            const length = path.node()?.getTotalLength() || 0;
            path
                .attr('stroke-dasharray', length)
                .attr('stroke-dashoffset', length)
                .transition()
                .duration(800 + i * 100)
                .delay(i * 100)
                .attr('stroke-dashoffset', 0)
                .ease(d3.easeCubicOut);
        });

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('fill', 'rgba(255,255,255,0.3)')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('font-family', 'JetBrains Mono, monospace')
            .text(results.length);

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .style('fill', 'rgba(255,255,255,0.15)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('TOTAL');

        g.append('circle')
            .attr('r', radius * 0.95)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255,255,255,0.02)')
            .attr('stroke-width', 0.5);

    }, [platformData, onPlatformClick]);

    if (!platformData) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm font-mono">
                No platform data available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiPieChart className="w-4 h-4 text-pink-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Platform Distribution</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <FiGlobe className="w-3 h-3 text-cyan-400" />
                    <span>{platformData.length} platforms</span>
                </div>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 300 }} />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {platformData.map((item) => (
                    <button
                        key={item.platform}
                        onClick={() => onPlatformClick?.(item.platform)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getPlatformColor(item.platform) }}
                        />
                        <span className="text-[10px] text-gray-300 capitalize">{item.platform}</span>
                        <span className="text-[8px] text-gray-500 font-mono">
                            {(item.percentage * 100).toFixed(1)}%
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};