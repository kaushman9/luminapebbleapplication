import React, { useState, useEffect, useMemo } from 'react';
import { produce } from 'immer';
import { UserDetailsForm } from '../components/admin-profile/UserDetailsForm';
import { UserAssignments } from '../components/admin-profile/UserAssignments';
import { UserSecurity } from '../components/admin-profile/UserSecurity';
import { UserOverrides } from '../components/admin-profile/UserOverrides';
import { User, Asset, AssetTypeConfig, UserPermissionOverride, UserEnrollment, UserCertification, UniversityCourse } from '../types';
import { Icon } from '../components/ui/Icons';
import { Card } from '../components/ui/Card';

interface AdminUserProfileProps {
  userToEdit?: User;
  isNewUser: boolean;
  assets: Asset[];
  assetTypeConfigs: AssetTypeConfig[];
  onSave: (user: User) => void;
  onUpdateUser: (update: Partial<User> & { id: string }) => void;
  onCancel: () => void;
  userEnrollments: UserEnrollment[];
  userCertifications: UserCertification[];
  allCourses: UniversityCourse[];
}

const BLANK_USER_TEMPLATE: Omit<User, 'id'> = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    isActive: true,
    assignments: [],
    globalPermissions: [],
    overrides: [],
};

const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ userToEdit, isNewUser, assets, assetTypeConfigs, onSave, onUpdateUser, onCancel, userEnrollments, userCertifications, allCourses }) => {
  const [user, setUser] = useState<User | Omit<User, 'id'>>(userToEdit || BLANK_USER_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUser(userToEdit || BLANK_USER_TEMPLATE);
  }, [userToEdit]);
  
  const handleFieldChange = (field: keyof User, value: any) => {
    setUser(produce(draft => {
      (draft as any)[field] = value;
    }));
  };

  const handleAssignmentChange = (newAssignments: User['assignments']) => {
    setUser(produce(draft => {
      draft.assignments = newAssignments;
    }));
  };

  const handleOverridesChange = (newOverrides: User['overrides']) => {
      setUser(produce(draft => {
          draft.overrides = newOverrides;
      }));
  };

  const handleSaveChanges = () => {
    if (isNewUser) {
        if (!user.password) {
            alert('A password is required for new users.');
            return;
        }
    }
    setIsSaving(true);
    // Simulate async operation
    setTimeout(() => {
        onSave(user as User);
        setIsSaving(false);
    }, 700);
  }

  const fullName = isNewUser ? 'Create New User' : `${user.firstName} ${user.lastName}`;

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {fullName}
          </h1>
          {!isNewUser && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
             <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                Cancel
            </button>
            <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-32 justify-center flex items-center" disabled={isSaving}>
                {isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save Changes'}
            </button>
        </div>
      </div>

       <UserDetailsForm user={user} onFieldChange={handleFieldChange} />
      
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
              <UserAssignments 
                assignments={user.assignments}
                assets={assets}
                assetTypeConfigs={assetTypeConfigs}
                onAssignmentsChange={handleAssignmentChange}
              />
              <UserOverrides 
                user={user}
                assets={assets}
                assetTypeConfigs={assetTypeConfigs}
                onOverridesChange={handleOverridesChange}
              />
          </div>

          <div className="xl:col-span-1 space-y-6">
            <UserSecurity 
              user={user} 
              isNewUser={isNewUser}
              onFieldChange={handleFieldChange}
              onUpdateUser={onUpdateUser}
            />
            <Card title="Development & Readiness">
              <div className="space-y-4">
                  <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Enrollments</h4>
                      <ul className="space-y-2">
                          {userEnrollments.length > 0 ? userEnrollments.map(enrollment => {
                              const course = allCourses.find(c => c.id === enrollment.courseId);
                              return (
                                  <li key={enrollment.id}>
                                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{course?.title || 'Unknown Course'}</p>
                                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                        <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                      </div>
                                  </li>
                              )
                          }) : <p className="text-xs text-slate-500">No active enrollments.</p>}
                      </ul>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Certifications</h4>
                      <ul className="space-y-2">
                          {userCertifications.length > 0 ? userCertifications.map(cert => {
                              const course = allCourses.find(c => c.id === cert.courseId);
                              return (
                                  <li key={cert.id} className="flex items-center text-sm">
                                      <Icon name="academic-cap" className="h-4 w-4 mr-2 text-primary-500" />
                                      <span className="font-medium text-slate-800 dark:text-slate-100">{course?.title || 'Unknown Certification'}</span>
                                  </li>
                              )
                          }) : <p className="text-xs text-slate-500">No certifications earned.</p>}
                      </ul>
                  </div>
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default AdminUserProfile;