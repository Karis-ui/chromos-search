import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface HeatMapProps {
    results: Array<{
        posted_at: string;
        platform: string;
        similarity: number;
        confidence: number;
    }>;
    onCellClick?: (date: string, platform: string) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({ results, onCellClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const heatmapData = useMemo(() => {
        if (!results.length) {
            return {
                data: {},
                platforms: [],
                dates: []
            };
        }

        const grouped: Record<string, Record<string, { count: number; avgConfidence: number; posts: any[] }>> = {};

        results.forEach(result => {
            const date = new Date(result.posted_at).toISOString().split('T')[0];
            const platform = result.platform;

            if (!grouped[date]) grouped[date] = {};
            if (!grouped[date][platform]) {
                grouped[date][platform] = { count: 0, avgConfidence: 0, posts: [] };
            }

            grouped[date][platform].count += 1;
            grouped[date][platform].avgConfidence += result.similarity;
            grouped[date][platform].posts.push(result);
        });

        for (const date in grouped) {
            for (const platform in grouped[date]) {
                const data = grouped[date][platform];
                data.avgConfidence = data.avgConfidence / data.count;
            }
        }

        const platforms = Array.from(new Set(results.map(r => r.platform)));
        const dates = Object.keys(grouped).sort();

        return { data: grouped, platforms, dates };
    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !heatmapData.platforms.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const { data, platforms, dates } = heatmapData;
        const margin = { top: 30, right: 10, bottom: 40, left: 60 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = Math.max(300, platforms.length * 30 + margin.top + margin.bottom);

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(dates)
            .range([0, width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(platforms)
            .range([0, height - margin.top - margin.bottom])
            .padding(0.05);

        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, 1]);

        for (const date of dates) {
            for (const platform of platforms) {
                const cellData = data[date]?.[platform];
                const x = xScale(date);
                const y = yScale(platform);

                if (x === undefined || y === undefined) continue;

                const rect = g.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', xScale.bandwidth())
                    .attr('height', yScale.bandwidth())
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('fill', cellData ? colorScale(cellData.avgConfidence) : '#1a1a2e')
                    .attr('stroke', 'rgba(255,255,255,0.05)')
                    .attr('stroke-width', 0.5)
                    .style('cursor', 'pointer')
                    .style('transition', 'all 0.3s ease')
                    .on('mouseover', function () {
                        d3.select(this)
                            .attr('stroke', 'rgba(255,255,255,0.3)')
                            .attr('stroke-width', 2);
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .attr('stroke', 'rgba(255,255,255,0.05)')
                            .attr('stroke-width', 0.5);
                    })
                    .on('click', () => {
                        if (cellData && onCellClick) {
                            onCellClick(date, platform);
                        }
                    });

                if (cellData) {
                    const tooltip = g.append('g')
                        .attr('class', 'tooltip')
                        .style('opacity', 0)
                        .style('pointer-events', 'none');

                    tooltip.append('rect')
                        .attr('x', x + xScale.bandwidth() / 2 - 40)
                        .attr('y', y - 20)
                        .attr('width', 80)
                        .attr('height', 20)
                        .attr('rx', 4)
                        .attr('fill', 'rgba(0,0,0,0.8)');

                    tooltip.append('text')
                        .attr('x', x + xScale.bandwidth() / 2)
                        .attr('y', y - 6)
                        .attr('text-anchor', 'middle')
                        .style('fill', 'white')
                        .style('font-size', '8px')
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
            .tickValues(dates.filter((_, i) => i % Math.ceil(dates.length / 10) === 0))
            .tickFormat(d => d)
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.3)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace');

        const yAxis = d3.axisLeft(yScale)
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.3)')
            .style('font-size', '9px')
            .style('font-family', 'JetBrains Mono, monospace')
            .style('text-transform', 'capitalize');

        const legendGradient = g.append('defs')
            .append('linearGradient')
            .attr('id', 'heatmap-legend')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        const legendStops = [0, 0.33, 0.66, 1];
        for (const stop of legendStops) {
            legendGradient.append('stop')
                .attr('offset', `${stop * 100}%`)
                .attr('stop-color', d3.interpolateReds(stop))
                .attr('stop-opacity', 0.8);
        }

        const legend = g.append('g')
            .attr('transform', `translate(${width - 100}, ${height - margin.top - margin.bottom + 10})`);

        legend.append('rect')
            .attr('width', 80)
            .attr('height', 8)
            .attr('rx', 4)
            .style('fill', 'url(#heatmap-legend)');

        legend.append('text')
            .attr('x', 0)
            .attr('y', 18)
            .style('fill', 'rgba(255,255,255,0.3)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Low');

        legend.append('text')
            .attr('x', 80)
            .attr('y', 18)
            .attr('text-anchor', 'end')
            .style('fill', 'rgba(255,255,255,0.3)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('High');

    }, [heatmapData, onCellClick]);

    if (!heatmapData.platforms.length) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm font-mono">
                No data available for heatmap
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <svg ref={svgRef} className="w-full" style={{ minHeight: 300 }} />
        </div>
    );
};