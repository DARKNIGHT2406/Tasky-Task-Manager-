'use client';

import LayoutWrapper from '@/components/LayoutWrapper';
import styles from './Dashboard.module.css';
import { Users, CheckSquare, Zap, Clock, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ stats, aiSummary, error, pendingLeaves = [] }) {
    const router = useRouter();
    const [leaves, setLeaves] = useState(pendingLeaves);
    const [actionLoading, setActionLoading] = useState(null);

    const handleLeaveAction = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
        setActionLoading(id);

        try {
            const res = await fetch('/api/leaves', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                // Remove from list
                setLeaves(leaves.filter(l => l._id !== id));
                router.refresh(); // Refresh server data
            } else {
                alert('Failed to update leave status');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setActionLoading(null);
        }
    };

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

            {/* Pending Leaves Section */}
            <div className={styles.card} style={{ marginTop: '20px' }}>
                <div className={styles.cardHeader}>
                    <h3>Pending Leave Requests</h3>
                </div>
                {leaves.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No pending leave requests.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--sidebar-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Employee</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Type</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Dates</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Reason</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(leave => (
                                    <tr key={leave._id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                                        <td style={{ padding: '12px 10px' }}>
                                            <div style={{ fontWeight: 600 }}>{leave.user?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{leave.user?.employeeId}</div>
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: 'var(--surface-hover)',
                                                fontSize: '0.9em'
                                            }}>
                                                {leave.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                            {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                        </td>
                                        <td style={{ padding: '12px 10px', maxWidth: '200px', fontSize: '0.9em' }}>{leave.reason}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleLeaveAction(leave._id, 'APPROVED')}
                                                    disabled={actionLoading === leave._id}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        background: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        opacity: actionLoading === leave._id ? 0.7 : 1
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleLeaveAction(leave._id, 'REJECTED')}
                                                    disabled={actionLoading === leave._id}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        opacity: actionLoading === leave._id ? 0.7 : 1
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
