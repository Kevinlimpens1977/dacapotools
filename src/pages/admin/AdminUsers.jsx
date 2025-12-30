/**
 * AdminUsers Page
 * 
 * User management page for the admin dashboard.
 * Shows all users with roles, credits, and usage.
 * Role-aware: role editing only for supervisors.
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/roles';

export default function AdminUsers() {
    const { isSupervisor, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [savingRole, setSavingRole] = useState(false);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const usersRef = collection(db, 'users');
                const snapshot = await getDocs(usersRef);

                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by email
                usersData.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Update user role
    const handleRoleChange = async (userId, newRole) => {
        try {
            setSavingRole(true);
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));

            setEditingRole(null);
        } catch (error) {
            console.error('Error updating role:', error);
        } finally {
            setSavingRole(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case ROLES.SUPERVISOR:
                return {
                    label: 'Supervisor',
                    class: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                };
            case ROLES.ADMIN:
                return {
                    label: 'Admin',
                    class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                };
            default:
                return {
                    label: 'Gebruiker',
                    class: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                    sync
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Gebruikers</h2>
                <p className="text-secondary mt-1">
                    Beheer alle gebruikers en hun rollen
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">group</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{users.length}</p>
                            <p className="text-sm text-secondary">Totaal Gebruikers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">shield_person</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {users.filter(u => u.role === ROLES.SUPERVISOR || u.role === ROLES.ADMIN).length}
                            </p>
                            <p className="text-sm text-secondary">Beheerders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {users.filter(u => {
                                    if (!u.lastLogin) return false;
                                    const lastLogin = u.lastLogin.toDate?.() || new Date(u.lastLogin);
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return lastLogin > weekAgo;
                                }).length}
                            </p>
                            <p className="text-sm text-secondary">Actief (7 dagen)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-xl border border-theme overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-theme">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Gebruiker</th>
                            <th className="text-left px-4 py-3 font-semibold">Rol</th>
                            <th className="text-left px-4 py-3 font-semibold">Laatste Login</th>
                            <th className="text-left px-4 py-3 font-semibold">Aangemaakt</th>
                            {isSupervisor && (
                                <th className="text-right px-4 py-3 font-semibold">Acties</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={isSupervisor ? 5 : 4} className="px-4 py-12 text-center text-secondary">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">group</span>
                                    <p>Geen gebruikers gevonden</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const roleBadge = getRoleBadge(user.role);
                                const isCurrentUser = user.id === currentUser?.uid;

                                return (
                                    <tr key={user.id} className="border-b border-theme last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-[#2860E0] flex items-center justify-center text-white font-medium shrink-0">
                                                    {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium flex items-center gap-2">
                                                        {user.displayName || 'Onbekend'}
                                                        {isCurrentUser && (
                                                            <span className="text-xs text-secondary">(jij)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-secondary">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingRole === user.id ? (
                                                <select
                                                    value={user.role || ROLES.USER}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={savingRole}
                                                    className="px-3 py-1.5 rounded-lg border border-theme bg-white dark:bg-gray-800 text-sm"
                                                >
                                                    <option value={ROLES.USER}>Gebruiker</option>
                                                    <option value={ROLES.ADMIN}>Admin</option>
                                                    <option value={ROLES.SUPERVISOR}>Supervisor</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.class}`}>
                                                    {roleBadge.label}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {user.lastLogin
                                                ? new Date(user.lastLogin.toDate?.() || user.lastLogin).toLocaleDateString('nl-NL', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {user.createdAt
                                                ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString('nl-NL', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </td>
                                        {isSupervisor && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {editingRole === user.id ? (
                                                        <button
                                                            onClick={() => setEditingRole(null)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            title="Annuleren"
                                                        >
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingRole(user.id)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            title="Rol wijzigen"
                                                            disabled={isCurrentUser}
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info for admins */}
            {!isSupervisor && (
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">info</span>
                    <p className="text-sm">
                        Als admin heb je alleen-lezen toegang. Neem contact op met een supervisor voor het wijzigen van gebruikersrollen.
                    </p>
                </div>
            )}
        </div>
    );
}
