
import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    role: 'driver' | 'passenger';
}

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', role: 'passenger' });
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role
            }));
            navigate('/');
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>
                <form onSubmit={handleRegister} className="auth-form">
                    <div>
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Choose a strong password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>I am a...</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'driver' | 'passenger' })}>
                            <option value="passenger">Passenger (I want to book rides)</option>
                            <option value="driver">Driver (I want to publish rides)</option>
                        </select>
                    </div>
                    <button type="submit" style={{ marginTop: '0.5rem' }}>Register</button>
                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
