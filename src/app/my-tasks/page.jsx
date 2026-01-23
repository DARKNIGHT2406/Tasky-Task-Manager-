'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './MyTasks.module.css';

export default function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => setTasks(data))
            .catch(err => console.error(err))
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
                <h1 className={styles.heading}>My Assignments</h1>

                {loading ? (
                    <p>Loading your tasks...</p>
                ) : tasks.length === 0 ? (
                    <div className={styles.empty}>
                        <p>You have no assigned tasks. Great job!</p>
                    </div>
                ) : (
                    <div className={styles.taskGrid}>
                        {tasks.map(task => (
                            <Link href={`/my-tasks/${task._id}`} key={task._id} className={styles.cardLink}>
                                <div className={`card ${styles.taskCard}`}>
                                    <div className={styles.cardHeader}>
                                        <span
                                            className={styles.status}
                                            style={{ backgroundColor: `var(--${getStatusColor(task.status)})`, color: 'white' }}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </span>
                                        <span className={styles.date}>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className={styles.title}>{task.title}</h3>
                                    <p className={styles.desc}>{task.description.substring(0, 100)}...</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
