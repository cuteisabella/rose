import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  BarChart3,
  BookOpen,
  Eye,
  Flame,
  Heart,
  MessageSquare,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  AppStoreData,
  LikedContentEntry,
  ViewedContentEntry
} from '../types';

interface AdminAnalyticsTabProps {
  store: AppStoreData;
  viewedItems: ViewedContentEntry[];
  likedItems: LikedContentEntry[];
  viewCounts: Record<string, number>;
  onOpenTab?: (tab: 'blogs' | 'tips' | 'comments' | 'videos') => void;
}

interface ChartItemDatum {
  id: string;
  title: string;
  shortTitle: string;
  contentType: 'blog' | 'tip';
  category: string;
  views: number;
  likes: number;
  commentsTotal: number;
  commentsApproved: number;
  commentsPending: number;
  isPrivateVIP: boolean;
  status: string;
  lastViewedAt?: string;
  likedInSession: boolean;
  likedAt?: string;
}

interface CategoryDatum {
  category: string;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  itemCount: number;
  engagementScore: number;
  color: string;
}

interface ChartTooltipState {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryValue: string;
  secondary?: string;
}

const CATEGORY_PALETTE = [
  '#e5b36b',
  '#34d399',
  '#fb7185',
  '#a78bfa',
  '#38bdf8',
  '#f59e0b',
  '#2dd4bf',
  '#f472b6'
];

