import React, { useState, useMemo } from 'react';
import { TemplateTask, TaskType, AssetTypeConfig, ProjectTemplate, DueDateUnit, DueDateDirection, DueDateRefPoint, RecurrenceFreq, User, DefinedPlaceholder } from '../../types';
import { Modal } from '../ui/Modal';
import { produce } from 'immer';
import { Icon } from '../ui/Icons';

interface TaskModalProps {
  task: TemplateTask;
  templateAssetTypeIds: string[];
  assetTypeConfigs: AssetTypeConfig[];
  projectTemplates: ProjectTemplate[];
  allTasks: TemplateTask[];
  users: User[];
  definedPlaceholders: DefinedPlaceholder[];
  onClose: () => void;
  onSave: (task: TemplateTask) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, templateAssetTypeIds, assetTypeConfigs, projectTemplates, allTasks, users, definedPlaceholders }) => {
  const [currentTask, setCurrentTask] = useState<TemplateTask>(task);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showRoles, setShowRoles] = useState(currentTask.assignment.roleIds.length > 0);
  const [showUsers, setShowUsers] = useState(currentTask.assignment.userIds.length > 0);
  const [showPlaceholders, setShowPlaceholders] = useState(currentTask.assignment.placeholderIds.length > 0);

  const relevantPositions = useMemo(() => {
    const positions: {id: string, title: string}[] = [];
    const addedPosIds = new Set();
    assetTypeConfigs.forEach(config => {
        if(templateAssetTypeIds.includes(config.id)) {
            config.positions.forEach(pos => {
                if(!addedPosIds.has(pos.id)) {
                    positions.push(pos);
                    addedPosIds.add(pos.id);
                }
            })
        }
    });
    return positions;
  }, [templateAssetTypeIds, assetTypeConfigs]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTask(
      produce(draft => {
        if (name === 'title') {
          draft.title = value;
          return;
        }

        switch (draft.type) {
          case 'Task':
          case 'Recurring Task':
          case 'File Requirement':
            if (name === 'description') draft.description = value;
            break;
          case 'Sub-Project':
            if (name === 'subProjectTemplateId') draft.subProjectTemplateId = value;
            break;
          case 'Discussion':
            if (name === 'prompt') draft.prompt = value;
            break;
        }
      })
    );
  };
  
  const handleAssignmentTypeToggle = (type: 'role' | 'person' | 'placeholder') => {
      switch(type) {
          case 'role':
              setShowRoles(!showRoles);
              if (showRoles) setCurrentTask(produce(draft => { draft.assignment.roleIds = []; }));
              break;
          case 'person':
              setShowUsers(!showUsers);
              if (showUsers) setCurrentTask(produce(draft => { draft.assignment.userIds = []; }));
              break;
          case 'placeholder':
              setShowPlaceholders(!showPlaceholders);
              if (showPlaceholders) setCurrentTask(produce(draft => { draft.assignment.placeholderIds = []; }));
              break;
      }
  };

  const handleToggleRoleId = (roleId: string) => {
    setCurrentTask(produce(draft => {
        const index = draft.assignment.roleIds.indexOf(roleId);
        if (index > -1) {
            draft.assignment.roleIds.splice(index, 1);
        } else {
            draft.assignment.roleIds.push(roleId);
        }
    }));
  };
  
   const handleToggleUserId = (userId: string) => {
    setCurrentTask(produce(draft => {
        const index = draft.assignment.userIds.indexOf(userId);
        if (index > -1) {
            draft.assignment.userIds.splice(index, 1);
        } else {
            draft.assignment.userIds.push(userId);
        }
    }));
  };

  const handlePlaceholderToggle = (placeholderId: string) => {
    setCurrentTask(produce(draft => {
        const index = draft.assignment.placeholderIds.indexOf(placeholderId);
        if (index > -1) {
            draft.assignment.placeholderIds.splice(index, 1);
        } else {
            draft.assignment.placeholderIds.push(placeholderId);
        }
    }));
  };
  
  const handleRelativeDateChange = (field: 'value' | 'unit' | 'direction' | 'ref', value: string) => {
    setCurrentTask(produce(draft => {
      // Using a switch to help TypeScript narrow the types correctly
      switch (field) {
        case 'value':
          draft.dueDate.value = parseInt(value, 10) || 0;
          break;
        case 'unit':
          draft.dueDate.unit = value as DueDateUnit;
          break;
        case 'direction':
          draft.dueDate.direction = value as DueDateDirection;
          break;
        case 'ref':
          draft.dueDate.ref = value as DueDateRefPoint;
          break;
      }
    }));
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
     setCurrentTask(produce(draft => {
       if (draft.type === 'Recurring Task') {
         draft.recurrence.freq = value as RecurrenceFreq;
       }
    }));
  }
   const handleRecurrenceDayToggle = (day: 'M'|'T'|'W'|'Th'|'F'|'Sa'|'Su') => {
      setCurrentTask(produce(draft => {
       if (draft.type === 'Recurring Task') {
         if (!draft.recurrence.daysOfWeek) {
           draft.recurrence.daysOfWeek = [];
         }
         const dayIndex = draft.recurrence.daysOfWeek.indexOf(day);
         if (dayIndex > -1) {
           draft.recurrence.daysOfWeek.splice(dayIndex, 1);
         } else {
           draft.recurrence.daysOfWeek.push(day);
         }
       }
    }));
   }

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
        onSave(currentTask);
        setIsSaving(false);
      }, 500);
  }

  const renderTaskSpecificFields = () => {
    switch (currentTask.type) {
      case 'Task':
        return <>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea name="description" value={currentTask.description} onChange={handleFieldChange} placeholder="Detailed instructions..." rows={3} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dependencies</label>
              <select multiple value={currentTask.dependencies} onChange={(e) => setCurrentTask(produce(draft => { if (draft.type === 'Task') draft.dependencies = Array.from(e.target.selectedOptions, option => option.value)}))} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500 h-24">
                {allTasks.filter(t => t.id !== currentTask.id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
        </>;
      case 'Recurring Task':
        return <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea name="description" value={currentTask.description} onChange={handleFieldChange} placeholder="Detailed instructions..." rows={3} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Recurrence Rules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Repeats</label>
                    <select value={currentTask.recurrence.freq} onChange={handleRecurrenceChange} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                    </select>
                  </div>
                  {currentTask.recurrence.freq === 'Weekly' && <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">On Days</label>
                      <div className="mt-2 flex space-x-1">
                          {(['M','T','W','Th','F','Sa','Su'] as const).map(day => <button key={day} type="button" onClick={() => handleRecurrenceDayToggle(day)} className={`h-8 w-8 text-xs rounded-full border ${currentTask.recurrence.daysOfWeek?.includes(day) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`}>{day}</button>)}
                      </div>
                  </div>}
              </div>
          </div>
        </div>
      case 'Sub-Project':
        return <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Project Template</label>
          <select name="subProjectTemplateId" value={currentTask.subProjectTemplateId} onChange={handleFieldChange} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500">
              <option value="">-- Select a Template --</option>
              {projectTemplates.filter(pt => pt.id !== task.id).map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
          </select>
        </div>
      case 'Learning Module':
         return <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">LMS Courses</label>
          <select name="lmsCourseIds" multiple value={currentTask.lmsCourseIds} onChange={(e) => setCurrentTask(produce(draft => {if(draft.type === 'Learning Module') draft.lmsCourseIds = Array.from(e.target.selectedOptions, option => option.value)}))} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500 h-24">
              <option value="LMS-101">LMS-101: Welcome to Lumina</option>
              <option value="LMS-201">LMS-201: PMS Training</option>
              <option value="LMS-202">LMS-202: Guest Service Excellence</option>
          </select>
        </div>
      case 'File Requirement':
        return <>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea name="description" value={currentTask.description} onChange={handleFieldChange} placeholder="Instructions on what the file should be..." rows={3} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex items-center"><input type="checkbox" id="requiresApproval" checked={currentTask.requiresApproval} onChange={(e) => setCurrentTask(produce(draft => {if(draft.type === 'File Requirement') draft.requiresApproval = e.target.checked}))} className="h-4 w-4 rounded mr-2 text-primary-600 focus:ring-primary-500" /><label htmlFor="requiresApproval">Requires Approval</label></div>
        </>;
      case 'Discussion':
        return <textarea name="prompt" value={currentTask.prompt} onChange={handleFieldChange} placeholder="e.g. What went well? What could be improved?" rows={4} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500" />;
      default: return null;
    }
  }

  return (
    <Modal show={true} onClose={onClose} title={`Configure Step: ${task.type}`} size="xl">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title / Objective</label>
          <input type="text" id="title" name="title" value={currentTask.title} onChange={handleFieldChange} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md focus:ring-primary-500 focus:border-primary-500" required />
        </div>
        
        {renderTaskSpecificFields()}
        
        <div className="p-4 space-y-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50">
           <h3 className="font-semibold text-slate-800 dark:text-slate-200">Task Assignment</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Select one or more methods to assign this task.</p>
            <div className="flex items-center space-x-4">
                {(['role', 'person', 'placeholder'] as const).map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                        <input 
                            type="checkbox"
                            checked={type === 'role' ? showRoles : type === 'person' ? showUsers : showPlaceholders}
                            onChange={() => handleAssignmentTypeToggle(type)}
                            className="h-4 w-4 rounded border-slate-400 text-primary-600 focus:ring-primary-500"
                        />
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </label>
                ))}
            </div>
            
            {showRoles && <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Roles</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                    {relevantPositions.map(pos => (
                      <button key={pos.id} type="button" onClick={() => handleToggleRoleId(pos.id)} className={`px-3 py-1 text-sm font-semibold rounded-full border ${currentTask.assignment.roleIds.includes(pos.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}>
                        {pos.title}
                      </button>
                    ))}
                    {relevantPositions.length === 0 && <p className="text-xs text-slate-500">No roles available for the selected asset types.</p>}
                </div>
            </div>}
            
            {showUsers && <div className="pt-2">
                 <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Specific People</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                    {users.map(u => (
                      <button key={u.id} type="button" onClick={() => handleToggleUserId(u.id)} className={`px-3 py-1 text-sm font-semibold rounded-full border ${currentTask.assignment.userIds.includes(u.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}>
                        {u.firstName} {u.lastName}
                      </button>
                    ))}
                </div>
            </div>}

            {showPlaceholders && <div className="pt-2">
                 <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Project Roles (Placeholders)</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400">Select from roles defined in the 'Project Roles' tab of the template.</p>
                 <div className="mt-2 space-y-2">
                    {definedPlaceholders.length > 0 ? definedPlaceholders.map(p => (
                        <label key={p.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50">
                             <input 
                                type="checkbox"
                                checked={currentTask.assignment.placeholderIds.includes(p.id)}
                                onChange={() => handlePlaceholderToggle(p.id)}
                                className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span>{p.name}</span>
                        </label>
                    )) : (
                        <p className="text-sm text-slate-500">No project roles defined for this template.</p>
                    )}
                </div>
            </div>}
        </div>

        <div className="p-4 space-y-3 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50">
           <h3 className="font-semibold text-slate-800 dark:text-slate-200">Due Date</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Set a deadline relative to a project milestone.</p>
           <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Due</span>
            <input type="number" value={currentTask.dueDate.value} onChange={(e) => handleRelativeDateChange('value', e.target.value)} className="w-20 block text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            <select value={currentTask.dueDate.unit} onChange={(e) => handleRelativeDateChange('unit', e.target.value)} className="block text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option>Days</option><option>Weeks</option><option>Months</option>
            </select>
            <select value={currentTask.dueDate.direction} onChange={(e) => handleRelativeDateChange('direction', e.target.value)} className="block text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option>After</option><option>Before</option>
            </select>
             <span>the</span>
             <select value={currentTask.dueDate.ref} onChange={(e) => handleRelativeDateChange('ref', e.target.value)} className="block text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option>Project Start</option><option>Project End</option><option>Previous Step Completion</option>
            </select>
           </div>
        </div>
        
         <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600" disabled={isSaving}>Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md flex items-center justify-center w-28" disabled={isSaving}>
              {isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save Step'}
            </button>
        </div>
      </div>
    </Modal>
  );
};
