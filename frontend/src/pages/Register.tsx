
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
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('role', form.role);

            if (form.role === 'driver') {
                if (profilePhoto) formData.append('profile_photo', profilePhoto);
                if (licenseDoc) formData.append('license_document', licenseDoc);
            }

            const res = await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.role === 'driver' && !res.data.is_verified) {
                alert('Registration successful! Your account is pending verification by an admin.');
                navigate('/login');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role
                }));
                navigate('/');
            }
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

                    {form.role === 'driver' && (
                        <>
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Driver Verification</label>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.875rem' }}>Profile Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setProfilePhoto(e.target.files ? e.target.files[0] : null)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem' }}>Driver License</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setLicenseDoc(e.target.files ? e.target.files[0] : null)}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" style={{ marginTop: '1rem' }}>Register</button>
                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
