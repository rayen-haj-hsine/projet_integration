
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
};

export default function Chat() {
    const { userId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const my = JSON.parse(localStorage.getItem('user') || '{}');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Load conversation
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await api.get(`/chats/${userId}`);
                if (mounted) setMessages(res.data);
            } catch (err: any) {
                alert(err.response?.data?.error ?? 'Failed to load chat');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        // Optional: poll every 5 seconds (simple approach; replace with websockets later)
        const timer = setInterval(load, 5000);
        return () => { mounted = false; clearInterval(timer); };
    }, [userId]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        try {
            const res = await api.post('/chats', { receiver_id: parseInt(userId!, 10), message: text });
            setMessages(prev => [...prev, res.data]);
            setText('');
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Failed to send message');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 700, margin: '20px auto' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                <div ref={scrollRef} style={{ height: 420, overflowY: 'auto', padding: 16 }}>
                    {messages.length === 0 ? (
                        <p>No messages yet. Say hello 👋</p>
                    ) : messages.map(m => {
                        const isMine = m.sender_id === my?.id;
                        return (
                            <div key={m.id} style={{
                                display: 'flex',
                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                                margin: '8px 0'
                            }}>
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '8px 12px',
                                    borderRadius: 12,
                                    background: isMine ? 'var(--primary-color)' : 'var(--dropdown-bg)',
                                    color: isMine ? 'var(--button-text)' : 'var(--text-color)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                }}>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                                    <div style={{ textAlign: 'right', marginTop: 4 }}>
                                        <small>{new Date(m.created_at).toLocaleString()}</small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', padding: 12, display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}
