'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI, adminAPI } from '@/lib/api';
import { DashboardShell } from '../page';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [uploading, setUploading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const setPw = (k) => (e) => setPwForm(f => ({ ...f, [k]: e.target.value }));

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const { url } = await adminAPI.uploadImage(fd);
            await authAPI.updateProfile({ ...form, avatar: url });
            updateUser({ avatar: url });
            toast.success('Avatar updated!');
        } catch (err) { toast.error(err.message); }
        finally { setUploading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await authAPI.updateProfile(form);
            updateUser(updated);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
        setSavingPw(true);
        try {
            await authAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
            toast.success('Password changed!');
            setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
        } catch (err) { toast.error(err.message); }
        finally { setSavingPw(false); }
    };

    return (
        <DashboardShell>
            <div style={{ maxWidth: 640 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6 }}>Profile Settings</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your account information</p>
                </div>

                {/* Avatar */}
                <div className="glass" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--gold)', flexShrink: 0, position: 'relative' }}>
                        {user?.avatar
                            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: '#0D0800' }}>{user?.name?.charAt(0)}</div>
                        }
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>{user?.email}</p>
                        <label style={{ cursor: 'pointer' }}>
                            <span className="btn btn-ghost btn-sm">{uploading ? 'Uploading…' : '📷 Change Avatar'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploading} />
                        </label>
                    </div>
                </div>

                {/* Profile form */}
                <div className="glass" style={{ padding: 28, marginBottom: 24, borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20 }}>Personal Information</h2>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" value={form.name} onChange={set('name')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea className="form-input" rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself…" style={{ resize: 'vertical' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', minWidth: 160 }}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Password form */}
                <div className="glass" style={{ padding: 28, borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20 }}>Change Password</h2>
                    <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input className="form-input" type="password" value={pwForm.oldPassword} onChange={setPw('oldPassword')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input className="form-input" type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input className="form-input" type="password" value={pwForm.confirm} onChange={setPw('confirm')} required />
                        </div>
                        <button type="submit" className="btn btn-outline" disabled={savingPw} style={{ alignSelf: 'flex-start', minWidth: 180 }}>
                            {savingPw ? 'Updating…' : '🔒 Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardShell>
    );
}
