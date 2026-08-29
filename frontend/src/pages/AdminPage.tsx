import { useState } from 'react';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { MaterialIcon } from '../components/ui/MaterialIcon';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  organization: string;
  status: 'active' | 'suspended';
  lastActive: string;
}

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr_001',
    name: 'Bharath (Lead Admin)',
    email: 'admin@intentguard.sec',
    role: 'admin',
    organization: 'CTI Core Operations',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'usr_002',
    name: 'Sarah Chen',
    email: 'sarah.c@fintech.sec',
    role: 'user',
    organization: 'Financial Fraud Intel Unit',
    status: 'active',
    lastActive: '12 mins ago',
  },
  {
    id: 'usr_003',
    name: 'Alex Rivera',
    email: 'arivera@threatlab.io',
    role: 'user',
    organization: 'Mobile Malware Forensics',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: 'usr_004',
    name: 'Devon Vance',
    email: 'dvance@untrusted.net',
    role: 'user',
    organization: 'External Audit',
    status: 'suspended',
    lastActive: '3 days ago',
  },
];

const AUDIT_LOGS = [
  { id: 'log_1', time: '14:52:10', event: 'User Login', user: 'admin@intentguard.sec', role: 'admin', ip: '192.168.1.10', severity: 'info' },
  { id: 'log_2', time: '14:48:32', event: 'Scan Initiated', user: 'sarah.c@fintech.sec', role: 'user', ip: '192.168.1.45', severity: 'info' },
  { id: 'log_3', time: '14:15:00', event: 'Threshold Policy Updated', user: 'admin@intentguard.sec', role: 'admin', ip: '192.168.1.10', severity: 'warning' },
  { id: 'log_4', time: '12:30:15', event: 'User Suspended (dvance)', user: 'admin@intentguard.sec', role: 'admin', ip: '192.168.1.10', severity: 'critical' },
  { id: 'log_5', time: '09:10:44', event: '2FA Method Registered', user: 'arivera@threatlab.io', role: 'user', ip: '172.16.0.22', severity: 'info' },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'policy'>('users');
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' as 'user' | 'admin', organization: '' });

  // Threshold Policy State
  const [thresholds, setThresholds] = useState({
    critical: 80,
    high: 60,
    review: 40,
    rateLimit: 100,
  });

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const handleRoleChange = (id: string, newRole: 'admin' | 'user') => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created: SystemUser = {
      id: `usr_${Date.now().toString().slice(-3)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization || 'General Analyst',
      status: 'active',
      lastActive: 'Just registered',
    };
    setUsers([...users, created]);
    setNewUser({ name: '', email: '', role: 'user', organization: '' });
    setShowAddUserModal(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AppLayout>
      <TopBar
        title="Admin Management Portal"
        subtitle="User access control, system audit trail, and global security policies"
      />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Admin Navigation Tabs */}
        <div className="glass-panel p-2 flex gap-2 border-white/10 overflow-x-auto font-heading text-xs font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MaterialIcon name="account_circle" className="text-base" />
            User & Role Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MaterialIcon name="terminal" className="text-base" />
            System Audit & Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'policy'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MaterialIcon name="shield_lock" className="text-base" />
            Global Threat Policy & Thresholds
          </button>
        </div>

        {/* Tab 1: User & Role Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-white/10 font-mono text-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#07090E] border border-white/10 rounded-xl py-2 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-64"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      roleFilter === 'all' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-[#07090E] border-white/10 text-slate-400'
                    }`}
                  >
                    All Roles
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      roleFilter === 'admin' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-[#07090E] border-white/10 text-slate-400'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setRoleFilter('user')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      roleFilter === 'user' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-[#07090E] border-white/10 text-slate-400'
                    }`}
                  >
                    Users
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary text-xs px-4 py-2.5 w-full md:w-auto flex items-center justify-center gap-1.5"
              >
                <MaterialIcon name="add" className="text-base" />
                Add New User
              </button>
            </div>

            {/* Users Table */}
            <div className="glass-panel overflow-hidden border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#07090E] border-b border-white/10 text-slate-400 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Organization</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Active</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <span className="font-heading font-bold text-white block">{user.name}</span>
                            <span className="text-slate-400 text-[11px]">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            className="bg-[#07090E] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-bold focus:outline-none"
                          >
                            <option value="user">User / Analyst</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-400">{user.organization}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              user.status === 'active'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{user.lastActive}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                              user.status === 'active'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Audit Logs */}
        {activeTab === 'audit' && (
          <div className="glass-panel p-6 space-y-4 border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <MaterialIcon name="terminal" className="text-amber-500 text-xl" />
                Real-Time System Audit Trail
              </h3>
              <span className="font-mono text-xs text-slate-400">Showing last 5 security events</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {AUDIT_LOGS.map((log) => (
                <div key={log.id} className="p-3.5 bg-[#07090E] rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-bold">{log.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                        log.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {log.severity}
                    </span>
                    <span className="text-white font-bold">{log.event}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-xs">
                    <span>User: <strong className="text-slate-200">{log.user}</strong> ({log.role})</span>
                    <span>IP: <code className="text-amber-400">{log.ip}</code></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Global Threat Policy & Thresholds */}
        {activeTab === 'policy' && (
          <div className="glass-panel p-6 space-y-6 border-white/10">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <MaterialIcon name="shield_lock" className="text-amber-500 text-xl" />
                Global CTI Risk Thresholds & Rate Limits
              </h3>
              <p className="font-mono text-xs text-slate-400">Admin controls for global risk classification boundaries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="bg-[#07090E] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-bold">Critical Risk Threshold</span>
                  <span className="text-white font-bold">{thresholds.critical} / 100</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={thresholds.critical}
                  onChange={(e) => setThresholds({ ...thresholds, critical: parseInt(e.target.value, 10) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
                <p className="text-slate-400 text-[11px]">Scores above this boundary are tagged as Critical Threat.</p>
              </div>

              <div className="bg-[#07090E] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 font-bold">High Risk Threshold</span>
                  <span className="text-white font-bold">{thresholds.high} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="70"
                  value={thresholds.high}
                  onChange={(e) => setThresholds({ ...thresholds, high: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-slate-400 text-[11px]">Scores above this boundary are tagged as High Risk.</p>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel p-6 max-w-md w-full border-white/10 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-heading text-base font-bold text-white">Add New Platform User</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                  <MaterialIcon name="close" className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    placeholder="jdoe@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Account Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-amber-400 font-bold focus:outline-none"
                  >
                    <option value="user">User / Analyst</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Organization / Dept:</label>
                  <input
                    type="text"
                    placeholder="SOC Operations"
                    value={newUser.organization}
                    onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                    className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs px-5 py-2"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
