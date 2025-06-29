import React, { useMemo, useState, useRef } from 'react';
import { isToday, isPast, format, formatDistanceToNow, addDays } from 'date-fns';
import { produce } from 'immer';
import { Icon } from '../../ui/Icons';
import { DisplayTask, ActiveProject, User, Asset, AssetTypeConfig, ActionItem, ProjectTemplate } from '../../../types';
import { Card } from '../../ui/Card';
import { ProjectCard } from '../ProjectCard';
import { DashboardHud } from '../DashboardHud';
import { FilterBar, Filters } from '../FilterBar';

interface WorkspaceViewProps {
    projects: ActiveProject[];
    unifiedTasks: DisplayTask[];
    currentUser: User;
    assets: Asset[];
    users: User[];
    assetTypeConfigs: AssetTypeConfig[];
    onToggleTask: (projectId: string, taskId: string) => void;
    onToggleActionItem: (itemId: string) => void;
    onViewProjectDetail: (projectId: string) => void;
}


const TaskMetadata: React.FC<{ task: DisplayTask }> = ({ task }) => {
    return (
        <div className="flex items-center gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
             {task.sourceType === 'recurring_task' && (
                <span className="inline-flex items-center gap-1" title="Recurring Task">
                    <Icon name="arrow-path" className="h-3.5 w-3.5" />
                    Recurring
                </span>
            )}
             {task.sourceType === 'project' && (
                 <span className="inline-flex items-center gap-1.5 font-medium" title={`Project: ${task.projectName}`}>
                    <Icon name="rocket-launch" className="h-3.5 w-3.5" />
                    {task.projectName}
                </span>
            )}
            {task.sourceType === 'standalone' && !task.isRecurringInstance && (
                 <span className="text-slate-400 italic">One-Off Task</span>
            )}

            {task.sopLink && (
                 <a href={task.sopLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary-600" title="View SOP">
                    <Icon name="link" className="h-3.5 w-3.5" />
                    SOP
                </a>
            )}
             {(task.commentCount || 0) > 0 && (
                 <span className="inline-flex items-center gap-1" title={`${task.commentCount} comments`}>
                    <Icon name="chat-bubble-left" className="h-3.5 w-3.5" />
                    {task.commentCount}
                </span>
            )}
            {(task.attachmentCount || 0) > 0 && (
                 <span className="inline-flex items-center gap-1" title={`${task.attachmentCount} attachments`}>
                    <Icon name="paper-clip" className="h-3.5 w-3.5" />
                    {task.attachmentCount}
                </span>
            )}
        </div>
    )
}


const TaskRow: React.FC<{ task: DisplayTask; onToggle: () => void }> = ({ task, onToggle }) => {
    const isCompleted = task.status === 'Completed';
    const dueDate = task.absoluteDueDate ? new Date(task.absoluteDueDate) : null;
    const isTaskOverdue = dueDate && !isToday(dueDate) && isPast(dueDate) && !isCompleted;
    
    let dueDateText = '';
    let dueDateColor = 'text-slate-500 dark:text-slate-400';

    if (dueDate) {
        if (isTaskOverdue) {
            dueDateText = formatDistanceToNow(dueDate, { addSuffix: true });
            dueDateColor = 'text-danger-600 dark:text-danger-400 font-semibold';
        } else if (isToday(dueDate)) {
            dueDateText = 'Today';
            dueDateColor = 'text-warning-600 dark:text-warning-400 font-semibold';
        } else {
            dueDateText = format(dueDate, 'MMM d');
        }
    }

    return (
        <tr className={`border-b border-slate-200/80 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 ${isCompleted ? 'opacity-60' : ''}`}>
             <td className="p-3 text-center">
                <button onClick={onToggle} className="flex-shrink-0">
                    <Icon name={isCompleted ? "check-square" : "square"} className={`h-5 w-5 ${isCompleted ? 'text-primary-600' : 'text-slate-400'}`} />
                </button>
            </td>
            <td className="p-3">
                <p className={`font-semibold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                    {task.title}
                </p>
                <TaskMetadata task={task} />
            </td>
            <td className="p-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {task.assetName}
            </td>
            <td className={`p-3 text-sm whitespace-nowrap text-right ${dueDateColor}`}>
                {dueDateText}
            </td>
        </tr>
    );
};


export const WorkspaceView: React.FC<WorkspaceViewProps> = (props) => {
    const { projects, currentUser, users, unifiedTasks, onToggleTask, onToggleActionItem, onViewProjectDetail, assets } = props;
    const [filters, setFilters] = useState<Filters>({ type: 'all', dateFilter: 'all', asset: 'all', assignee: 'me', keyword: '' });
    const projectsContainerRef = useRef<HTMLDivElement>(null);

    const filteredTasks = useMemo(() => {
        return unifiedTasks.filter(t => {
            // Your comprehensive filtering logic here
            const lowerKeyword = filters.keyword.toLowerCase();

            // Date filters
            if (filters.dateFilter === 'overdue') {
                 if (t.status === 'Completed' || !t.absoluteDueDate || isToday(new Date(t.absoluteDueDate)) || !isPast(new Date(t.absoluteDueDate))) {
                    return false;
                }
            }
            if (filters.dateFilter === 'today') {
                if (t.status === 'Completed' || !t.absoluteDueDate || !isToday(new Date(t.absoluteDueDate))) {
                    return false;
                }
            }
             // Keyword filter
            if (filters.keyword && !t.title.toLowerCase().includes(lowerKeyword) && !(t.projectName || '').toLowerCase().includes(lowerKeyword)) {
                return false;
            }

            // Type filters
            if (filters.type === 'tasks' && t.sourceType !== 'standalone') return false;
            if (filters.type === 'recurring' && t.sourceType !== 'recurring_task') return false;

            // Assignee filter
            if (filters.assignee === 'me') {
                const isUserAssigned = t.assignment.userIds.includes(currentUser.id);
                const userPositions = currentUser.assignments.map(a => a.positionId);
                const isRoleAssigned = t.assignment.roleIds.some(roleId => userPositions.includes(roleId));
                if (!isUserAssigned && !isRoleAssigned) return false;
            }

            // Asset filter
            if(filters.asset !== 'all') {
                if(t.sourceType === 'project') {
                    const project = projects.find(p => p.id === t.projectId);
                    if(project?.primaryAssetId !== filters.asset) return false;
                } else {
                    // For now, standalone tasks are not filtered by asset
                    return false;
                }
            }
            
            return true;
        })
    }, [unifiedTasks, filters, currentUser, projects]);

    const taskGroups = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const activeTasks = filteredTasks.filter(t => t.status !== 'Completed');
        const completedTodayTasks = filteredTasks.filter(t => t.status === 'Completed' && t.completedAt && new Date(t.completedAt) >= startOfToday);

        const overdue = activeTasks.filter(t => t.absoluteDueDate && isPast(new Date(t.absoluteDueDate)) && !isToday(new Date(t.absoluteDueDate)));
        const dueToday = activeTasks.filter(t => t.absoluteDueDate && isToday(new Date(t.absoluteDueDate)));
        const next7Days = activeTasks.filter(t => t.absoluteDueDate && !isToday(new Date(t.absoluteDueDate)) && new Date(t.absoluteDueDate) <= addDays(today, 7));
        const upcoming = activeTasks.filter(t => t.absoluteDueDate && new Date(t.absoluteDueDate) > addDays(today, 7));
        
        return { overdue, dueToday, next7Days, upcoming, completedToday: completedTodayTasks };
    }, [filteredTasks]);

    const handleToggle = (task: DisplayTask) => {
        if (task.sourceType === 'standalone' || task.sourceType === 'recurring_task') {
            onToggleActionItem(task.originalActionItemId!);
        } else if (task.sourceType === 'project') {
            onToggleTask(task.projectId!, task.originalTaskId!);
        }
    };
    
    const handleQuickFilterClick = (type: 'overdue' | 'today') => {
        setFilters(f => ({ ...f, type: 'all', dateFilter: f.dateFilter === type ? 'all' : type }));
    };

    const handleFilterBarChange = (newFilters: Filters) => {
        const updatedFilters = { ...newFilters };
        if (newFilters.type !== filters.type || newFilters.dateFilter !== 'all') {
            updatedFilters.dateFilter = 'all';
        }
        setFilters(updatedFilters);
    };

    const filteredProjects = useMemo(() => {
        if (filters.type === 'tasks' || filters.type === 'recurring') return [];
        return projects.filter(p => p.name.toLowerCase().includes(filters.keyword.toLowerCase()));
    }, [projects, filters]);

    const scrollProjects = (direction: 'left' | 'right') => {
        if (projectsContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            projectsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            <DashboardHud tasks={unifiedTasks} onFilterClick={handleQuickFilterClick} />
            
            {/* Projects Section */}
            <section>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Icon name="rocket-launch" className="h-6 w-6 text-slate-500" />
                        My Active Projects
                    </h2>
                     <div className="flex items-center space-x-2">
                        <button onClick={() => scrollProjects('left')} className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700">
                            <Icon name="arrow-left" className="h-4 w-4" />
                        </button>
                        <button onClick={() => scrollProjects('right')} className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700">
                            <Icon name="arrow-right-start-on-rectangle" className="h-4 w-4 transform -scale-x-100" />
                        </button>
                    </div>
                </div>
                 <div ref={projectsContainerRef} className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="w-80 flex-shrink-0">
                            <ProjectCard 
                                project={project}
                                users={users}
                                onSelect={() => onViewProjectDetail(project.id)}
                            />
                        </div>
                    ))}
                </div>
                {filteredProjects.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-slate-500">No active projects match your filters.</p>
                    </div>
                )}
            </section>

            {/* Tasks Section */}
            <section>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-4">
                    <Icon name="clipboard-document-check" className="h-6 w-6 text-slate-500" />
                    All My Tasks
                </h2>
                 <FilterBar filters={filters} onFilterChange={handleFilterBarChange} assets={assets} users={users} />
                 
                 <div className="mt-4 overflow-x-auto">
                     <table className="min-w-full">
                        <thead className="sr-only">
                            <tr><th>Status</th><th>Task</th><th>Asset</th><th>Due</th></tr>
                        </thead>
                        <tbody>
                            {/* OVERDUE */}
                             {taskGroups.overdue.length > 0 && (
                                <>
                                 <tr className="bg-transparent"><td colSpan={4} className="py-2"><h3 className="text-sm font-semibold text-danger-600 dark:text-danger-400">Overdue</h3></td></tr>
                                 {taskGroups.overdue.map(task => <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />)}
                                </>
                             )}
                              {/* DUE TODAY */}
                             {taskGroups.dueToday.length > 0 && (
                                <>
                                 <tr className="bg-transparent"><td colSpan={4} className="pt-4 pb-2"><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Due Today</h3></td></tr>
                                 {taskGroups.dueToday.map(task => <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />)}
                                </>
                             )}
                             {/* COMPLETED TODAY */}
                             {taskGroups.completedToday.length > 0 && (
                                 <>
                                     <tr className="bg-transparent"><td colSpan={4} className="pt-4 pb-2"><h3 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Completed Today</h3></td></tr>
                                     {taskGroups.completedToday.map(task => <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />)}
                                 </>
                             )}
                        </tbody>
                    </table>
                 </div>

                {(taskGroups.overdue.length + taskGroups.dueToday.length + taskGroups.completedToday.length) === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg mt-4">
                        <Icon name="check-badge" className="h-12 w-12 text-slate-400 mx-auto" />
                        <h3 className="mt-2 text-lg font-semibold">All clear for today!</h3>
                        <p className="mt-1 text-sm text-slate-500">You have no overdue or tasks due today.</p>
                    </div>
                )}
            </section>
             <div className="text-center py-4">
                <a href="#" className="text-sm text-primary-600 hover:underline">
                    Looking for older items? Visit the Activity Archive.
                </a>
            </div>
        </div>
    )
};
