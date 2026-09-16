import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FiTrendingUp } from 'react-icons/fi';

interface SearchTrendsProps {
    results: Array<{
        posted_at: string;
        similarity: number;
    }>;
    timeRange: 'day' | 'week' | 'month' | 'all';
}

export const SearchTrends: React.FC<SearchTrendsProps> = ({ results }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const trendData = useMemo(() => {
        if (!results.length) return null;

        const sorted = [...results].sort(
            (a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()
        );

        const grouped: Record<string, { count: number; avgSimilarity: number }> = {};
        sorted.forEach(r => {
            const date = new Date(r.posted_at).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = { count: 0, avgSimilarity: 0 };
            }
            grouped[date].count += 1;
            grouped[date].avgSimilarity += r.similarity;
        });

        for (const date in grouped) {
            grouped[date].avgSimilarity = grouped[date].avgSimilarity / grouped[date].count;
        }

        return Object.entries(grouped).map(([date, data]) => ({
            date: new Date(date),
            count: data.count,
            avgSimilarity: data.avgSimilarity,
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

    }, [results]);

    useEffect(() => {
        if (!svgRef.current || !trendData || trendData.length < 2) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .domain(d3.extent(trendData, d => d.date) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(trendData, d => Math.max(d.count, d.avgSimilarity * 2)) || 1])
            .range([height, 0]);

        const countLine = d3.line<typeof trendData[0]>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.count))
            .curve(d3.curveMonotoneX);

        const similarityLine = d3.line<typeof trendData[0]>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.avgSimilarity * 2))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(trendData)
            .attr('d', countLine)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .attr('opacity', 1);

        g.append('path')
            .datum(trendData)
            .attr('d', similarityLine)
            .attr('fill', 'none')
            .attr('stroke', '#a855f7')
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(200)
            .attr('opacity', 1);

        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
            .tickSize(0);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        const yAxis = d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(0);

        g.append('g')
            .call(yAxis)
            .style('color', 'rgba(255,255,255,0.2)')
            .style('font-size', '7px')
            .style('font-family', 'JetBrains Mono, monospace');

        const legend = g.append('g')
            .attr('transform', `translate(${width - 120}, 0)`);

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
            .style('fill', 'rgba(255,255,255,0.3)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Results');

        legend.append('line')
            .attr('x1', 0)
            .attr('y1', 24)
            .attr('x2', 20)
            .attr('y2', 24)
            .attr('stroke', '#a855f7')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 25)
            .attr('y', 28)
            .style('fill', 'rgba(255,255,255,0.3)')
            .style('font-size', '8px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Avg Confidence');

    }, [trendData]);

    if (!trendData || trendData.length < 2) {
        return (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm font-mono">
                Not enough data for trends
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Search Trends</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                    {trendData.length} data points
                </span>
            </div>
            <div className="bg-black/20 rounded-xl border border-white/5 p-2">
                <svg ref={svgRef} className="w-full" style={{ minHeight: 200 }} />
            </div>
        </div>
    );
};