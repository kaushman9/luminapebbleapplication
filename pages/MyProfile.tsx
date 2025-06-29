import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { User } from '../types';
import { Icon } from '../components/ui/Icons';

interface MyProfileProps {
  currentUser: User;
  onUpdateUser: (update: Partial<User> & { id: string }, oldPassword?: string) => void;
}

const PasswordInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, value, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <Icon name="eye-slash" className="h-5 w-5" /> : <Icon name="eye" className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

const MyProfile: React.FC<MyProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (!newPassword || !currentPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    try {
      onUpdateUser({ id: currentUser.id, password: newPassword }, currentPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    }
  };
  
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        My Profile
      </h1>

      <Card title="Personal Information">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">{fullName}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Username</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">@{currentUser.username}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email address</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">{currentUser.email}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
              {message.text}
            </div>
          )}
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordInput
            id="confirmNewPassword"
            label="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Update Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MyProfile;