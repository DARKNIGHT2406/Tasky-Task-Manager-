'use client';

import Navbar from '@/components/Navbar';
import styles from './Dashboard.module.css';
import { Users, CheckSquare, Zap, Clock } from 'lucide-react';

export default function DashboardClient({ stats, session, aiSummary, error }) {
    // Date formatting
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <main className={`${styles.container} container`} style={{ marginTop: '2rem' }}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.heading}>Dashboard</h1>
                        <p className={styles.subheading}>Overview of your team's performance</p>
                    </div>
                    <div className={styles.dateBadge}>
                        📅 {today}
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)',
                        fontWeight: '500'
                    }}>
                        ⚠️ System Alert: {error}. retrying...
                    </div>
                )}

                <div className={styles.bentoGrid}>
                    {/* Welcome Card */}
                    <div className={`${styles.card} ${styles.welcomeCard}`}>
                        <div style={{ zIndex: 2 }}>
                            <h2 className={styles.cardTitle}>Welcome Back, {session?.user?.name.split(' ')[0]}! 👋</h2>
                            <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.9 }}>
                                You have {stats.find(s => s.key === 'activeTasks')?.value || 0} active tasks requiring attention.
                            </p>
                        </div>
                    </div>

                    {/* AI Insight Card */}
                    <div className={`${styles.card} ${styles.aiCard}`}>
                        <div style={{ zIndex: 2 }}>
                            <h2 className={styles.cardTitle}>✨ AI Insights</h2>
                            <p style={{ fontSize: '1.2rem', fontWeight: 500, marginTop: '1rem' }}>
                                "{aiSummary}"
                            </p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>High Velocity</span>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>On Track</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats.map((stat, index) => (
                        <div key={index} className={`${styles.card} ${styles.statCard}`}>
                            <div className={styles.iconCircle} style={{ background: `var(--${stat.color === 'indigo' ? 'primary' : stat.color})`, color: 'white', opacity: 0.8 }}>
                                {stat.key === 'totalEmployees' && <Users size={24} />}
                                {stat.key === 'totalTasks' && <CheckSquare size={24} />}
                                {stat.key === 'activeTasks' && <Zap size={24} />}
                                {stat.key === 'pendingApproval' && <Clock size={24} />}
                            </div>
                            <h3 className={styles.cardValue} style={{ color: 'var(--text-main)' }}>
                                {stat.value}
                            </h3>
                            <p className={styles.statLabel}>{stat.label}</p>
                        </div>
                    ))}

                    {/* Chart Area */}
                    <div className={`${styles.card} ${styles.chartCard}`}>
                        <h2 className={styles.cardTitle}>
                            <span>Activity Analysis</span>
                            <button className="btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: 'var(--background)' }}>Weekly ▼</button>
                        </h2>
                        <div className={styles.placeholderChart} style={{ background: 'transparent', border: 'none', height: '100%', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '1rem' }}>
                            {/* CSS Bar Chart Mockup */}
                            {[40, 60, 35, 80, 55, 70, 45].map((h, i) => (
                                <div key={i} style={{
                                    width: '40px',
                                    height: `${h}%`,
                                    background: 'linear-gradient(to top, var(--primary), var(--accent))',
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.8,
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', bottom: '-25px', left: '0', width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Recent Activity */}
                    <div className={`${styles.card} ${styles.sidebarCard}`}>
                        <h2 className={styles.cardTitle}>Recent Activity</h2>
                        <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2, 3].map(i => (
                                <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Task Completed</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Just now</p>
                                    </div>
                                </li>
                            ))}
                            <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>New Comment</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>2 mins ago</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
