import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { User } from '../../types';

interface UserSecurityProps {
  user: User | Omit<User, 'id'>;
  isNewUser: boolean;
  onFieldChange: (field: keyof User, value: any) => void;
  onUpdateUser: (update: Partial<User> & { id: string }) => void;
}

export const UserSecurity: React.FC<UserSecurityProps> = ({ user, isNewUser, onFieldChange, onUpdateUser }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordReset = () => {
    setResetMessage(null);
    if (!('id' in user)) return;
    if (!newPassword) {
      setResetMessage({ type: 'error', text: 'Password cannot be empty.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    onUpdateUser({ id: user.id, password: newPassword });
    setNewPassword('');
    setConfirmNewPassword('');
    setResetMessage({ type: 'success', text: 'Password has been reset.' });
  };

  return (
    <>
      <Card title="Status & Security">
        <div className="space-y-6">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input 
                id="isActive" 
                name="isActive" 
                type="checkbox" 
                checked={user.isActive} 
                onChange={(e) => onFieldChange('isActive', e.target.checked)} 
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-600 dark:bg-slate-800 dark:checked:bg-primary-500" 
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="isActive" className="font-medium text-slate-900 dark:text-slate-100">User is Active</label>
              <p className="text-slate-500 dark:text-slate-400">Inactive users cannot log in.</p>
            </div>
          </div>
          {isNewUser && (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input type="password" name="password" id="password" value={user.password} onChange={(e) => onFieldChange('password', e.target.value)} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md" />
              </div>
            </div>
          )}
        </div>
      </Card>
      {!isNewUser && (
        <Card title="Reset User Password">
          <div className="space-y-4">
            {resetMessage && (
              <div className={`p-3 rounded-md text-sm ${resetMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                {resetMessage.text}
              </div>
            )}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md" />
            </div>
            <div>
              <label htmlFor="confirmNewPasswordAdmin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input type="password" id="confirmNewPasswordAdmin" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md" />
            </div>
            <button onClick={handlePasswordReset} className="w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm">
              Reset Password
            </button>
          </div>
        </Card>
      )}
    </>
  );
};