import React, { useState, useMemo } from 'react';
import { ProjectTemplate, TemplateTask, User, AssetTypeConfig, TaskType, TaskAssignment, DefinedPlaceholder } from '../../../types';
import { Icon } from '../../ui/Icons';
import { produce } from 'immer';

interface ProjectPlanTabProps {
  currentTemplate: ProjectTemplate;
  setCurrentTemplate: React.Dispatch<React.SetStateAction<ProjectTemplate>>;
  onReorderTasks: (templateId: string, reorderedTasks: TemplateTask[]) => void;
  users: User[];
  assetTypeConfigs: AssetTypeConfig[];
  onEditTask: (task: TemplateTask) => void;
  onAddTask: (type: TaskType) => void;
}


const BlockTypeIcons: Record<TemplateTask['type'], React.ComponentProps<typeof Icon>['name']> = {
  'Task': 'clipboard-document-check',
  'Recurring Task': 'arrow-path',
  'Sub-Project': 'folder',
  'Learning Module': 'academic-cap',
  'File Requirement': 'paper-clip',
  'Discussion': 'chat-bubble-left-right'
};

const AddStepMenu: React.FC<{ onSelect: (type: TaskType) => void }> = ({ onSelect }) => {
    const stepTypes: { type: TaskType, icon: React.ComponentProps<typeof Icon>['name'], label: string }[] = [
        { type: 'Task', icon: 'clipboard-document-check', label: 'Add Task' },
        { type: 'Recurring Task', icon: 'arrow-path', label: 'Add Recurring Task' },
        { type: 'Sub-Project', icon: 'folder', label: 'Add Sub-Project' },
        { type: 'Learning Module', icon: 'academic-cap', label: 'Add Learning Module' },
        { type: 'File Requirement', icon: 'paper-clip', label: 'Add File Requirement' },
        { type: 'Discussion', icon: 'chat-bubble-left-right', label: 'Add Discussion Prompt' },
    ];

    return (
        <div className="absolute z-10 -top-2 left-1/2 -translate-x-1/2 w-60 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-2">
            {stepTypes.map(step => (
                <button key={step.type} onClick={() => onSelect(step.type)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-500/10">
                    <Icon name={step.icon} className="h-5 w-5 mr-3 text-primary-600"/>
                    <span>{step.label}</span>
                </button>
            ))}
        </div>
    );
};

const getAssignmentText = (assignment: TaskAssignment, users: User[], assetTypeConfigs: AssetTypeConfig[], definedPlaceholders: DefinedPlaceholder[] = []): string => {
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
    if(placeholderNames.length > 0) parts.push(`Placeholders: ${placeholderNames.join(', ')}`);
  }

  if (parts.length === 0) return 'Unassigned';
  return parts.join(' | ');
}

export const ProjectPlanTab: React.FC<ProjectPlanTabProps> = ({ currentTemplate, setCurrentTemplate, onReorderTasks, users, assetTypeConfigs, onEditTask, onAddTask }) => {
    const [isAddStepMenuOpen, setIsAddStepMenuOpen] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const handleDeleteTask = (taskId: string) => {
      setCurrentTemplate(produce(draft => {
          draft.tasks = draft.tasks.filter(t => t.id !== taskId);
      }));
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, taskId: string) => {
        setDraggedItemId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault(); 
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetTaskId: string) => {
        e.preventDefault();
        if (!draggedItemId) return;

        const tasks = [...currentTemplate.tasks];
        const draggedIndex = tasks.findIndex(t => t.id === draggedItemId);
        const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

        const [draggedItem] = tasks.splice(draggedIndex, 1);
        tasks.splice(targetIndex, 0, draggedItem);
        
        const reorderedTasks = tasks.map((task, index) => ({...task, displayOrder: index + 1}));
        
        setCurrentTemplate(produce(draft => {
        draft.tasks = reorderedTasks;
        }));
        
        onReorderTasks(currentTemplate.id, reorderedTasks);
        setDraggedItemId(null);
    };

    const sortedTasks = useMemo(() => {
        return [...currentTemplate.tasks].sort((a, b) => a.displayOrder - b.displayOrder);
    }, [currentTemplate.tasks]);

    return (
        <div className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Project Plan</h3>
            {sortedTasks.length > 0 ? (
                <ul className="space-y-2">
                    {sortedTasks.map(task => (
                        <li 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, task.id)}
                          className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-move"
                        >
                            <Icon name="bars-3" className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0"/>
                            <Icon name={BlockTypeIcons[task.type]} className="h-5 w-5 text-primary-600 mr-4 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Due {task.dueDate.value} {task.dueDate.unit} {task.dueDate.direction.toLowerCase()} {task.dueDate.ref} | Assign to: {getAssignmentText(task.assignment, users, assetTypeConfigs, currentTemplate.definedPlaceholders)}
                                </p>
                            </div>
                            <div className="space-x-1">
                                <button onClick={() => onEditTask(task)} className="p-2 text-slate-500 hover:text-primary-600 rounded-md"><Icon name="pencil" className="h-4 w-4"/></button>
                                <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-500 hover:text-danger-600 rounded-md"><Icon name="trash" className="h-4 w-4"/></button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500">This project plan is empty.</p>
                    <p className="text-sm text-slate-400">Add the first step to get started.</p>
                </div>
            )}
            
            <div className="relative" onMouseLeave={() => setIsAddStepMenuOpen(false)}>
                 <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300 dark:border-slate-700 border-dashed" />
                </div>
                <div className="relative flex justify-center">
                    <button 
                        onClick={() => setIsAddStepMenuOpen(prev => !prev)}
                        className="bg-slate-50 dark:bg-slate-950 px-4 text-sm font-semibold text-primary-600 hover:text-primary-500 flex items-center gap-2">
                        <Icon name="plus-circle" className="h-5 w-5" />
                        Add Step to Plan
                    </button>
                </div>
                {isAddStepMenuOpen && <AddStepMenu onSelect={onAddTask} />}
            </div>
        </div>
    );
};