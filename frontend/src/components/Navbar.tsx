import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App';
import api from '../api/axios';
import {
    Car,
    Shield,
    Users,
    Search,
    PlusCircle,
    ClipboardList,
    History,
    MessageCircle,
    Bell,
    Sun,
    Moon,
    LogOut,
    User
} from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Notification state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Unread chat and reservation counts
    const [unreadChats, setUnreadChats] = useState(0);
    const [pendingReservations, setPendingReservations] = useState(0);

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

            // Poll unread counts
            const fetchUnreadCounts = () => {
                api.get('/chats/unread-counts')
                    .then(res => {
                        setUnreadChats(res.data.unread_chats || 0);
                        setPendingReservations(res.data.pending_reservations || 0);
                    })
                    .catch(() => { });
            };
            fetchUnreadCounts();
            const unreadInterval = setInterval(fetchUnreadCounts, 10000);

            return () => {
                clearInterval(interval);
                clearInterval(unreadInterval);
            };
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const markAsRead = (id: number) => {
        api.patch(`/notifications/${id}/read`)
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            })
            .catch(() => { });
    };

    const isActive = (path: string) => location.pathname === path;

    const linkStyle = (path: string) => ({
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        color: isActive(path) ? 'var(--primary-color)' : 'var(--text-secondary)',
        backgroundColor: isActive(path) ? 'var(--surface-color)' : 'transparent',
        fontWeight: isActive(path) ? 600 : 500,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    });

    return (
        <nav className="navbar">
            <div className="container">
                {/* Left Section - Logo & Main Links */}
                <div className="navbar-left">
                    <Link to="/" style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Car size={24} className="text-primary" />
                        TripShare
                    </Link>

                    {token && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {role === 'admin' ? (
                                <>
                                    <Link to="/admin" style={linkStyle('/admin')}>
                                        <Shield size={18} /> Requests
                                    </Link>
                                    <Link to="/admin/drivers" style={linkStyle('/admin/drivers')}>
                                        <Car size={18} /> Drivers
                                    </Link>
                                    <Link to="/admin/passengers" style={linkStyle('/admin/passengers')}>
                                        <Users size={18} /> Passengers
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/trips" style={linkStyle('/trips')}>
                                        <Search size={18} /> Browse
                                    </Link>

                                    {role === 'driver' && (
                                        <>
                                            <Link to="/publish-trip" style={linkStyle('/publish-trip')}>
                                                <PlusCircle size={18} /> Publish
                                            </Link>
                                            <Link to="/my-trips" style={linkStyle('/my-trips')}>
                                                <Car size={18} /> My Trips
                                                {pendingReservations > 0 && (
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        backgroundColor: 'var(--error-color)',
                                                        borderRadius: '50%'
                                                    }} />
                                                )}
                                            </Link>
                                        </>
                                    )}

                                    <Link to="/reservations" style={linkStyle('/reservations')}>
                                        <ClipboardList size={18} /> Reservations
                                    </Link>

                                    <Link to="/history" style={linkStyle('/history')}>
                                        <History size={18} /> History
                                    </Link>

                                    <Link to="/chats" style={linkStyle('/chats')}>
                                        <MessageCircle size={18} /> Messages
                                        {unreadChats > 0 && (
                                            <span style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: 'var(--error-color)',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section - User Actions */}
                <div className="navbar-right">
                    {token ? (
                        <>
                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <button
                                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                                    className="btn-secondary"
                                    style={{ padding: '0.5rem', border: 'none', boxShadow: 'none' }}
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'var(--error-color)',
                                            color: 'white',
                                            borderRadius: '999px',
                                            minWidth: '16px',
                                            height: '16px',
                                            fontSize: '0.65rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifDropdownOpen && (
                                    <div className="dropdown-menu" style={{ width: '320px', padding: 0 }}>
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: 600
                                        }}>
                                            Notifications
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => {
                                                            if (!n.is_read) markAsRead(n.id);
                                                            if (n.type === 'reservation_request') navigate('/my-trips');
                                                            else if (['confirmation', 'cancellation'].includes(n.type)) navigate('/reservations');
                                                            setNotifDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            borderBottom: '1px solid var(--border-color)',
                                                            backgroundColor: n.is_read ? 'transparent' : 'var(--surface-color)',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color)'}
                                                        onMouseLeave={(e) => !n.is_read ? e.currentTarget.style.backgroundColor = 'var(--surface-color)' : e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{n.message}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {new Date(n.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Section */}
                            <Link to="/profile" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textDecoration: 'none'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'var(--bg-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {name ? name.charAt(0).toUpperCase() : <User size={16} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                        {name || 'User'}
                                    </span>
                                </div>
                            </Link>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="btn-secondary"
                                style={{ padding: '0.5rem', border: 'none', boxShadow: 'none' }}
                                title="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="btn-secondary"
                                style={{ padding: '0.5rem', border: 'none', boxShadow: 'none', color: 'var(--error-color)' }}
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button
                                onClick={toggleTheme}
                                className="btn-secondary"
                                style={{ padding: '0.5rem', border: 'none', boxShadow: 'none' }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <Link to="/login" className="btn btn-secondary">
                                Login
                            </Link>
                            <Link to="/register" className="btn">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
