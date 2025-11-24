
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

type Contact = {
    contact_id: number;
    name: string;
    email: string;
    phone: string | null;
};

export default function ChatList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/chats/contacts')
            .then(res => setContacts(res.data))
            .catch(err => alert(err.response?.data?.error ?? 'Failed to load contacts'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 600, margin: '20px auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16 }}>
            <h2 style={{ marginBottom: 12 }}>Chat Contacts</h2>
            {contacts.length === 0 ? (
                <p>No contacts. You can chat with drivers/passengers once there is a reservation.</p>
            ) : (
                <ul style={{ listStyle: 'none' }}>
                    {contacts.map(c => (
                        <li key={c.contact_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{c.name}</strong><br />
                                    <small>{c.email} {c.phone ? `• ${c.phone}` : ''}</small>
                                </div>
                                <Link to={`/chats/${c.contact_id}`}>
                                    <button>Open Chat</button>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
