import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Settings({ user: propUser }) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [workspaceName, setWorkspaceName] = useState('Primary Workspace');
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setBio(user?.bio || '');
  }

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gitsphere_user');
        const parsed = stored ? JSON.parse(stored) : {};
        const updated = {
          ...parsed,
          name: fullName || parsed.name,
          email: email || parsed.email,
          bio: bio,
        };
        localStorage.setItem('gitsphere_user', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-[#1F1F1F]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          SETTINGS
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#888888]">
          Manage your personal manager profile, organization credentials, and workspace preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl border border-white/20 bg-[#141414] text-white text-xs font-mono font-bold flex items-center justify-between">
          <span>✓ Settings saved successfully.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-5">
          <div className="pb-4 border-b border-[#1A1A1A]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Profile Information
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Personal identity and contact details
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell your team about your role and responsibilities..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Workspace Section */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-5">
          <div className="pb-4 border-b border-[#1A1A1A]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Workspace Profile
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Organization and repository team domain
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Engineering"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
