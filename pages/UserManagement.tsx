import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icons';
import { User, SortConfig, UserCertification } from '../types';

interface UserRowProps {
  user: User;
  onEdit: (userId: string) => void;
  certCount: number;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit, certCount }) => {
  const assets = user.assignments.map(a => a.assetName).join(', ');
  
  return (
    <tr className="border-b border-slate-200/80 dark:border-slate-800/50 last:border-b-0 hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
      <td className="p-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">{user.lastName}</td>
      <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{user.firstName}</td>
      <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{user.username}</td>
      <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
      <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
        {user.isActive ? 'Active' : 'Inactive'}
      </td>
      <td className="p-3 text-sm text-slate-600 dark:text-slate-300 max-w-sm truncate" title={assets || 'No assignments'}>{assets || 'No assignments'}</td>
      <td className="p-3 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-300">{certCount}</td>
      <td className="p-3 whitespace-nowrap text-right">
        <button
          onClick={() => onEdit(user.id)}
          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-primary-400 rounded"
          title={`Edit ${user.firstName} ${user.lastName}`}
        >
          <Icon name="pencil" className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

interface UserManagementProps {
  users: User[];
  onNavigate: (page: string, userId?: string) => void;
  onCreateUser: () => void;
  userCertifications: UserCertification[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onNavigate, onCreateUser, userCertifications }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <Icon name="arrow-up" className="h-4 w-4" /> : <Icon name="arrow-down" className="h-4 w-4" />;
  };

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof User];
        const bValue = b[sortConfig.key as keyof User];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
           if (aValue === bValue) return 0;
           return sortConfig.direction === 'ascending' ? (aValue ? -1 : 1) : (aValue ? 1 : -1);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredAndSortedUsers = useMemo(() => {
    return sortedUsers.filter(user =>
      user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
      user.username.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [sortedUsers, filter]);

  const tableHeaders: { key: keyof User; label: string; }[] = [
    { key: 'lastName', label: 'Last Name' },
    { key: 'firstName', label: 'First Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'isActive', label: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            User Management
          </h1>
        </div>
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          <button
              onClick={onCreateUser}
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
              <Icon name="plus" className="h-4 w-4 mr-2" />
              New User
          </button>
        </div>
      </div>

      <Card
        title={
          <div className="relative max-w-xs flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon name="funnel" className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Filter users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        }
        bodyClassName="overflow-x-auto"
      >
        <div className="min-w-full align-middle">
            <table className="min-w-full">
                <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      {tableHeaders.map(({ key, label }) => (
                          <th key={key} scope="col" className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <button onClick={() => requestSort(key)} className="flex items-center space-x-1 group">
                                  <span>{label}</span>
                                  <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                                      {getSortIndicator(key)}
                                  </span>
                              </button>
                          </th>
                      ))}
                      <th scope="col" className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Assigned Assets
                      </th>
                      <th scope="col" className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Certifications
                      </th>
                      <th scope="col" className="relative p-3">
                          <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900">
                  {filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map(user => {
                      const certCount = userCertifications.filter(c => c.userId === user.id).length;
                      return <UserRow key={user.id} user={user} certCount={certCount} onEdit={(userId) => onNavigate('AdminUserProfile', userId)} />
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-500">
                         <div className="flex flex-col items-center">
                            <Icon name="users" className="h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-lg font-semibold">No users found</h3>
                            <p className="mt-1 text-sm text-slate-500">No users matched your filter criteria.</p>
                             <button
                                onClick={onCreateUser}
                                className="mt-4 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
                                <Icon name="plus" className="h-4 w-4 mr-2" />
                                New User
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;