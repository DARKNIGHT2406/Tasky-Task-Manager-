'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './Team.module.css';
import { Trash2, UserPlus } from 'lucide-react';

export default function TeamPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newEmployeeId, setNewEmployeeId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    const handeCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, employeeId: newEmployeeId, password: newPassword }),
            });

            if (res.ok) {
                setNewName('');
                setNewEmployeeId('');
                setNewPassword('');
                fetchEmployees();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create employee');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEmployees(employees.filter(emp => emp._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <main className="container" style={{ marginTop: '2rem' }}>
                <h1 className={styles.heading}>Team Management</h1>

                <div className={styles.contentGrid}>
                    {/* Create Employee Form */}
                    <section className={`card ${styles.createCard}`}>
                        <h2>Add New Employee</h2>
                        <form onSubmit={handeCreate} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Employee ID</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newEmployeeId}
                                    onChange={(e) => setNewEmployeeId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Initial Password</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={creating}>
                                {creating ? 'Creating...' : 'Create Employee'}
                            </button>
                        </form>
                    </section>

                    {/* Employee List */}
                    <section className={`card ${styles.listCard}`}>
                        <h2>Employee Directory</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : employees.length === 0 ? (
                            <p>No employees found.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id}>
                                            <td className={styles.empId} style={{ padding: '1rem', borderBottom: '1px solid var(--sidebar-border)' }}>{emp.employeeId}</td>
                                            <td className={styles.empName} style={{ padding: '1rem', borderBottom: '1px solid var(--sidebar-border)' }}>{emp.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--sidebar-border)' }}>
                                                <span style={{
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: 'var(--success)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '99px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>Active</span>
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--sidebar-border)' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--danger)', height: '2rem', padding: '0 0.5rem' }}
                                                    onClick={() => handleDelete(emp._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
