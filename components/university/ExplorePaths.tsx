import React from 'react';
import { Card } from '../ui/Card';
import { LearningPath, UserCertification, User } from '../../types';
import { Icon } from '../ui/Icons';

interface ExplorePathsProps {
  learningPaths: LearningPath[];
  certifications: UserCertification[];
  currentUser: User;
}

const ExplorePaths: React.FC<ExplorePathsProps> = ({ learningPaths, certifications, currentUser }) => {
  const userCerts = new Set(certifications.filter(c => c.userId === currentUser.id).map(c => c.courseId));

  const isPathUnlocked = (path: LearningPath): boolean => {
    if (!path.unlockPrerequisites) return true;
    const requiredCerts = path.unlockPrerequisites.requiredCertificationIds || [];
    return requiredCerts.every(certId => userCerts.has(certId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Explore Learning Paths</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Follow guided paths to master new skills and advance your career.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map(path => {
          const isUnlocked = isPathUnlocked(path);
          return (
            <Card key={path.id} className={`transition-all ${!isUnlocked ? 'grayscale opacity-70' : ''}`} bodyClassName="p-0 flex flex-col h-full">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{path.title}</h3>
                  {!isUnlocked && <Icon name="lock-closed" className="h-5 w-5 text-slate-500" title="Locked"/>}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{path.description}</p>
                
                {!isUnlocked && path.unlockPrerequisites?.requiredCertificationIds && (
                    <div className="mt-4">
                        <h4 className="text-xs font-bold uppercase text-slate-400">Requires</h4>
                        <ul className="text-xs text-slate-500 list-disc list-inside">
                           {path.unlockPrerequisites.requiredCertificationIds.map(id => <li key={id}>{id}</li>)}
                        </ul>
                    </div>
                )}
              </div>
              <div className="border-t border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <button
                  disabled={!isUnlocked}
                  className="w-full rounded-md bg-primary-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                  {isUnlocked ? 'View Path' : 'Locked'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExplorePaths;