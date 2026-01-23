'use client';

import { useEffect, useState } from 'react';

import Sidebar from '@/components/Sidebar';
import { Search, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearch } from '@/context/SearchContext';
import NotificationDropdown from './NotificationDropdown';

import { useRouter, usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
    const { data: session } = useSession();
    const { setSearchTerm } = useSearch();
    const pathname = usePathname();
    const router = useRouter();

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAttendance = async () => {
            if (!session || pathname === '/attendance' || pathname === '/login') {
                setIsChecking(false);
                return;
            }

            try {
                const res = await fetch('/api/attendance');
                const data = await res.json();
                if (!data.marked) {
                    router.push('/attendance');
                    // Don't set checking false, let redirect happen
                } else {
                    setIsChecking(false);
                }
            } catch (error) {
                console.error('Attendance check failed', error);
                setIsChecking(false); // Let them pass if system fails? Or block? Let's pass for now to avoid lockout on error.
            }
        };

        checkAttendance();
    }, [pathname, session, router]);

    if (isChecking && pathname !== '/attendance' && pathname !== '/login' && session) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--text-main)' }}>
                Validating Attendance...
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
                {/* Top Header */}
                <header style={{
                    height: '70px',
                    borderBottom: '1px solid var(--sidebar-border)',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--background)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        gap: '0.5rem',
                        width: '300px',
                    }}>
                        <Search size={18} className="text-gray-400" color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search tasks, team..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.9rem',
                                color: 'var(--text-main)',
                                width: '100%'
                            }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <NotificationDropdown />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                {session?.user?.name?.[0] || 'U'}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-main)' }}>{session?.user?.name}</span>
                            <ChevronDown size={16} color="var(--text-secondary)" />
                        </div>
                    </div>
                </header>

                <div style={{ padding: '2rem', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
