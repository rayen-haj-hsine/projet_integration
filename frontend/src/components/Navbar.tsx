
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import api from '../api/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setName(null);
        setRole(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                {/* Left Section */}
                <div className="navbar-left" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}>
                        TripShare
                    </Link>
                    {
                        token && role === 'driver' && (
                            <>
                                <Link to="/publish-trip" className={window.location.pathname === '/publish-trip' ? 'active' : ''}>
                                    Publish Trip
                                </Link>
                                <Link to="/my-trips" className={window.location.pathname === '/my-trips' ? 'active' : ''}>
                                    My Trips
                                </Link>
                            </>
                        )}

                </div>

                {/* Right Section */}
                <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {token ? (
                        <>
                            <div className="dropdown" style={{ position: 'relative' }}>
                                <button
                                    className="dropdown-toggle"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {name ? name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span>{name || 'User'}</span>
                                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="dropdown-menu" style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        padding: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        minWidth: '150px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        zIndex: 1000
                                    }}>
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                        <Link to="/reservations" onClick={() => setDropdownOpen(false)}>My Reservations</Link>
                                        <Link to="/chats" onClick={() => setDropdownOpen(false)}>Messages</Link>
                                        <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn" style={{ color: 'white', textDecoration: 'none', backgroundColor: 'var(--primary-color)', padding: '6px 12px', borderRadius: '4px' }}>Register</Link>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <label className="theme-switch" title="Toggle theme" style={{ marginLeft: '1rem' }}>
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </nav>
    );
}
