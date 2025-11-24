
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import api from '../api/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');
    const [name, setName] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed?.name) setName(parsed.name);
                } catch { }
            }
            if (!name) {
                api.get('/auth/me').then(res => {
                    setName(res.data.name);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }).catch(() => { });
            }
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setName(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                <div className="navbar-left">
                    <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}>
                        TripShare
                    </Link>
                    {token && (
                        <Link to="/" className={window.location.pathname === '/' ? 'active' : ''}>Find a Ride</Link>
                    )}
                </div>

                <div className="navbar-right">
                    {token ? (
                        <>
                            <div className="dropdown">
                                <button
                                    className="dropdown-toggle"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {name ? name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span>{name || 'User'}</span>
                                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                        <Link to="/reservations" onClick={() => setDropdownOpen(false)}>My Reservations</Link>
                                        <Link to="/chats" onClick={() => setDropdownOpen(false)}>Messages</Link>
                                        <button onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
                        </div>
                    )}

                    <label className="theme-switch" title="Toggle theme" style={{ marginLeft: '1rem' }}>
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </nav>
    );
}
