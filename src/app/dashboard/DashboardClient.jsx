'use client';

import LayoutWrapper from '@/components/LayoutWrapper';
import styles from './Dashboard.module.css';
import { Users, CheckSquare, Zap, Clock, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

export default function DashboardClient({ stats, aiSummary, error }) {
    // Mock Data for Charts
    const [activityData] = useState([
        { name: 'Mon', tasks: 4 },
        { name: 'Tue', tasks: 7 },
        { name: 'Wed', tasks: 5 },
        { name: 'Thu', tasks: 8 },
        { name: 'Fri', tasks: 12 },
        { name: 'Sat', tasks: 6 },
        { name: 'Sun', tasks: 4 },
    ]);

    const taskDistributionData = [
        { name: 'Completed', value: stats.find(s => s.key === 'totalTasks')?.value - stats.find(s => s.key === 'activeTasks')?.value || 0 },
        { name: 'Active', value: stats.find(s => s.key === 'activeTasks')?.value || 0 },
        { name: 'Pending', value: stats.find(s => s.key === 'pendingApproval')?.value || 0 },
    ];

    return (
        <LayoutWrapper>
            {/* Header is now in LayoutWrapper, but we can keep page specific headers too */}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.heading}>Dashboard</h1>
                    <p className={styles.subheading}>Overview of your team&apos;s performance</p>
                </div>
                <button className="btn btn-primary">
                    <Calendar size={16} style={{ marginRight: '8px' }} />
                    Download Report
                </button>
            </div>

            {error && (
                <div className={styles.errorAlert}>
                    ⚠️ System Alert: {error}. retrying...
                </div>
            )}

            {/* Stats Row */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: `var(--${stat.color === 'indigo' ? 'primary' : stat.color})20`, color: `var(--${stat.color === 'indigo' ? 'primary' : stat.color})` }}>
                                {stat.key === 'totalEmployees' && <Users size={20} />}
                                {stat.key === 'totalTasks' && <CheckSquare size={20} />}
                                {stat.key === 'activeTasks' && <Zap size={20} />}
                                {stat.key === 'pendingApproval' && <Clock size={20} />}
                            </div>
                            <span className={styles.trendBadge}>+12%</span>
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* Main Area Chart */}
                <div className={`${styles.card} ${styles.areaChartCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Task Activity</h3>
                        <select className={styles.select}>
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sidebar-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--sidebar-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Area type="monotone" dataKey="tasks" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Panel / Pie Chart */}
                <div className={`${styles.card} ${styles.sideCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Task Status</h3>
                    </div>
                    <div className={styles.chartContainer} style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskDistributionData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.legend}>
                        {taskDistributionData.map((entry, index) => (
                            <div key={index} className={styles.legendItem}>
                                <div className={styles.legendDot} style={{ background: COLORS[index % COLORS.length] }} />
                                <span>{entry.name}</span>
                                <span className="ml-auto font-bold">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className={styles.aiSection}>
                <div className={styles.aiCard}>
                    <div className={styles.aiIcon}>✨</div>
                    <div className={styles.aiContent}>
                        <h4>AI Insights</h4>
                        <p>&quot;{aiSummary}&quot;</p>
                    </div>
                </div>
            </div>
        </LayoutWrapper>
    );
}
