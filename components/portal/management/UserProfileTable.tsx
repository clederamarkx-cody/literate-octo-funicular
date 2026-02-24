import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../../types';
import { getAllUserProfiles, logAction } from '../../../services/dbService';
import {
    Users,
    Search,
    Filter,
    Shield,
    UserCheck,
    UserX,
    Loader2,
    Mail,
    MapPin,
    Clock,
    MoreVertical
} from 'lucide-react';

export const UserProfileTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const profiles = await getAllUserProfiles();
            setUsers(profiles);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: UserRole) => {
        const styles = {
            admin: 'bg-purple-50 text-purple-600 border-purple-100',
            scd_team_leader: 'bg-blue-50 text-blue-600 border-blue-100',
            reu: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            evaluator: 'bg-amber-50 text-amber-600 border-amber-100',
            nominee: 'bg-gray-50 text-gray-600 border-gray-100'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-[14.5px] font-semibold uppercase border ${styles[role]}`}>
                {role.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider flex items-center gap-2">
                        <Users className="text-gkk-gold" size={24} />
                        Staff Profile Directory
                    </h3>
                    <p className="text-[14.5px] text-gray-400 font-semibold mt-2 px-1">
                        Manage all registered staff accounts and permissions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gkk-gold transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold transition-all font-semibold text-[14.5px] w-full sm:w-64 shadow-sm"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold transition-all font-semibold text-[14.5px] shadow-sm appearance-none min-w-[140px]"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="scd_team_leader">SCD Team Lead</option>
                        <option value="reu">REU Personnel</option>
                        <option value="evaluator">Evaluator</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Team Member</th>
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Credentials</th>
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Assignment</th>
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                            <th className="px-8 py-5 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-gkk-gold" size={32} />
                                        <p className="text-[14.5px] font-semibold text-gray-400 uppercase">Synchronizing Directory...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-gray-400 font-semibold uppercase text-[14.5px]">
                                    No staff profiles match your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.userId} className="group hover:bg-gray-50/50 transition-all cursor-default">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gkk-navy/5 text-gkk-navy rounded-xl flex items-center justify-center font-black border border-gkk-navy/10 group-hover:bg-gkk-navy group-hover:text-white transition-all shadow-sm">
                                                {(user.name || user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gkk-navy text-[14.5px] uppercase leading-none group-hover:translate-x-1 transition-transform">
                                                    {user.name || 'Anonymous User'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[14.5px] font-medium text-gray-400">ID: {user.userId.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[14.5px] font-semibold text-gray-600">
                                                <Mail size={12} className="text-gray-300" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-gkk-gold" />
                                            <span className="text-[14.5px] font-semibold text-gray-500 uppercase">
                                                {user.region || 'National HQ'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getRoleBadge(user.role as UserRole)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`} />
                                            <span className="text-[14.5px] font-semibold text-gray-500 uppercase">
                                                {user.status || 'Active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-gray-400 uppercase">
                                                <Clock size={10} />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center">
                <p className="text-[14.5px] font-semibold text-gray-400 uppercase">
                    Showing {filteredUsers.length} of {users.length} registered personnel
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[14.5px] font-semibold text-gray-500 hover:text-gkk-navy hover:border-gkk-navy transition-all uppercase shadow-sm"
                    >
                        Force Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};
