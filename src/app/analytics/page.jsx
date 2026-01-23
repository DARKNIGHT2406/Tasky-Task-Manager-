'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './Analytics.module.css';

export default function AnalyticsPage() {
    const [data, setData] = useState({ statusCounts: [], employeePerformance: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(async res => {
                if (!res.ok) throw new Error('Failed to fetch analytics');
                return res.json();
            })
            .then(data => {
                // Ensure arrays exist to prevent crash
                setData({
                    statusCounts: data.statusCounts || [],
                    employeePerformance: data.employeePerformance || []
                });
            })
            .catch(err => {
                console.error(err);
                // Keep default empty state to prevent crash
            })
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'gray';
            case 'IN_PROGRESS': return 'blue';
            case 'SUBMITTED': return 'orange';
            case 'COMPLETED': return 'green';
            case 'OVERDUE': return 'red';
            default: return 'gray';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <main className="container" style={{ marginTop: '2rem' }}>
                <h1 className={styles.heading}>Performance Analytics</h1>

                {loading ? (
                    <p>Loading analytics...</p>
                ) : (
                    <>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Task Status Overview</h2>
                            <div className={styles.statusGrid}>
                                {data.statusCounts.map(item => (
                                    <div key={item._id} className="card" style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '2rem', color: `var(--${getStatusColor(item._id)})` }}>
                                            {item.count}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{item._id}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.section} style={{ marginTop: '3rem' }}>
                            <h2 className={styles.sectionTitle}>Employee Performance</h2>
                            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--text-secondary)' }}>
                                            <th style={{ padding: '1rem' }}>Employee</th>
                                            <th style={{ padding: '1rem' }}>Total Tasks</th>
                                            <th style={{ padding: '1rem' }}>Completed</th>
                                            <th style={{ padding: '1rem' }}>Overdue</th>
                                            <th style={{ padding: '1rem' }}>Completion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.employeePerformance.map(emp => {
                                            const rate = emp.totalTasks > 0 ? Math.round((emp.completedTasks / emp.totalTasks) * 100) : 0;
                                            return (
                                                <tr key={emp._id} style={{ borderBottom: '1px solid var(--text-secondary)' }}>
                                                    <td style={{ padding: '1rem' }}>{emp.name}</td>
                                                    <td style={{ padding: '1rem' }}>{emp.totalTasks}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--green)' }}>{emp.completedTasks}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--red)' }}>{emp.overdueTasks}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ width: '100px', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${rate}%`, height: '100%', background: 'var(--primary)' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>{rate}%</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
