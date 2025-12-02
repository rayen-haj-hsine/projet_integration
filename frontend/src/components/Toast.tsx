import { useState, useEffect } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const toast: Toast = {
        id: toastId++,
        message,
        type
    };
    toastListeners.forEach(listener => listener(toast));
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const listener = (toast: Toast) => {
            setToasts(prev => [...prev, toast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 3000);
        };
        toastListeners.push(listener);
        return () => {
            const index = toastListeners.indexOf(listener);
            if (index > -1) toastListeners.splice(index, 1);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    style={{
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '250px',
                        maxWidth: '400px',
                        animation: 'slideIn 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards',
                        fontWeight: 500
                    }}
                >
                    {toast.message}
                </div>
            ))}
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
