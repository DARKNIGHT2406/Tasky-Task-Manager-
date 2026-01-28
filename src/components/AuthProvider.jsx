'use client';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

// Inner component to handle session logic
function AutoLogout() {
    const { data: session, status } = useSession();

    useEffect(() => {
        // Only run when session is authenticated and has an expiry
        if (status === 'authenticated' && session?.expiresAt) {
            const now = Date.now();
            const timeLeft = session.expiresAt - now;

            console.log("DEBUG: Time until midnight expiry (ms):", timeLeft);

            if (timeLeft > 0) {
                const timer = setTimeout(() => {
                    // Force logout when time expires
                    console.log("DEBUG: AutoLogout triggered. SignOut disabled for debugging.");
                    // signOut({ callbackUrl: '/login?error=SessionExpired' });
                    // alert("Session expired at midnight. Please login again.");
                }, timeLeft);
                return () => clearTimeout(timer);
            } else {
                // If timeLeft is negative, it means token is already expired.
                // signOut({ callbackUrl: '/login?error=TokenExpired' });
            }
        }
    }, [session, status]);

    return null;
}

export default function AuthProvider({ children }) {
    return (
        <SessionProvider>
            <AutoLogout />
            {children}
        </SessionProvider>
    );
}
