import { useState } from 'react';
import { api } from '../../axios/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function ChangePasswordModal({ onClose }) {
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return toast.error('Both fields required');
    setLoading(true);
    try {
      await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed');
      onClose?.();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed';
      // if token invalid/expired, logout to force re-login
      if (err?.response?.status === 401) {
        logout();
      }
      toast.error(message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white p-6 rounded shadow" onClick={(e)=> e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-3">Change Password</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Old Password</label>
            <input type="password" className="border p-2 rounded w-72" value={oldPassword} onChange={(e)=> setOldPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input type="password" className="border p-2 rounded w-72" value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white" disabled={loading}>{loading? 'Saving...' : 'Change'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
