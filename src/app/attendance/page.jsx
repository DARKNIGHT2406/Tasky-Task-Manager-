'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Plus } from 'lucide-react';

import { format } from 'date-fns';
import CalendarView from '@/components/CalendarView';
import LeaveRequestModal from './LeaveRequestModal';

export default function AttendancePage() {
    // Calendar & Leave State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    useEffect(() => {
        fetchMonthData();
        fetchLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch data when month changes
    useEffect(() => {
        fetchMonthData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    const fetchMonthData = async () => {
        try {
            const monthStr = format(currentDate, 'yyyy-MM');
            const res = await fetch(`/api/attendance?history=true&month=${monthStr}`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setAttendanceData(data);
            } else {
                console.error("Failed to fetch attendance:", data);
                setAttendanceData([]);
            }
        } catch (err) {
            console.error(err);
            setAttendanceData([]);
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setLeavesData(data);
            } else {
                console.error("Failed to fetch leaves:", data);
                setLeavesData([]);
            }
        } catch (err) {
            console.error(err);
            setLeavesData([]);
        }
    };

    return (
        <LayoutWrapper>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-2xl font-bold">Attendance & Leaves</h1>
                    <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={20} /> Request Leave
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Calendar */}
                    <div>
                        <CalendarView
                            currentDate={currentDate}
                            onMonthChange={setCurrentDate}
                            attendanceData={attendanceData}
                            leavesData={leavesData}
                        />
                    </div>

                    {/* Right Column: Leave History & Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Stats Cards could go here */}

                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>My Leaves</h3>
                            {leavesData.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No leave history.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {leavesData.map(leave => (
                                        <div key={leave._id} style={{
                                            padding: '1rem',
                                            background: 'var(--background)',
                                            borderRadius: '8px',
                                            borderLeft: `4px solid ${leave.status === 'APPROVED' ? '#22c55e' :
                                                leave.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                                                }`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600 }}>{leave.type}</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: leave.status === 'APPROVED' ? '#dcfce7' : leave.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                                                    color: leave.status === 'APPROVED' ? '#15803d' : leave.status === 'REJECTED' ? '#b91c1c' : '#b45309',
                                                    fontWeight: 'bold'
                                                }}>{leave.status}</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                            </p>
                                            <p style={{ fontSize: '0.85rem' }}>{leave.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <LeaveRequestModal
                    isOpen={isLeaveModalOpen}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSuccess={() => {
                        fetchLeaves();
                        // Also re-fetch calendar if leave affects current month view
                        fetchMonthData();
                    }}
                />
            </div>
        </LayoutWrapper>
    );
}