function truncateLabel(text: string | undefined, maxLen = 28): string {
  const cleaned = String(text || '').replace(/^\[(VIP|ADULT)[^\]]*\]\s*/i, '').trim();
  if (!cleaned) return 'Untitled';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>, fallback = 540): number {
  const [width, setWidth] = useState<number>(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  store,
  viewedItems,
  likedItems,
  viewCounts,
  onOpenTab
}) => {
  const [viewScope, setViewScope] = useState<'blogs' | 'all'>('blogs');
  const [likeScope, setLikeScope] = useState<'all' | 'blogs' | 'tips' | 'session'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'views' | 'likes'>('all');

  const viewsContainerRef = useRef<HTMLDivElement | null>(null);
  const viewsSvgRef = useRef<SVGSVGElement | null>(null);
  const likesContainerRef = useRef<HTMLDivElement | null>(null);
  const likesSvgRef = useRef<SVGSVGElement | null>(null);
  const donutContainerRef = useRef<HTMLDivElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);

  const viewsChartWidth = useContainerWidth(viewsContainerRef, 520);
  const likesChartWidth = useContainerWidth(likesContainerRef, 520);
  const donutChartWidth = useContainerWidth(donutContainerRef, 260);

  const [viewsTooltip, setViewsTooltip] = useState<ChartTooltipState | null>(null);
  const [likesTooltip, setLikesTooltip] = useState<ChartTooltipState | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryDatum | null>(null);

  // Unified Content Metrics derived from store + activity tracking (viewedItems, likedItems, viewCounts)
  const contentMetrics = useMemo<ChartItemDatum[]>(() => {
    const viewedMap = new Map<string, ViewedContentEntry>();
    for (const entry of viewedItems) {
      if (!viewedMap.has(entry.id)) {
        viewedMap.set(entry.id, entry);
      }
    }

    const likedMap = new Map<string, LikedContentEntry>();
    for (const entry of likedItems) {
      if (!likedMap.has(entry.id)) {
        likedMap.set(entry.id, entry);
      }
    }

    const commentStatsMap = new Map<
      string,
      { total: number; approved: number; pending: number }
    >();
    for (const comment of store.comments) {
      const cur = commentStatsMap.get(comment.postId) || {
        total: 0,
        approved: 0,
        pending: 0
      };
      cur.total += 1;
      if (comment.status === 'approved') cur.approved += 1;
      if (comment.status === 'pending') cur.pending += 1;
      commentStatsMap.set(comment.postId, cur);
    }

    const blogItems: ChartItemDatum[] = store.blogs.map((blog) => {
      const viewedEntry = viewedMap.get(blog.id);
      const likedEntry = likedMap.get(blog.id);
      const recordedViews = viewCounts[blog.id] ?? (viewedEntry ? 1 : 0);
      const cStats = commentStatsMap.get(blog.id) || { total: 0, approved: 0, pending: 0 };

      return {
        id: blog.id,
        title: blog.titleEn,
        shortTitle: truncateLabel(blog.titleEn, 28),
        contentType: 'blog',
        category: blog.category || 'Journal',
        views: recordedViews,
        likes: Number(blog.likes || 0),
        commentsTotal: cStats.total,
        commentsApproved: cStats.approved,
        commentsPending: cStats.pending,
        isPrivateVIP: blog.isPrivateVIP,
        status: blog.status,
        lastViewedAt: viewedEntry?.viewedAt,
        likedInSession: Boolean(likedEntry),
        likedAt: likedEntry?.likedAt
      };
    });

    const tipItems: ChartItemDatum[] = store.tips.map((tip) => {
      const viewedEntry = viewedMap.get(tip.id);
      const likedEntry = likedMap.get(tip.id);
      const recordedViews = viewCounts[tip.id] ?? (viewedEntry ? 1 : 0);

      return {
        id: tip.id,
        title: tip.title,
        shortTitle: truncateLabel(tip.title, 28),
        contentType: 'tip',
        category: tip.category || 'Tips',
        views: recordedViews,
        likes: Number(tip.likes || 0),
        commentsTotal: 0,
        commentsApproved: 0,
        commentsPending: 0,
        isPrivateVIP: tip.isPrivateVIP,
        status: tip.status,
        lastViewedAt: viewedEntry?.viewedAt,
        likedInSession: Boolean(likedEntry),
        likedAt: likedEntry?.likedAt
      };
    });

    return [...blogItems, ...tipItems];
  }, [likedItems, store.blogs, store.comments, store.tips, viewCounts, viewedItems]);

  const mostViewedData = useMemo(() => {
    return contentMetrics
      .filter((item) => (viewScope === 'blogs' ? item.contentType === 'blog' : true))
      .filter((item) => item.views > 0)
      .sort((a, b) => b.views - a.views || b.likes - a.likes)
      .slice(0, 8);
  }, [contentMetrics, viewScope]);

  const mostLikedData = useMemo(() => {
    return contentMetrics
      .filter((item) => {
        if (likeScope === 'blogs') return item.contentType === 'blog';
        if (likeScope === 'tips') return item.contentType === 'tip';
        if (likeScope === 'session') return item.likedInSession;
        return true;
      })
      .sort((a, b) => b.likes - a.likes || b.views - a.views)
      .slice(0, 8);
  }, [contentMetrics, likeScope]);

  const categoryBreakdown = useMemo<CategoryDatum[]>(() => {
    const grouped = new Map<
      string,
      { totalLikes: number; totalViews: number; totalComments: number; itemCount: number }
    >();

    for (const item of contentMetrics) {
      const cat = item.category || 'Uncategorized';
      const cur = grouped.get(cat) || {
        totalLikes: 0,
        totalViews: 0,
        totalComments: 0,
        itemCount: 0
      };
      cur.totalLikes += item.likes;
      cur.totalViews += item.views;
      cur.totalComments += item.commentsTotal;
      cur.itemCount += 1;
      grouped.set(cat, cur);
    }

    return Array.from(grouped.entries())
      .map(([category, stats], idx) => ({
        category,
        ...stats,
        engagementScore: stats.totalLikes + stats.totalViews * 25 + stats.totalComments * 50,
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
      }))
      .sort((a, b) => b.totalLikes - a.totalLikes || b.totalViews - a.totalViews);
  }, [contentMetrics]);

  const summaryStats = useMemo(() => {
    const totalLikes = contentMetrics.reduce((acc, item) => acc + item.likes, 0);
    const totalTrackedViews = contentMetrics.reduce((acc, item) => acc + item.views, 0);
    const uniqueViewedCount = contentMetrics.filter((item) => item.views > 0).length;
    const blogsViewedCount = contentMetrics.filter(
      (item) => item.contentType === 'blog' && item.views > 0
    ).length;
    const pendingComments = store.comments.filter((c) => c.status === 'pending').length;
    const approvedComments = store.comments.filter((c) => c.status === 'approved').length;

    return {
      totalLikes,
      totalTrackedViews,
      uniqueViewedCount,
      blogsViewedCount,
      sessionLikesCount: likedItems.length,
      totalComments: store.comments.length,
      pendingComments,
      approvedComments
    };
  }, [contentMetrics, likedItems.length, store.comments]);

  const recentActivityEvents = useMemo(() => {
    const itemById = new Map(contentMetrics.map((item) => [item.id, item]));
    const viewEvents = viewedItems.map((entry, idx) => {
      const matched = itemById.get(entry.id);
      return {
        key: `view-${entry.id}-${idx}`,
        kind: 'view' as const,
        contentType: entry.type,
        id: entry.id,
        title: matched?.title || entry.id,
        category: matched?.category || (entry.type === 'blog' ? 'Journal' : 'Masterclass'),
        timestamp: entry.viewedAt,
        metricText: `${matched?.views || 1} ${(matched?.views || 1) === 1 ? 'view' : 'views'}`
      };
    });

    const likeEvents = likedItems.map((entry, idx) => {
      const matched = itemById.get(entry.id);
      return {
        key: `like-${entry.id}-${idx}`,
        kind: 'like' as const,
        contentType: entry.type,
        id: entry.id,
        title: matched?.title || entry.id,
        category: matched?.category || (entry.type === 'blog' ? 'Journal' : 'Masterclass'),
        timestamp: entry.likedAt,
        metricText: `${(matched?.likes || 0).toLocaleString()} total likes`
      };
    });

    if (activityFilter === 'views') return viewEvents;
    if (activityFilter === 'likes') return likeEvents;

    const merged: typeof viewEvents & Array<{
      key: string;
      kind: 'view' | 'like';
      contentType: 'blog' | 'tip';
      id: string;
      title: string;
      category: string;
      timestamp: string;
      metricText: string;
    }> = [];

    const maxLen = Math.max(viewEvents.length, likeEvents.length);
    for (let i = 0; i < maxLen; i += 1) {
      if (viewEvents[i]) merged.push(viewEvents[i]);
      if (likeEvents[i]) merged.push(likeEvents[i]);
    }
    return merged.slice(0, 14);
  }, [activityFilter, contentMetrics, likedItems, viewedItems]);

  // D3 Chart 1: Most-Viewed Blog Posts / Content Horizontal Bar Chart
  useEffect(() => {
    const svgEl = viewsSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (mostViewedData.length === 0) return;

    const width = Math.max(320, viewsChartWidth);
    const isCompact = width < 460;
    const margin = {
      top: 10,
      right: 54,
      bottom: 28,
      left: isCompact ? 130 : 184
    };
    const barRowHeight = 36;
    const innerHeight = Math.max(120, mostViewedData.length * barRowHeight);
    const height = innerHeight + margin.top + margin.bottom;
    const innerWidth = Math.max(120, width - margin.left - margin.right);

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxVal = d3.max(mostViewedData, (d) => d.views) || 1;
    const xScale = d3.scaleLinear().domain([0, maxVal]).nice().range([0, innerWidth]);
    const yScale = d3
      .scaleBand<string>()
      .domain(mostViewedData.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.28);

    // Subtle vertical gridlines
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(xScale.ticks(Math.min(5, maxVal)))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#292524')
      .attr('stroke-dasharray', '3,3');

    // Bottom numeric axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(5, maxVal))
      .tickFormat((d) => `${Number(d).toFixed(0)}`);

    const axisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    axisG.select('.domain').attr('stroke', '#292524');
    axisG.selectAll('line').attr('stroke', '#292524');
    axisG
      .selectAll('text')
      .attr('fill', '#78716c')
      .style('font-size', '10px')
      .style('font-variant-numeric', 'tabular-nums');

    const titleMap = new Map(mostViewedData.map((d) => [d.id, d]));

    // Left Y-axis labels
    const yAxisG = g
      .append('g')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(0)
          .tickPadding(10)
          .tickFormat((id) => {
            const datum = titleMap.get(String(id));
            if (!datum) return String(id);
            return truncateLabel(datum.title, isCompact ? 18 : 26);
          })
      );

    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('fill', '#d6d3d1')
      .style('font-size', '11px')
      .style('font-weight', '500');

    // Background track
    g.selectAll('.bar-track')
      .data(mostViewedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-track')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.id) || 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', '#181420');

    // Data bars
    const bars = g
      .selectAll('.bar-fill')
      .data(mostViewedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-fill')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.id) || 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => (d.contentType === 'blog' ? '#e5b36b' : '#34d399'))
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .attr('width', 0);

    bars
      .transition()
      .duration(420)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => Math.max(6, xScale(d.views)));

    bars
      .on('mouseenter', function (_event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#f5e2bf').attr('stroke-width', 1);
        const yPos = (yScale(d.id) || 0) + margin.top;
        const xPos = Math.min(width - 180, margin.left + xScale(d.views) * 0.55);
        setViewsTooltip({
          x: Math.max(12, xPos),
          y: Math.max(8, yPos - 10),
          title: d.title,
          subtitle: `${d.contentType === 'blog' ? 'Blog Post' : 'Masterclass Tip'} · ${d.category}`,
          primaryLabel: 'Tracked Views',
          primaryValue: `${d.views.toLocaleString()} ${d.views === 1 ? 'view' : 'views'}`,
          secondary: d.lastViewedAt ? `Last viewed ${d.lastViewedAt}` : undefined
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.9).attr('stroke', 'none');
        setViewsTooltip(null);
      });

    // Value labels right of bar
    g.selectAll('.bar-value')
      .data(mostViewedData)
      .enter()
      .append('text')
      .attr('class', 'bar-value')
      .attr('x', (d) => xScale(d.views) + 8)
      .attr('y', (d) => (yScale(d.id) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('fill', '#e7e5e4')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('font-variant-numeric', 'tabular-nums')
      .text((d) => `${d.views.toLocaleString()}`);
  }, [mostViewedData, viewsChartWidth]);

  // D3 Chart 2: Most-Liked Content Horizontal Bar Chart
  useEffect(() => {
    const svgEl = likesSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (mostLikedData.length === 0) return;

    const width = Math.max(320, likesChartWidth);
    const isCompact = width < 460;
    const margin = {
      top: 10,
      right: 58,
      bottom: 28,
      left: isCompact ? 130 : 184
    };
    const barRowHeight = 36;
    const innerHeight = Math.max(140, mostLikedData.length * barRowHeight);
    const height = innerHeight + margin.top + margin.bottom;
    const innerWidth = Math.max(120, width - margin.left - margin.right);

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxVal = d3.max(mostLikedData, (d) => d.likes) || 1;
    const xScale = d3.scaleLinear().domain([0, maxVal]).nice().range([0, innerWidth]);
    const yScale = d3
      .scaleBand<string>()
      .domain(mostLikedData.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.28);

    // Vertical gridlines
    g.append('g')
      .selectAll('line')
      .data(xScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#292524')
      .attr('stroke-dasharray', '3,3');

    const axisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(4)
          .tickFormat((d) => {
            const num = Number(d);
            return num >= 1000 ? `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${num}`;
          })
      );

    axisG.select('.domain').attr('stroke', '#292524');
    axisG.selectAll('line').attr('stroke', '#292524');
    axisG
      .selectAll('text')
      .attr('fill', '#78716c')
      .style('font-size', '10px')
      .style('font-variant-numeric', 'tabular-nums');

    const titleMap = new Map(mostLikedData.map((d) => [d.id, d]));

    const yAxisG = g
      .append('g')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(0)
          .tickPadding(10)
          .tickFormat((id) => {
            const datum = titleMap.get(String(id));
            if (!datum) return String(id);
            return truncateLabel(datum.title, isCompact ? 18 : 26);
          })
      );

    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('fill', '#d6d3d1')
      .style('font-size', '11px')
      .style('font-weight', '500');

    // Track bars
    g.selectAll('.like-track')
      .data(mostLikedData)
      .enter()
      .append('rect')
      .attr('class', 'like-track')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.id) || 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', '#181420');

    // Fill bars
    const bars = g
      .selectAll('.like-fill')
      .data(mostLikedData)
      .enter()
      .append('rect')
      .attr('class', 'like-fill')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.id) || 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => (d.contentType === 'blog' ? '#fb7185' : '#c99757'))
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .attr('width', 0);

    bars
      .transition()
      .duration(440)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => Math.max(6, xScale(d.likes)));

    bars
      .on('mouseenter', function (_event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#ffe4e6').attr('stroke-width', 1);
        const yPos = (yScale(d.id) || 0) + margin.top;
        const xPos = Math.min(width - 190, margin.left + xScale(d.likes) * 0.55);
        setLikesTooltip({
          x: Math.max(12, xPos),
          y: Math.max(8, yPos - 10),
          title: d.title,
          subtitle: `${d.contentType === 'blog' ? 'Blog Post' : 'Masterclass Tip'} · ${d.category}`,
          primaryLabel: 'Total Likes',
          primaryValue: d.likes.toLocaleString(),
          secondary: d.likedInSession
            ? `Liked in current tracker (${d.likedAt})`
            : d.isPrivateVIP
              ? 'VIP Exclusive Content'
              : 'Public Content'
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.9).attr('stroke', 'none');
        setLikesTooltip(null);
      });

    // Value labels
    g.selectAll('.like-value')
      .data(mostLikedData)
      .enter()
      .append('text')
      .attr('class', 'like-value')
      .attr('x', (d) => xScale(d.likes) + 8)
      .attr('y', (d) => (yScale(d.id) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('fill', '#e7e5e4')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('font-variant-numeric', 'tabular-nums')
      .text((d) => d.likes.toLocaleString());
  }, [likesChartWidth, mostLikedData]);

  // D3 Chart 3: Engagement Share by Category Donut Chart
  useEffect(() => {
    const svgEl = donutSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const activeCategories = categoryBreakdown.filter((c) => c.totalLikes > 0 || c.totalViews > 0);
    if (activeCategories.length === 0) return;

    const size = Math.min(250, Math.max(200, donutChartWidth));
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.62;

    svg.attr('viewBox', `0 0 ${size} ${size}`).attr('width', size).attr('height', size);

    const g = svg
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);

    const pie = d3
      .pie<CategoryDatum>()
      .value((d) => Math.max(1, d.totalLikes))
      .sort(null)
      .padAngle(0.025);

    const arc = d3
      .arc<d3.PieArcDatum<CategoryDatum>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<CategoryDatum>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 5)
      .cornerRadius(4);

    const arcs = g
      .selectAll('.donut-slice')
      .data(pie(activeCategories))
      .enter()
      .append('path')
      .attr('class', 'donut-slice')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#110f17')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .attr('opacity', 0.9);

    arcs
      .on('mouseenter', function (_event, d) {
        d3.select<SVGPathElement, d3.PieArcDatum<CategoryDatum>>(this)
          .transition()
          .duration(150)
          .attr('d', (datum) => hoverArc(datum) || '')
          .attr('opacity', 1);
        setHoveredCategory(d.data);
      })
      .on('mouseleave', function () {
        d3.select<SVGPathElement, d3.PieArcDatum<CategoryDatum>>(this)
          .transition()
          .duration(150)
          .attr('d', (datum) => arc(datum) || '')
          .attr('opacity', 0.9);
        setHoveredCategory(null);
      });
  }, [categoryBreakdown, donutChartWidth]);

  const totalCategoryLikes = useMemo(
    () => categoryBreakdown.reduce((sum, c) => sum + c.totalLikes, 0),
    [categoryBreakdown]
  );

  const topEngagementTable = useMemo(() => {
    return [...contentMetrics]
      .sort((a, b) => b.views - a.views || b.likes - a.likes)
      .slice(0, 12);
  }, [contentMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-medium">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>D3.js Engagement Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Content &amp; Reader Analytics
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Interactive visualizations built from live reading activity, content likes, and reader comment queues.
          </p>
        </div>

        {onOpenTab && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenTab('blogs')}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 transition-colors whitespace-nowrap shrink-0"
            >
              Manage Posts
            </button>
            <button
              type="button"
              onClick={() => onOpenTab('comments')}
              className="px-3.5 py-2 rounded-xl bg-[#c99757]/15 hover:bg-[#c99757]/25 border border-[#c99757]/40 text-xs font-semibold text-[#e7c792] transition-colors whitespace-nowrap shrink-0"
            >
              Review Comments ({summaryStats.pendingComments} Pending)
            </button>
          </div>
        )}
      </div>

      {/* Single-Elevation KPI Strip (subtle 1px dividers, tabular numerals) */}
      <div className="rounded-2xl bg-[#110f17] border border-stone-800 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-800">
        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <Eye className="w-3.5 h-3.5 text-[#e5b36b]" />
            <span>Tracked Content Views</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {summaryStats.totalTrackedViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 tabular-nums">
            {summaryStats.blogsViewedCount} blogs · {summaryStats.uniqueViewedCount} unique items
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Total Content Likes</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {summaryStats.totalLikes.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 tabular-nums">
            {store.blogs.length} blogs &amp; {store.tips.length} tips combined
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>Session Liked Activity</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {summaryStats.sessionLikesCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400">
            Recorded in active browser history
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Comment Moderation</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {summaryStats.totalComments.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 tabular-nums">
            <span className="text-emerald-400">{summaryStats.approvedComments} approved</span>
            {' · '}
            <span className={summaryStats.pendingComments > 0 ? 'text-amber-400 font-semibold' : 'text-stone-400'}>
              {summaryStats.pendingComments} pending
            </span>
          </div>
        </div>
      </div>

      {/* Primary D3 Charts Grid: Most-Viewed & Most-Liked */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart 1: Most-Viewed Blog Posts (D3 Horizontal Bar Chart) */}
        <section className="rounded-2xl bg-[#110f17] border border-stone-800 p-5 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#e5b36b]" />
                <span>Most-Viewed Blog Posts</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Ranked from live activity tracking views ({viewScope === 'blogs' ? 'Journal posts' : 'Blogs & Tips'})
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-[#09080c] border border-stone-800 p-0.5 text-[11px] self-start">
              <button
                type="button"
                onClick={() => setViewScope('blogs')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewScope === 'blogs'
                    ? 'bg-[#c99757] text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Blog Posts
              </button>
              <button
                type="button"
                onClick={() => setViewScope('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewScope === 'all'
                    ? 'bg-[#c99757] text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Blogs + Tips
              </button>
            </div>
          </div>

          <div ref={viewsContainerRef} className="relative mt-4 flex-1 min-h-[220px]">
            {mostViewedData.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6 py-8 border border-dashed border-stone-800 rounded-xl bg-[#0d0b12]">
                <Eye className="w-6 h-6 text-stone-500 mb-2.5" />
                <p className="text-xs font-semibold text-stone-200">
                  No tracked {viewScope === 'blogs' ? 'blog post' : 'content'} views recorded yet
                </p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-sm leading-relaxed">
                  Open any Journal post or Masterclass tip on the storefront to populate real-time view counts in this D3 chart.
                </p>
              </div>
            ) : (
              <>
                <svg
                  ref={viewsSvgRef}
                  className="w-full overflow-visible block"
                  role="img"
                  aria-label="D3 bar chart showing most-viewed blog posts"
                />
                {viewsTooltip && (
                  <div
                    className="pointer-events-none absolute z-20 max-w-[230px] rounded-xl bg-[#09080c]/95 border border-[#c99757]/50 px-3 py-2 shadow-2xl text-[11px]"
                    style={{ left: viewsTooltip.x, top: viewsTooltip.y }}
                  >
                    <div className="font-semibold text-white line-clamp-2">{viewsTooltip.title}</div>
                    <div className="text-stone-400 mt-0.5">{viewsTooltip.subtitle}</div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[#e7c792] font-semibold tabular-nums">
                      <span>{viewsTooltip.primaryLabel}:</span>
                      <span>{viewsTooltip.primaryValue}</span>
                    </div>
                    {viewsTooltip.secondary && (
                      <div className="text-[10px] text-stone-500 mt-0.5 tabular-nums">
                        {viewsTooltip.secondary}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center gap-4 text-[11px] text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e5b36b]" />
              <span>Blog Posts</span>
            </span>
            {viewScope === 'all' && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#34d399]" />
                <span>Masterclass Tips</span>
              </span>
            )}
          </div>
        </section>

        {/* Chart 2: Most-Liked Content (D3 Horizontal Bar Chart) */}
        <section className="rounded-2xl bg-[#110f17] border border-stone-800 p-5 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Most-Liked Content</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Top performing stories and tips ranked by total patron likes
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-[#09080c] border border-stone-800 p-0.5 text-[11px] self-start flex-wrap">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'blogs', label: 'Blogs' },
                  { id: 'tips', label: 'Tips' },
                  { id: 'session', label: `Tracker (${likedItems.length})` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLikeScope(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                    likeScope === tab.id
                      ? 'bg-[#c99757] text-stone-950 font-semibold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={likesContainerRef} className="relative mt-4 flex-1 min-h-[220px]">
            {mostLikedData.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6 py-8 border border-dashed border-stone-800 rounded-xl bg-[#0d0b12]">
                <Heart className="w-6 h-6 text-stone-500 mb-2.5" />
                <p className="text-xs font-semibold text-stone-200">
                  {likeScope === 'session'
                    ? 'No likes recorded in this session tracker yet'
                    : 'No matching content likes found'}
                </p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-sm leading-relaxed">
                  {likeScope === 'session'
                    ? 'Tap the heart button on any Journal article or Masterclass tip to log activity here.'
                    : 'Publish a blog post or tip to begin tracking likes.'}
                </p>
              </div>
            ) : (
              <>
                <svg
                  ref={likesSvgRef}
                  className="w-full overflow-visible block"
                  role="img"
                  aria-label="D3 bar chart showing most-liked content"
                />
                {likesTooltip && (
                  <div
                    className="pointer-events-none absolute z-20 max-w-[230px] rounded-xl bg-[#09080c]/95 border border-rose-400/50 px-3 py-2 shadow-2xl text-[11px]"
                    style={{ left: likesTooltip.x, top: likesTooltip.y }}
                  >
                    <div className="font-semibold text-white line-clamp-2">{likesTooltip.title}</div>
                    <div className="text-stone-400 mt-0.5">{likesTooltip.subtitle}</div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-rose-300 font-semibold tabular-nums">
                      <span>{likesTooltip.primaryLabel}:</span>
                      <span>{likesTooltip.primaryValue}</span>
                    </div>
                    {likesTooltip.secondary && (
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {likesTooltip.secondary}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center gap-4 text-[11px] text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#fb7185]" />
              <span>Blog Posts</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c99757]" />
              <span>Masterclass Tips</span>
            </span>
          </div>
        </section>
      </div>

      {/* Secondary Row: Category Share Donut (D3) + Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Distribution Donut */}
        <section className="lg:col-span-2 rounded-2xl bg-[#110f17] border border-stone-800 p-5 sm:p-6 flex flex-col">
          <div className="pb-4 border-b border-stone-800/80">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Likes by Category</span>
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Distribution of reader appreciation across editorial categories
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5 flex-1">
            <div
              ref={donutContainerRef}
              className="relative flex items-center justify-center shrink-0 min-w-[200px]"
            >
              <svg
                ref={donutSvgRef}
                className="block"
                role="img"
                aria-label="D3 donut chart showing likes distribution by category"
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <span className="text-[10px] uppercase tracking-wider text-stone-400">
                  {hoveredCategory ? truncateLabel(hoveredCategory.category, 14) : 'All Likes'}
                </span>
                <span className="text-lg font-bold text-white tabular-nums mt-0.5">
                  {(hoveredCategory ? hoveredCategory.totalLikes : totalCategoryLikes).toLocaleString()}
                </span>
                {hoveredCategory && totalCategoryLikes > 0 && (
                  <span className="text-[10px] text-[#e7c792] tabular-nums">
                    {Math.round((hoveredCategory.totalLikes / totalCategoryLikes) * 100)}% share
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex-1 space-y-2 text-xs">
              {categoryBreakdown.map((cat) => {
                const share =
                  totalCategoryLikes > 0
                    ? Math.round((cat.totalLikes / totalCategoryLikes) * 100)
                    : 0;
                const isActive = hoveredCategory?.category === cat.category;
                return (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-default ${
                      isActive ? 'bg-stone-800/80 text-white' : 'text-stone-300 hover:bg-stone-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums text-[11px]">
                      <span className="font-semibold text-white">
                        {cat.totalLikes.toLocaleString()}
                      </span>
                      <span className="text-stone-500 w-8 text-right">{share}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Activity Tracker Stream */}
        <section className="lg:col-span-3 rounded-2xl bg-[#110f17] border border-stone-800 p-5 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5b36b]" />
                <span>Activity Tracker Feed</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Live log of viewed &amp; liked posts recorded by the site activity tracker
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-[#09080c] border border-stone-800 p-0.5 text-[11px] self-start">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'views', label: `Views (${viewedItems.length})` },
                  { id: 'likes', label: `Likes (${likedItems.length})` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivityFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                    activityFilter === tab.id
                      ? 'bg-[#c99757] text-stone-950 font-semibold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex-1">
            {recentActivityEvents.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center px-6 py-8 border border-dashed border-stone-800 rounded-xl bg-[#0d0b12]">
                <BarChart3 className="w-6 h-6 text-stone-500 mb-2.5" />
                <p className="text-xs font-semibold text-stone-200">
                  No activity events captured yet
                </p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-sm">
                  Reading Journal articles or liking Masterclass tips records timestamped events here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-xl overflow-hidden bg-[#0d0b12]">
                {recentActivityEvents.map((ev) => (
                  <div
                    key={ev.key}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#15121d] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          ev.kind === 'view'
                            ? 'bg-[#c99757]/15 text-[#e7c792] border border-[#c99757]/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ev.kind === 'view' ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <Heart className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{ev.title}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                          <span className="uppercase tracking-wider text-[10px] text-stone-500">
                            {ev.contentType === 'blog' ? 'Blog' : 'Tip'}
                          </span>
                          <span>·</span>
                          <span className="truncate">{ev.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <div className="text-[11px] font-semibold text-stone-200">
                        {ev.metricText}
                      </div>
                      <div className="text-[10px] text-stone-500">{ev.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* High-Density Performance Matrix */}
      <section className="rounded-2xl bg-[#110f17] border border-stone-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Content Engagement Ledger
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Combined view counts, total likes, and comment moderation counts across published &amp; draft items
            </p>
          </div>
          <span className="text-[11px] text-stone-400 tabular-nums">
            Showing top {topEngagementTable.length} of {contentMetrics.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Tracked Views</th>
                <th className="py-2.5 px-4 text-right">Total Likes</th>
                <th className="py-2.5 px-4 text-right">Comments</th>
                <th className="py-2.5 px-4 text-right">Last Viewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {topEngagementTable.map((row) => (
                <tr key={`${row.contentType}-${row.id}`} className="hover:bg-[#16131e]/60 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-white max-w-[260px] truncate">
                    {row.title}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        row.contentType === 'blog'
                          ? 'bg-[#c99757]/15 text-[#e7c792] border border-[#c99757]/30'
                          : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {row.contentType === 'blog' ? 'Blog' : 'Tip'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-stone-400 whitespace-nowrap">{row.category}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-white tabular-nums">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-rose-300 tabular-nums">
                    {row.likes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-stone-300">
                    {row.commentsTotal > 0 ? (
                      <span>
                        {row.commentsApproved}
                        {row.commentsPending > 0 && (
                          <span className="text-amber-400 ml-1">+{row.commentsPending}p</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-stone-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-stone-400 tabular-nums whitespace-nowrap">
                    {row.lastViewedAt || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
