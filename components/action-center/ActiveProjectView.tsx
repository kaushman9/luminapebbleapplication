import React from 'react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { ActiveProject, User, TaskAssignment, TemplateTask, AssetTypeConfig, DefinedPlaceholder, ProjectTemplate } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';

interface ActiveProjectViewProps {
  project: ActiveProject;
  onToggleTask: (projectId: string, taskId: string) => void;
  users: User[];
  templates: ProjectTemplate[];
  assetTypeConfigs: AssetTypeConfig[];
}

const BlockTypeIcons: Record<TemplateTask['type'], React.ComponentProps<typeof Icon>['name']> = {
  'Task': 'clipboard-document-check',
  'Recurring Task': 'arrow-path',
  'Sub-Project': 'folder',
  'Learning Module': 'academic-cap',
  'File Requirement': 'paper-clip',
  'Discussion': 'chat-bubble-left-right'
};


const getTaskAssignmentText = (assignment: TaskAssignment, users: User[], assetTypeConfigs: AssetTypeConfig[], definedPlaceholders: DefinedPlaceholder[] = []): string => {
  const parts: string[] = [];

  if (assignment.roleIds.length > 0) {
    const roleNames = assetTypeConfigs
      .flatMap(c => c.positions)
      .filter(p => assignment.roleIds.includes(p.id))
      .map(p => p.title);
    if (roleNames.length > 0) parts.push(`Roles: ${roleNames.join(', ')}`);
  }

  if (assignment.userIds.length > 0) {
    const userNames = users
      .filter(u => assignment.userIds.includes(u.id))
      .map(u => `${u.firstName} ${u.lastName}`);
    if (userNames.length > 0) parts.push(`People: ${userNames.join(', ')}`);
  }

  if (assignment.placeholderIds.length > 0) {
    const placeholderNames = definedPlaceholders
      .filter(p => assignment.placeholderIds.includes(p.id))
      .map(p => p.name);
    if (placeholderNames.length > 0) parts.push(`Placeholders: ${placeholderNames.join(', ')} (Unresolved)`);
  }

  if (parts.length === 0) return 'Unassigned';
  return parts.join(' | ');
}

export const ActiveProjectView: React.FC<ActiveProjectViewProps> = ({ project, onToggleTask, users, templates, assetTypeConfigs }) => {
    const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const projectTemplate = templates.find(t => t.id === project.templateId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {project.name}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Launched on {format(new Date(project.launchedAt), 'MMMM d, yyyy')}
                </p>
            </div>

            <Card>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Project Progress</h4>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{completedTasks} / {totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </Card>

            <div className="space-y-3">
                {project.tasks.map(task => (
                     <div key={task.id} className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start space-x-4">
                        <div className="flex-shrink-0 pt-0.5">
                            <input 
                                type="checkbox"
                                checked={task.status === 'Completed'}
                                onChange={() => onToggleTask(project.id, task.id)}
                                className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1">
                            <p className={`font-semibold text-slate-800 dark:text-slate-100 ${task.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                                {task.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Assigned to: {getTaskAssignmentText(task.assignment, users, assetTypeConfigs, projectTemplate?.definedPlaceholders)}
                            </p>
                             {task.status === 'Completed' && (
                                 <p className="text-xs text-slate-400 mt-1">
                                    Completed
                                    {task.completedBy && ` by ${task.completedBy}`}
                                    {task.completedAt && ` ${formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}`}
                                </p>
                             )}
                        </div>
                        <div className="flex-shrink-0">
                           <Icon name={BlockTypeIcons[task.type]} className="h-5 w-5 text-slate-400" title={task.type} />
                        </div>
                     </div>
                ))}
            </div>
        </div>
    );
};