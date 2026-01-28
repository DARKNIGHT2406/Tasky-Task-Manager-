'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, LogOut, Calendar, MessageCircle, Banknote } from 'lucide-react';
import styles from './Sidebar.module.css';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    // { name: 'Analytics', href: '/analytics', icon: PieChart }, // Future
    // { name: 'Settings', href: '/settings', icon: Settings }, // Future
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>
                    T
                </div>
                <span className={styles.logoText}>TeamPulse</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* HR ONLY LINKS */}
                {session?.user?.role === 'HR' && (
                    <Link
                        href="/salary"
                        className={`${styles.navItem} ${pathname === '/salary' ? styles.active : ''}`}
                    >
                        <Banknote size={20} />
                        <span>Salary Sheet</span>
                    </Link>
                )}
            </nav>

            <div className={styles.footer}>
                <button className={styles.navItem} onClick={() => signOut()} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
