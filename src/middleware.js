import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Manager only paths
        const managerPaths = ['/dashboard', '/analytics'];

        // Employee only paths

        if (token?.role !== 'MANAGER' && token?.role !== 'HR' && token?.role !== 'ADMIN' && managerPaths.some(p => path.startsWith(p))) {
            return NextResponse.redirect(new URL('/my-tasks', req.url));
        }

        if ((token?.role === 'MANAGER' || token?.role === 'HR' || token?.role === 'ADMIN') && path === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (token?.role === 'EMPLOYEE' && path === '/') {
            return NextResponse.redirect(new URL('/my-tasks', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname === '/login') return true;
                if (req.nextUrl.pathname === '/') return true;
                return !!token;
            },
        },
    });

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/team/:path*',
        '/analytics/:path*',
        '/my-tasks/:path*',
        '/tasks/:path*',
        '/attendance/:path*',
        '/chat/:path*'
    ],
};
