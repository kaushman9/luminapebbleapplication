import React from 'react';
import { ActiveProject, User } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: ActiveProject;
  users: User[];
  onSelect: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, users, onSelect }) => {
  const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const projectLead = users.find(u => u.id === project.launchedBy);

  return (
    <Card className="h-full flex flex-col cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" bodyClassName="p-4 flex-grow flex flex-col">
      <button onClick={onSelect} className="w-full h-full text-left">
        <div className="flex-grow">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{project.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Launched {formatDistanceToNow(new Date(project.launchedAt), { addSuffix: true })}
            </p>

            <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Progress</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{completedTasks}/{totalTasks} tasks</span>
                    <span>Status: {project.status}</span>
                </div>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center">
                <Icon name="user-circle" className="h-6 w-6 text-slate-400" />
                <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {projectLead ? `${projectLead.firstName} ${projectLead.lastName}` : 'Unknown Lead'}
                </span>
            </div>
            <Icon name="chevron-down" className="h-4 w-4 text-slate-400 transform -rotate-90" />
        </div>
      </button>
    </Card>
  );
};
