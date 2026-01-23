'use client';

import Image from 'next/image';
import Webcam from 'react-webcam';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Camera, MapPin, AlertTriangle, Plus } from 'lucide-react';

import { format } from 'date-fns';
import CalendarView from '@/components/CalendarView';
import LeaveRequestModal from './LeaveRequestModal';

export default function AttendancePage() {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState(null); // 'MARKING', 'DONE'


    // Calendar & Leave State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    useEffect(() => {
        checkTodayStatus();
        fetchMonthData();
        fetchLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch data when month changes
    useEffect(() => {
        fetchMonthData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    const checkTodayStatus = async () => {
        try {
            const res = await fetch('/api/attendance');
            const data = await res.json();
            if (data.marked) {
                setStatus('DONE');
            } else {
                setStatus('MARKING');
                getLocation();
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setError('');
            },
            (err) => {
                setError('Location permission denied.');
                console.error(err);
            }
        );
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const submitAttendance = async () => {
        if (!imgSrc || !location) {
            setError('Both photo and location are required.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo: imgSrc, location }),
            });

            if (res.ok) {
                setStatus('DONE');
                fetchMonthData();
                fetchLeaves();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to submit attendance');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'MARKING') {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
                <div className="bg-[var(--surface)] p-6 rounded-lg shadow-xl max-w-md w-full border border-[var(--sidebar-border)]">
                    <h1 className="text-2xl font-bold mb-6 text-center text-[var(--text-main)]">Daily Attendance</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}

                    <div className="mb-6 relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                        {imgSrc ? (
                            <Image src={imgSrc} alt="captured" className="w-full h-full object-cover" width={640} height={480} unoptimized />
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] justify-center">
                            <MapPin size={16} className={location ? "text-green-500" : "text-gray-400"} />
                            {location ? "Location Acquired" : "Fetching Location..."}
                        </div>

                        {!imgSrc ? (
                            <button onClick={capture} disabled={!location} className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                <Camera size={20} /> Capture Photo
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={retake} className="flex-1 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all">Retake</button>
                                <button onClick={submitAttendance} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                                    {loading ? 'Submitting...' : 'Confirm'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

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
