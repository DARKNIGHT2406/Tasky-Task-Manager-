'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { Camera, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MarkAttendancePage() {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        const checkStatusAndLocation = async () => {
            // 1. Check if already marked
            try {
                const res = await fetch('/api/attendance');
                const data = await res.json();
                if (data.marked) {
                    router.push('/dashboard');
                    return;
                }
            } catch (e) {
                console.error(e);
            } finally {
                setCheckingStatus(false);
            }

            // 2. Get Location
            if (!navigator.geolocation) {
                setError('Geolocation is not supported by your browser');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(loc);
                    setError('');
                    fetchAddress(loc.lat, loc.lng);
                },
                (err) => {
                    setError('Location permission is required to mark attendance.');
                    console.error(err);
                }
            );
        };

        if (status === 'authenticated') {
            checkStatusAndLocation();
        }
    }, [status, router]);

    const fetchAddress = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'TaskyApp/1.0' }
            });
            const data = await res.json();
            if (data && data.display_name) {
                setLocation(prev => ({ ...prev, address: data.display_name }));
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        }
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
                router.push('/dashboard');
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

    if (checkingStatus || status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--primary)] opacity-10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 opacity-10 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-[#111] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-10 animate-fade-in">

                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
                    <h1 className="text-2xl font-bold text-white text-center tracking-tight">Daily Attendance</h1>
                    <p className="text-center text-gray-400 text-sm mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
                </div>

                {/* Camera Section */}
                <div className="relative aspect-[4/5] bg-black group">
                    {imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            videoConstraints={{ facingMode: 'user', width: 720, height: 960 }}
                        />
                    )}

                    {!imgSrc && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/20 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[var(--primary)] rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[var(--primary)] rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[var(--primary)] rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[var(--primary)] rounded-br-lg"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Controls */}
                <div className="p-6 space-y-6">

                    {/* Location Status */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className={`p-2 rounded-full ${location ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Location</p>
                            <p className="text-sm text-gray-200 font-medium leading-relaxed">
                                {location?.address || (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Detecting location...")}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 text-red-200 bg-red-500/20 p-4 rounded-xl border border-red-500/20">
                            <AlertTriangle size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {!imgSrc ? (
                        <button
                            onClick={capture}
                            disabled={!location}
                            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.98] transition-all text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Camera size={24} />
                            <span>Capture Photo</span>
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={retake}
                                className="py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors border border-white/10"
                            >
                                Retake
                            </button>
                            <button
                                onClick={submitAttendance}
                                disabled={loading}
                                className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : (
                                    <>
                                        <span>Confirm</span>
                                        <CheckCircle size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
