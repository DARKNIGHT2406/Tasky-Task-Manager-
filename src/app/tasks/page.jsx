'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import styles from './Tasks.module.css';
import { Play, Check, X, FilePlus } from 'lucide-react';


export default function TasksPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = () => {
        setLoading(true);
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => setTasks(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        // Optimistic update
        const originalTasks = [...tasks];
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                // Revert on failure
                setTasks(originalTasks);
                const data = await res.json();
                alert(data.error || 'Failed to update task');
            }
            // No need to fetchTasks() on success
        } catch (error) {
            console.error(error);
            setTasks(originalTasks);
            alert('An error occurred');
        }
    };

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
                <div className={styles.header}>
                    <h1 className={styles.heading}>All Tasks</h1>
                    {session?.user?.role === 'MANAGER' && (
                        <div className={styles.controls}>
                            <div className={styles.filters}>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`}
                                    onClick={() => setFilter('ALL')}
                                >
                                    All
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'SUBMITTED' ? styles.active : ''}`}
                                    onClick={() => setFilter('SUBMITTED')}
                                >
                                    Pending Approval
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filter === 'IN_PROGRESS' ? styles.active : ''}`}
                                    onClick={() => setFilter('IN_PROGRESS')}
                                >
                                    In Progress
                                </button>
                            </div>
                            <Link href="/tasks/create" className="btn btn-primary">
                                + Assign Task
                            </Link>
                        </div>
                    )}
                </div>

                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks found.</p>
                ) : (
                    <div className={styles.taskGrid}>
                        {tasks
                            .filter(task => filter === 'ALL' || task.status === filter)
                            .map(task => (
                                <div key={task._id} className={`card ${styles.taskCard}`}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.id}>Task</span>
                                        <span
                                            className={styles.status}
                                            style={{ backgroundColor: `var(--${getStatusColor(task.status)})`, opacity: 0.8, color: 'white' }}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                    <h3 className={styles.taskTitle}>{task.title}</h3>
                                    <p className={styles.assignee}>
                                        Assigned to: <strong>{task.assignee?.name || 'Unknown'}</strong>
                                    </p>
                                    <div className={styles.dates}>
                                        <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                                    </div>

                                    <div className={styles.actions} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        {/* Employee Actions */}
                                        {session?.user?.role === 'EMPLOYEE' && task.status === 'PENDING' && (
                                            <button
                                                onClick={() => updateTaskStatus(task._id, 'IN_PROGRESS')}
                                                className="btn btn-primary"
                                                style={{ gap: '0.5rem' }}
                                            >
                                                <Play size={16} /> Start Task
                                            </button>
                                        )}
                                        {session?.user?.role === 'EMPLOYEE' && task.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => updateTaskStatus(task._id, 'SUBMITTED')}
                                                className="btn"
                                                style={{ backgroundColor: '#10b981', color: 'white', gap: '0.5rem' }} // emerald-500
                                            >
                                                <Check size={16} /> Submit Work
                                            </button>
                                        )}

                                        {/* Manager Actions */}
                                        {session?.user?.role === 'MANAGER' && task.status === 'SUBMITTED' && (
                                            <>
                                                <button
                                                    onClick={() => updateTaskStatus(task._id, 'COMPLETED')}
                                                    className="btn"
                                                    style={{ backgroundColor: '#22c55e', color: 'white', gap: '0.5rem' }} // green-500
                                                >
                                                    <Check size={16} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => updateTaskStatus(task._id, 'IN_PROGRESS')}
                                                    className="btn"
                                                    style={{ backgroundColor: '#ef4444', color: 'white', gap: '0.5rem' }} // red-500
                                                >
                                                    <X size={16} /> Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
}
