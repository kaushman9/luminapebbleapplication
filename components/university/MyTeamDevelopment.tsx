import React from 'react';
import { Card } from '../ui/Card';
import { User, UniversityCourse, UserCertification } from '../../types';
import { Icon } from '../ui/Icons';

interface MyTeamDevelopmentProps {
  currentUser: User;
  users: User[];
  courses: UniversityCourse[];
  certifications: UserCertification[];
}

const MyTeamDevelopment: React.FC<MyTeamDevelopmentProps> = ({ currentUser, users, courses, certifications }) => {
  // A simple way to determine team members: users assigned to the same primary asset as the manager.
  // A more robust solution might use a direct_reports field on the User object.
  const managerAssetIds = new Set(currentUser.assignments.map(a => a.assetId));
  const teamMembers = users.filter(u => 
    u.id !== currentUser.id && u.assignments.some(a => managerAssetIds.has(a.assetId))
  );

  const certifiableCourses = courses.filter(c => c.recertificationRule);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Team's Development</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Track certifications and skill readiness for your direct reports.</p>
      </div>
      <Card title="Skills Matrix" bodyClassName="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-100 p-2 text-left text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Team Member</th>
              {certifiableCourses.map(course => (
                <th key={course.id} className="p-2 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700" title={course.title}>
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="academic-cap" className="h-4 w-4 flex-shrink-0"/>
                    <span className="truncate">{course.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map(user => (
              <tr key={user.id}>
                <td className="sticky left-0 bg-white p-2 text-sm font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{user.firstName} {user.lastName}</td>
                {certifiableCourses.map(course => {
                  const hasCert = certifications.some(c => c.userId === user.id && c.courseId === course.id);
                  return (
                    <td key={course.id} className="p-2 text-center border border-slate-200 dark:border-slate-700">
                      {hasCert ? <Icon name="check-circle" className="h-5 w-5 text-success-500 mx-auto" /> : <Icon name="x-circle" className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default MyTeamDevelopment;
