'use client';

import { useState, useEffect, useRef } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Send, User, MessageSquare } from 'lucide-react';

export default function ChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch potential chat partners
    useEffect(() => {
        fetchUsers();
    }, []);

    // Poll for new messages when a user is selected
    useEffect(() => {
        let interval;
        if (selectedUser) {
            fetchMessages(selectedUser.user_id);
            interval = setInterval(() => {
                fetchMessages(selectedUser.user_id);
            }, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [selectedUser]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users?type=chat');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await fetch(`/api/messages?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedUser.user_id,
                    content: newMessage
                }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedUser.user_id);
            }
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <LayoutWrapper>
            <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px' }}>
                {/* Users List */}
                <div style={{ width: '300px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>Chats</h2>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {users.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: selectedUser?._id === user._id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} color="#fff" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500' }}>{user.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>{user.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <h3 style={{ margin: 0 }}>{selectedUser.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{selectedUser.user_id}</span>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        style={{
                                            alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            background: msg.isMe ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            borderBottomRightRadius: msg.isMe ? '4px' : '12px',
                                            borderBottomLeftRadius: msg.isMe ? '12px' : '4px',
                                        }}
                                    >
                                        <p style={{ margin: 0, lineHeight: '1.4' }}>{msg.content}</p>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px', display: 'block', textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#3b82f6',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        opacity: newMessage.trim() ? 1 : 0.5
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
                            <MessageSquare size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                            <p>Select a user to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </LayoutWrapper>
    );
}
