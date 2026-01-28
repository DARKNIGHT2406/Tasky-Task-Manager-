'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useSession } from 'next-auth/react';
import styles from './Salary.module.css';

export default function SalaryPage() {
    const { data: session } = useSession();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session?.user?.role === 'HR') {
            fetchPayroll();
        }
    }, [session, month]);

    const fetchPayroll = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/hr/salary?month=${month}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch payroll');

            setPayrollData(data.payroll || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (session?.user?.role !== 'HR') {
        return (
            <LayoutWrapper>
                <div className={styles.container}>
                    <h1>Access Denied</h1>
                    <p>Only HR can access this page.</p>
                </div>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Monthly Salary Sheet</h1>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className={styles.monthPicker}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {loading ? (
                    <div className={styles.loading}>Generating Payroll...</div>
                ) : (
                    <div className="table-responsive">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Base Salary</th>
                                    <th>Days Present</th>
                                    <th>Late (Mins)</th>
                                    <th>Deduction</th>
                                    <th>Net Salary</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollData.length > 0 ? (
                                    payrollData.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td><span className={`role-badge ${row.role?.toLowerCase()}`}>{row.role}</span></td>
                                            <td>₹{row.base_salary}</td>
                                            <td>{row.days_present}</td>
                                            <td className={row.total_late_minutes > 0 ? styles.late : ''}>
                                                {row.total_late_minutes}m
                                            </td>
                                            <td className={styles.deduction}>- ₹{row.late_deduction}</td>
                                            <td className={styles.netSalary}>₹{row.net_salary}</td>
                                            <td><span className={styles.statusBadge}>{row.status}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center' }}>No records found for this month</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </LayoutWrapper>
    );
}
