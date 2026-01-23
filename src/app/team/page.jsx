'use client';

import Image from 'next/image';
import LayoutWrapper from '@/components/LayoutWrapper';
import HighlightText from '@/components/HighlightText';
import { useSearch } from '@/context/SearchContext';
import styles from './Team.module.css';
import { Trash2, UserPlus, X } from 'lucide-react';

export default function TeamPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newEmployeeId, setNewEmployeeId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { searchTerm } = useSearch();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, employeeId: newEmployeeId, password: newPassword }),
            });

            if (res.ok) {
                setNewName('');
                setNewEmployeeId('');
                setNewPassword('');
                setIsModalOpen(false);
                fetchEmployees();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create employee');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEmployees(employees.filter(emp => emp._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        searchTerm === '' ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutWrapper>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.heading}>Team Members</h1>
                    <button
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <UserPlus size={20} />
                        Add Member
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : filteredEmployees.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No team members found.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredEmployees.map((emp) => (
                            <div className={styles.card} key={emp._id}>
                                <div className={styles.cardHeader}>
                                    {/* Optional: Add status dot or 3-dots menu here */}
                                </div>
                                <div className={styles.avatarWrapper}>
                                    <Image
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff`}
                                        alt={emp.name}
                                        className={styles.avatar}
                                        width={80}
                                        height={80}
                                    />
                                </div>
                                <h3 className={styles.name}>
                                    <HighlightText text={emp.name} highlight={searchTerm} />
                                </h3>
                                <span className={styles.role}>Team Member</span>

                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>ID</span>
                                        <span className={styles.infoValue}>
                                            <HighlightText text={emp.employeeId} highlight={searchTerm} />
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Status</span>
                                        <span className={styles.infoValue} style={{ color: '#22c55e' }}>Active</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(emp._id)}
                                    >
                                        <Trash2 size={16} />
                                        Remove Member
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}>
                        <div className={styles.modal}>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                            <h2 className={styles.modalTitle}>Add New Member</h2>
                            <form onSubmit={handleCreate} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="John Doe"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Employee ID</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="EMP001"
                                        value={newEmployeeId}
                                        onChange={(e) => setNewEmployeeId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Default Password</label>
                                    <input
                                        type="text" /* Keeping as text for visibility during creation, or change to password */
                                        className="input-field"
                                        placeholder="******"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Member'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LayoutWrapper>
    );
}
