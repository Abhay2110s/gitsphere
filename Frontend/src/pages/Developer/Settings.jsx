import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users.api';
import PageHeader from '../../components/developer/PageHeader';
import { CheckIcon } from '../../components/common/Icons';

export default function Settings({ onLogout }) {
  const { user, loading, refetch, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'account' | 'security'
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setGithubUsername(user.githubUsername || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await usersApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        githubUsername: githubUsername.trim(),
      });
      await refetch();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'D';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Developer Settings"
        description="Manage your contributor credentials, profile information, and account security preferences."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'account'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Account Preferences
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Security & Session
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckIcon className="w-4 h-4" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#1A1A1A]">
            <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-xl font-black text-white shrink-0">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {user?.name || 'Developer'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white uppercase font-bold">
                  {user?.role || 'DEVELOPER'}
                </span>
              </div>
              <p className="text-xs font-mono text-[#888888] mt-0.5">
                {user?.email || 'authenticated user'}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-mono text-[#888888] uppercase block mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#888888] uppercase block mb-1.5">
                Email Address (read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="w-full bg-[#101010] border border-[#222222] rounded-xl px-3.5 py-2 text-xs text-[#666666] cursor-not-allowed outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#888888] uppercase block mb-1.5">
                Bio / Specialties
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Full-stack engineer, React + Node.js specialist..."
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#888888] uppercase block mb-1.5">
                GitHub Handle
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-[#1A1A1A]">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Account Preferences */}
      {activeTab === 'account' && (
        <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-4 border-b border-[#1A1A1A]">
            CONTRIBUTOR CONFIGURATION
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div>
                <div className="font-bold text-white">Default Code Editor Theme</div>
                <div className="text-[11px] text-[#666666] mt-0.5">Monaco VS Dark (High Contrast)</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div>
                <div className="font-bold text-white">Auto-Save Task Files</div>
                <div className="text-[11px] text-[#666666] mt-0.5">Prompt on unsaved changes before switching files</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white">
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Session */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-4 border-b border-[#1A1A1A]">
            SECURITY & ACTIVE SESSIONS
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Authentication State</div>
                <div className="text-[11px] font-mono text-[#666666] mt-0.5">
                  Authenticated session via JWT HTTP-only cookie
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#333333] text-white">
                Protected
              </span>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Sign Out</div>
                <div className="text-[11px] text-[#666666]">End current developer session</div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 rounded-xl border border-red-900/50 hover:bg-red-950/30 text-xs font-bold text-red-400 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
