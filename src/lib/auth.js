import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Notification from '@/models/Notification';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                user_id: { label: 'User ID', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.user_id || !credentials?.password) {
                    throw new Error('Please enter a User ID and password');
                }

                try {
                    console.log("DEBUG AUTH: Attempting login for:", credentials.user_id);
                    await dbConnect();
                    const user = await User.findOne({ user_id: credentials.user_id });

                    if (!user) {
                        console.log("DEBUG AUTH: User not found in DB.");
                        throw new Error('No user found with this ID');
                    }
                    console.log("DEBUG AUTH: User found. Verifying password...");

                    const isMatch = await bcrypt.compare(credentials.password, user.password);
                    if (!isMatch) {
                        console.log("DEBUG AUTH: Password incorrect.");
                        throw new Error('Incorrect password');
                    }

                    console.log("DEBUG AUTH: Login successful for:", user.name);

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.user_id, // NextAuth expects 'email', mapping user_id to it
                        role: user.role,
                    };
                } catch (error) {
                    console.error("DEBUG AUTH ERROR:", error.message);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Ye block sirf tab chalta hai jab user Pehli baar Login karta hai
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.user_id = user.email;

                // --- 🛡️ AUTO ATTENDANCE & LATE CHECK START ---
                try {
                    await dbConnect();
                    const now = new Date();

                    // Normalize 'Today' for DB Query (Midnight)
                    const todayDate = new Date(now);
                    todayDate.setHours(0, 0, 0, 0);

                    // Check if already marked
                    const existingAtt = await Attendance.findOne({
                        user: user.id,
                        date: todayDate
                    });

                    if (!existingAtt) {
                        console.log("Creating Auto-Attendance for:", user.name);

                        // Strict Late Check: After 9:00 AM
                        const isStrictLate = (now.getHours() > 9) || (now.getHours() === 9 && now.getMinutes() > 0);

                        let lateMinutes = 0;
                        if (isStrictLate) {
                            const nineAm = new Date(now);
                            nineAm.setHours(9, 0, 0, 0);
                            lateMinutes = Math.floor((now.getTime() - nineAm.getTime()) / 60000);
                        }

                        // Create Record
                        await Attendance.create({
                            user: user.id,
                            date: todayDate, // Normalized Date
                            in_time: now,
                            status: 'PRESENT',
                            is_late: isStrictLate,
                            late_minutes: lateMinutes,
                            photo: 'AUTO_LOGIN', // Placeholder
                            location: { address: 'Auto-Login System' }
                        });

                        // Notify HR if Late
                        if (isStrictLate) {
                            console.log("User is LATE. Notifying HRs...");
                            const hrs = await User.find({ role: 'HR' }).select('_id');

                            const notifications = hrs.map(hr => ({
                                recipient: hr._id,
                                sender: user.id,
                                message: `⚠️ LATE ALERT: ${user.name} (${user.role}) logged in late by ${lateMinutes} mins.`,
                                type: 'ALERT',
                                isRead: false
                            }));

                            if (notifications.length > 0) {
                                await Notification.insertMany(notifications);
                            }
                        }
                    } else {
                        console.log("Attendance already exists for today.");
                    }
                } catch (attError) {
                    console.error("❌ Auto Attendance Failed:", attError);
                }
                // --- AUTO ATTENDANCE END ---

                // --- 🛡️ ROBUST MIDNIGHT LOGIC START ---
                try {
                    const now = new Date();
                    // Universal "Start of Tomorrow" Logic (Locale Independent)
                    const midnight = new Date(now);
                    midnight.setDate(now.getDate() + 1);
                    midnight.setHours(0, 0, 0, 0);

                    // Seconds nikalna (Future - Now)
                    let secondsRemaining = Math.floor((midnight.getTime() - now.getTime()) / 1000);

                    console.log(`🕒 Login Time: ${now.toISOString()}`);
                    console.log(`🎯 Target Midnight: ${midnight.toISOString()}`); // ISO string is always distinct
                    console.log(`⏳ Seconds Remaining: ${secondsRemaining}`);

                    // 🚨 SAFETY CHECK (Agar calculation fail ho ya negative aaye)
                    // Agar 60 seconds se kam bache hain, toh Safety ke liye 24 ghante (86400s) de do
                    if (isNaN(secondsRemaining) || secondsRemaining < 60) {
                        console.log("⚠️ Midnight logic edge case. Defaulting to 24h.");
                        secondsRemaining = 24 * 60 * 60; // 1 Day
                    }

                    // Token Expiry set karna (Current Time + Remaining Seconds)
                    token.exp = Math.floor(Date.now() / 1000) + secondsRemaining;

                } catch (error) {
                    console.error("❌ Midnight Logic Failed:", error);
                    // Agar error aaye toh bhi login mat roko, 1 din ka token de do
                    token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
                }
                // --- ROBUST MIDNIGHT LOGIC END ---
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.user_id = token.user_id;
                // Client side ko batana ki kab expire hoga
                session.expiresAt = token.exp * 1000;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // Default Max Age (Token.exp ise override karega)
    },
    secret: process.env.NEXTAUTH_SECRET,
};