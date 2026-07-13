import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profile.service';
import { useAuthStore } from '../store/useAuthStore';
import { User, Lock, Mail, Shield, CheckCircle2, Edit3, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Role pill
function RolePill({ role }) {
  const styles = {
    ADMIN:     'bg-error-container     text-on-error-container',
    AUTHORITY: 'bg-tertiary-container  text-on-tertiary-container',
    PUBLIC:    'bg-surface-variant     text-outline',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${styles[role] || styles.PUBLIC}`}>
      <Shield size={13} />
      {role}
    </span>
  );
}

// Section card wrapper
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface rounded-2xl border border-surface-variant shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-variant">
        <div className="p-2 bg-primary-container rounded-lg">
          <Icon size={18} className="text-on-primary-container" />
        </div>
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-on-surface mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pr-10 pl-4 py-2.5 bg-surface-container-low border border-surface-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setToken, token } = useAuthStore();

  // Profile data from API
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit form
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingProfile(true);
      try {
        const res = await profileService.getProfile();
        setProfile(res.data);
        setEditName(res.data.name || '');
        setEditEmail(res.data.email || '');
      } catch {
        // Fallback to JWT-decoded user
        if (user) {
          setProfile(user);
          setEditName(user.name || '');
          setEditEmail(user.email || '');
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updates = {};
      if (editName.trim()  && editName  !== profile?.name)  updates.name  = editName.trim();
      if (editEmail.trim() && editEmail !== profile?.email) updates.email = editEmail.trim();

      if (Object.keys(updates).length === 0) {
        toast('No changes to save.', { icon: 'ℹ️' });
        setEditing(false);
        return;
      }
      const res = await profileService.updateProfile(updates);
      setProfile(prev => ({ ...prev, ...res.data }));
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await profileService.changePassword({ current_password: currentPw, new_password: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to change password.';
      toast.error(msg);
    } finally {
      setSavingPw(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const displayProfile = profile || user || {};

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-container rounded-xl">
          <User size={24} className="text-on-primary-container" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-on-surface">My Profile</h1>
          <p className="text-sm text-outline">Manage your account details and security</p>
        </div>
      </div>

      {/* ── Section 1: Profile Info ── */}
      <Section title="Account Information" icon={User}>
        {!editing ? (
          <div className="space-y-5">
            {/* Avatar block */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-2xl font-black text-on-primary-container select-none">
                {(displayProfile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">{displayProfile.name || '—'}</p>
                <p className="text-sm text-outline">{displayProfile.email || '—'}</p>
                <div className="mt-1">
                  <RolePill role={displayProfile.role} />
                </div>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-xs text-outline mb-1">Full Name</p>
                <p className="font-semibold text-on-surface">{displayProfile.name || '—'}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-xs text-outline mb-1">Email Address</p>
                <p className="font-semibold text-on-surface">{displayProfile.email || '—'}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-xs text-outline mb-1">Role</p>
                <RolePill role={displayProfile.role} />
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-xs text-outline mb-1">Account Status</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-heatwave-normal" />
                  <span className="font-semibold text-heatwave-normal">
                    {displayProfile.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {displayProfile.created_at && (
                <div className="bg-surface-container-low rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-outline mb-1">Member Since</p>
                  <p className="font-semibold text-on-surface">
                    {new Date(displayProfile.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Edit3 size={15} />
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                <span className="flex items-center gap-1.5"><Mail size={13} />Email Address</span>
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition text-sm"
              >
                {savingProfile ? <LoadingSpinner /> : <CheckCircle2 size={15} />}
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditName(displayProfile.name || '');
                  setEditEmail(displayProfile.email || '');
                }}
                className="px-5 py-2.5 bg-surface-variant text-outline font-bold rounded-xl hover:bg-surface-container-high transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* ── Section 2: Change Password ── */}
      <Section title="Security — Change Password" icon={Lock}>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <PasswordField
            id="currentPw"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter your current password"
          />
          <PasswordField
            id="newPw"
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            placeholder="At least 8 characters"
          />
          <PasswordField
            id="confirmPw"
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="Re-enter new password"
          />

          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-xs text-error font-medium">Passwords do not match.</p>
          )}

          <button
            type="submit"
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition text-sm mt-2"
          >
            {savingPw ? <LoadingSpinner /> : <Lock size={15} />}
            {savingPw ? 'Updating…' : 'Change Password'}
          </button>
        </form>
      </Section>

      {/* ── Section 3: Account metadata ── */}
      <Section title="Account Details" icon={Shield}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-xs text-outline mb-1">User ID</p>
            <p className="font-mono font-semibold text-on-surface text-xs">{displayProfile.id || '—'}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-xs text-outline mb-1">Access Role</p>
            <RolePill role={displayProfile.role} />
          </div>
          {displayProfile.updated_at && (
            <div className="bg-surface-container-low rounded-xl p-4 col-span-2">
              <p className="text-xs text-outline mb-1">Last Updated</p>
              <p className="font-semibold text-on-surface">
                {new Date(displayProfile.updated_at).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
