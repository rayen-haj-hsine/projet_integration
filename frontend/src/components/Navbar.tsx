
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
            {token ? (
                <>
                    <div className="navbar-left">
                        <Link to="/">Trips</Link>
                    </div>
                    <div className="navbar-right">
                        <div className="dropdown">
                            <button
                                className="dropdown-toggle"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                Hello, {name || 'User'} ▼
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                    <Link to="/reservations" onClick={() => setDropdownOpen(false)}>My Reservations</Link>
                                    <Link to="/chats" onClick={() => setDropdownOpen(false)}>Chat</Link>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                        <label className="theme-switch" title="Toggle theme">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </>
            ) : (
                <>
                    <div className="navbar-left">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                    <div className="navbar-right">
                        <label className="theme-switch" title="Toggle theme">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </>
            )}
        </nav>
    );
}
