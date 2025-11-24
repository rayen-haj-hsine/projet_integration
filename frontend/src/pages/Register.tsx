
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
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '8px', maxWidth: 400 }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'driver' | 'passenger' })}>
                    <option value="driver">Driver</option>
                    <option value="passenger">Passenger</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
