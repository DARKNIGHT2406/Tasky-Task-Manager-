'use client';

import {
    LayoutDashboard,
    CheckSquare,
    Users,
    BarChart,
    FileText,
    LogOut,
    Sun,
    Moon,
    Command
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const isManager = session?.user?.role === 'MANAGER';

    if (!session) return null;

    const navItems = isManager ? [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
        { name: 'Team', path: '/team', icon: <Users size={20} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart size={20} /> },
    ] : [
        { name: 'My Tasks', path: '/my-tasks', icon: <FileText size={20} /> },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/">
                    <div className={styles.logoIcon}>
                        <Command size={20} />
                    </div>
                    Tasky
                </Link>
            </div>

            <ul className={styles.navLinks}>
                {navItems.map((item) => (
                    <li key={item.path} className={styles.navItem}>
                        <Link href={item.path} className={pathname.startsWith(item.path) ? styles.active : ''}>
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navText}>{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className={styles.userSection}>
                <div className={styles.userCard}>
                    <div className={styles.avatar}>
                        {session.user.name.charAt(0)}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session.user.name.split(' ')[0]}</span>
                        <span className={styles.userRole}>{session.user.role}</span>
                    </div>
                </div>

                <div className={styles.themeToggle} onClick={toggleTheme}>
                    <span className={styles.themeLabel}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                    {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                </div>

                <button
                    onClick={() => signOut()}
                    className={`btn ${styles.logoutBtn}`}
                >
                    <LogOut size={20} />
                    <span className={styles.navText} style={{ marginLeft: '1rem' }}>Logout</span>
                </button>
            </div>
        </aside>
    );
}
