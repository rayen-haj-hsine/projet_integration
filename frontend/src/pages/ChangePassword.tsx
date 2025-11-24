
import { useState } from 'react';
import api from '../api/axios';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            alert('Please fill in both fields.');
            return;
        }
        setSaving(true);
        try {
            const res = await api.put('/auth/me/password', { currentPassword, newPassword });
            alert(res.data?.message ?? 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 400 }}>
            <h2>Change Password</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '8px' }}>
                <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
