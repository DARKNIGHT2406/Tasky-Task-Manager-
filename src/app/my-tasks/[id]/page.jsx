'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './TaskDetail.module.css';

export default function TaskDetailPage() {
    const params = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/tasks/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setTask(data);
                calculateTimeLeft(data.endDate);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        if (!task) return;
        const timer = setInterval(() => {
            calculateTimeLeft(task.endDate);
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [task]);

    const calculateTimeLeft = (endDate) => {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance < 0) {
            setTimeLeft('Overdue');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        setTimeLeft(`${days}d ${hours}h remaining`);
    };

    const handleSubmitTask = async () => {
        if (!confirm('Are you sure you want to submit this task? It will become read-only.')) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'SUBMITTED' }),
            });

            if (res.ok) {
                setTask(prev => ({ ...prev, status: 'SUBMITTED' }));
            } else {
                alert('Failed to submit task');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[var(--background)] p-8">Loading...</div>;
    if (!task) return <div className="min-h-screen bg-[var(--background)] p-8">Task not found</div>;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <main className={`container ${styles.main}`} style={{ marginTop: '2rem' }}>
                <div className={`card ${styles.detailCard}`}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{task.title}</h1>
                        <div className={styles.meta}>
                            <span className={`${styles.badge} ${styles[task.status]}`}>
                                {task.status.replace('_', ' ')}
                            </span>
                            <span className={`${styles.timer} ${timeLeft === 'Overdue' ? styles.overdue : ''}`}>
                                {timeLeft}
                            </span>
                        </div>
                    </div>

                    <div className={styles.dates}>
                        <p><strong>Assigned to:</strong> {task.assignee?.name || 'Unknown'}</p>
                        <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
                        <p><strong>Deadline:</strong> {new Date(task.endDate).toLocaleDateString()}</p>
                    </div>

                    <div className={styles.description}>
                        <h3>Description</h3>
                        <p>{task.description}</p>
                    </div>

                    <div className={styles.actions}>
                        {task.status === 'PENDING' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    fetch(`/api/tasks/${params.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'IN_PROGRESS' })
                                    }).then(() => setTask(prev => ({ ...prev, status: 'IN_PROGRESS' })));
                                }}
                            >
                                Start Working
                            </button>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitTask}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Mark as Submitted'}
                            </button>
                        )}

                        {task.status === 'SUBMITTED' && (
                            <div className={styles.readOnlyMsg}>
                                Task submitted for review.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
