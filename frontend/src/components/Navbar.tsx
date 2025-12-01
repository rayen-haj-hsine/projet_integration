import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import api from '../api/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Notification state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notifRef]);

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed?.name) setName(parsed.name);
                    if (parsed?.role) setRole(parsed.role);
                } catch { }
            }
            if (!name || !role) {
                api.get('/auth/me').then(res => {
                    setName(res.data.name);
                    setRole(res.data.role);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }).catch(() => { });
            }

            // Poll notifications
            const fetchNotifs = () => {
                api.get('/notifications')
                    .then(res => {
                        setNotifications(res.data);
                        setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
                    })
                    .catch(() => { });
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setName(null);
        setRole(null);
        navigate('/login');
    };

    const markAsRead = (id: number) => {
        api.patch(`/notifications/${id}/read`)
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            })
            .catch(() => { });
    };

    return (
        <nav style={{
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0.75rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 1.5rem'
            }}>
                {/* Left Section - Logo & Main Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link
                        to="/"
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        🚗 TripShare
                    </Link>

                    {token && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {role === 'admin' ? (
                                <>
                                    <Link
                                        to="/admin"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/admin' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/admin' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/admin' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        🛡️ Driver Requests
                                    </Link>
                                    <Link
                                        to="/admin/drivers"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/admin/drivers' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/admin/drivers' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/admin/drivers' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        🚙 Drivers
                                    </Link>
                                    <Link
                                        to="/admin/passengers"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/admin/passengers' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/admin/passengers' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/admin/passengers' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        👥 Passengers
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/trips"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/trips' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/trips' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/trips' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        🔍 Browse Trips
                                    </Link>

                                    {role === 'driver' && (
                                        <>
                                            <Link
                                                to="/publish-trip"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    color: window.location.pathname === '/publish-trip' ? 'var(--primary-color)' : 'var(--text-primary)',
                                                    backgroundColor: window.location.pathname === '/publish-trip' ? 'var(--bg-color)' : 'transparent',
                                                    fontWeight: window.location.pathname === '/publish-trip' ? 600 : 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                ➕ Publish Trip
                                            </Link>
                                            <Link
                                                to="/my-trips"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    color: window.location.pathname === '/my-trips' ? 'var(--primary-color)' : 'var(--text-primary)',
                                                    backgroundColor: window.location.pathname === '/my-trips' ? 'var(--bg-color)' : 'transparent',
                                                    fontWeight: window.location.pathname === '/my-trips' ? 600 : 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                🚙 My Trips
                                            </Link>
                                        </>
                                    )}

                                    <Link
                                        to="/reservations"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/reservations' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/reservations' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/reservations' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        📋 Reservations
                                    </Link>

                                    <Link
                                        to="/chats"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: window.location.pathname === '/chats' ? 'var(--primary-color)' : 'var(--text-primary)',
                                            backgroundColor: window.location.pathname === '/chats' ? 'var(--bg-color)' : 'transparent',
                                            fontWeight: window.location.pathname === '/chats' ? 600 : 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        💬 Messages
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section - User Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {token ? (
                        <>
                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <button
                                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                                    style={{
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        position: 'relative',
                                        padding: '0.5rem 0.75rem',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -5,
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            borderRadius: '999px',
                                            minWidth: '20px',
                                            height: '20px',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            padding: '0 5px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 'calc(100% + 8px)',
                                        width: '360px',
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        maxHeight: '450px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem'
                                        }}>
                                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div style={{
                                                padding: '2rem',
                                                textAlign: 'center',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.95rem'
                                            }}>
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        if (!n.is_read) markAsRead(n.id);
                                                        if (n.type === 'reservation_request') {
                                                            navigate('/my-trips');
                                                        } else if (['confirmation', 'cancellation'].includes(n.type)) {
                                                            navigate('/reservations');
                                                        }
                                                        setNotifDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '1rem',
                                                        borderBottom: '1px solid var(--border-color)',
                                                        backgroundColor: n.is_read ? 'transparent' : 'var(--bg-color)',
                                                        cursor: 'pointer',
                                                        opacity: n.is_read ? 0.7 : 1,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => !n.is_read && (e.currentTarget.style.backgroundColor = 'var(--card-bg)')}
                                                    onMouseLeave={(e) => !n.is_read && (e.currentTarget.style.backgroundColor = 'var(--bg-color)')}
                                                >
                                                    <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Profile Section */}
                            <Link
                                to="/profile"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    backgroundColor: window.location.pathname === '/profile' ? 'var(--bg-color)' : 'transparent',
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = window.location.pathname === '/profile' ? 'var(--bg-color)' : 'transparent'}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>
                                    {name ? name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                        {name || 'User'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {role || 'Member'}
                                    </span>
                                </div>
                            </Link>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '1.25rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                title="Toggle theme"
                            >
                                {theme === 'dark' ? '🌞' : '🌙'}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                    e.currentTarget.style.borderColor = '#dc2626';
                                    e.currentTarget.style.color = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '1.25rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                title="Toggle theme"
                            >
                                {theme === 'dark' ? '🌞' : '🌙'}
                            </button>

                            <Link
                                to="/login"
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
