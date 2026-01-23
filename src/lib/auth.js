import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                employeeId: { label: 'Employee ID', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.employeeId || !credentials?.password) {
                    throw new Error('Please enter an employee ID and password');
                }

                await dbConnect();

                const user = await User.findOne({
                    employeeId: credentials.employeeId,
                });

                if (!user) {
                    throw new Error('No user found with this ID');
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error('Incorrect password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.employeeId, // Using email field to store employeeId for session
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.employeeId = user.email; // Mapping back
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.employeeId = token.employeeId;
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
    },
    secret: process.env.NEXTAUTH_SECRET,
};
