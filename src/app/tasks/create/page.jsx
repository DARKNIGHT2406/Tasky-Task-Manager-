'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './CreateTask.module.css';

export default function CreateTaskPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        // Fetch employees for dropdown
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/tasks');
            } else {
                alert('Error creating task');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <main className="container" style={{ marginTop: '2rem' }}>
                <h1 className={styles.heading}>Assign New Task</h1>

                <div className={`glass-card ${styles.formCard}`}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Task Title</label>
                            <input
                                type="text"
                                name="title"
                                className="input-field"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="input-field"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                required
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Assignee</label>
                                <select
                                    name="assigneeId"
                                    className="input-field"
                                    value={formData.assigneeId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.name} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="input-field"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="input-field"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? 'Assigning...' : 'Assign Task'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
