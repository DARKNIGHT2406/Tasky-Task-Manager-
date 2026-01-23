'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LayoutWrapper from '@/components/LayoutWrapper';
import HighlightText from '@/components/HighlightText';
import { useSearch } from '@/context/SearchContext';
import styles from './MyTasks.module.css';
import { Star, Square, Paperclip } from 'lucide-react';

export default function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm } = useSearch();

    useEffect(() => {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => setTasks(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredTasks = tasks.filter(task =>
        searchTerm === '' ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to format date like Gmail (Time if today, Date if older)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <LayoutWrapper>
            {/* Toolbar or similar could go here if needed */}

            {loading ? (
                <p style={{ padding: '2rem' }}>Loading...</p>
            ) : filteredTasks.length === 0 ? (
                <div className={styles.empty}>
                    <p>No tasks found.</p>
                </div>
            ) : (
                <div className={styles.taskList}>
                    {filteredTasks.map(task => (
                        <Link href={`/my-tasks/${task._id}`} key={task._id} className={styles.rowLink}>
                            <div className={styles.taskRow}>
                                <div className={styles.checkbox}>
                                    <Square size={18} />
                                </div>
                                <div className={styles.star}>
                                    <Star size={18} fill={task.status === 'IN_PROGRESS' ? 'none' : 'none'} />
                                    {/* Could use fill based on priority if we had it */}
                                </div>

                                {/* Using Title as the "Sender/Primary" column */}
                                <div className={styles.sender}>
                                    <HighlightText text={task.title} highlight={searchTerm} />
                                </div>

                                {/* Content Preview */}
                                <div className={styles.contentWrapper}>
                                    <span className={styles.snippet}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.status}</span>
                                        {' - '}
                                        <HighlightText text={task.description.substring(0, 100)} highlight={searchTerm} />...
                                    </span>
                                </div>

                                {/* File Attachment Indicator */}
                                {task.imageUrl && (
                                    <div className={styles.attachment}>
                                        <Paperclip size={16} color="var(--text-secondary)" />
                                    </div>
                                )}

                                {/* Date */}
                                <div className={styles.date}>
                                    {formatDate(task.endDate)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </LayoutWrapper>
    );
}
