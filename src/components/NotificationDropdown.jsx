'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import styles from './NotificationDropdown.module.css';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications(); // Refresh on open
        } else {
            // Mark as read when closing? Or better: mark when opening
            markAsRead();
        }
        setIsOpen(!isOpen);
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const [search, setSearch] = useState('');

    const filteredNotifications = notifications.filter(n =>
        n.message.toLowerCase().includes(search.toLowerCase()) ||
        n.sender?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button className={styles.bellBtn} onClick={handleToggle}>
                <Bell size={20} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3>Notifications</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field"
                            style={{
                                width: '100%',
                                fontSize: '0.85rem',
                                padding: '6px 10px',
                                border: '1px solid var(--sidebar-border)',
                                borderRadius: '4px',
                                background: 'var(--background)'
                            }}
                        />
                    </div>
                    <div className={styles.list}>
                        {filteredNotifications.length === 0 ? (
                            <div className={styles.empty}>No notifications found</div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <div key={notification._id} className={`${styles.item} ${!notification.read ? styles.unread : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {notification.sender?.name?.[0] || 'S'}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                            {notification.sender?.name || 'System'}
                                        </span>
                                    </div>
                                    <p className={styles.message}>{notification.message}</p>
                                    <span className={styles.time}>{new Date(notification.createdAt).toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
