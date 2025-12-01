import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        return <Navigate to="/login" />;
    }

    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            return <Navigate to="/" />; // Or a dedicated "Access Denied" page
        }
    } catch (e) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}
