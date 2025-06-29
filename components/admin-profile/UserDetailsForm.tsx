import React from 'react';
import { Card } from '../ui/Card';
import { User } from '../../types';

interface UserDetailsFormProps {
  user: User | Omit<User, 'id'>;
  onFieldChange: (field: keyof User, value: any) => void;
}

export const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ user, onFieldChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(e.target.name as keyof User, e.target.value);
  };

  return (
    <Card title="User Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
          <input type="text" name="firstName" id="firstName" value={user.firstName} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
          <input type="text" name="lastName" id="lastName" value={user.lastName} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md" />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
          <input type="text" name="username" id="username" value={user.username} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <input type="email" name="email" id="email" value={user.email} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md" />
        </div>
      </div>
    </Card>
  );
};