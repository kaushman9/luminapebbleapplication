import React, { useState, useMemo } from 'react';
import { ProjectTemplate, AssetType, TemplateTask, TaskType, AssetTypeConfig, User, Asset, TaskAssignment, DueDateUnit, DueDateDirection, DueDateRefPoint, DefinedPlaceholder } from '../../types';
import { Icon } from '../ui/Icons';
import { produce } from 'immer';
import { TaskModal } from './TaskModal';
import { ProjectPlanTab } from './tabs/ProjectPlanTab';
import { Card } from '../ui/Card';

interface TemplateBuilderModalProps {
  template: ProjectTemplate | null;
  assetTypes: AssetType[];
  assetTypeConfigs: AssetTypeConfig[];
  projectTemplates: ProjectTemplate[];
  users: User[];
  assets: Asset[];
  onClose: () => void;
  onSave: (template: ProjectTemplate) => void;
  onReorderTasks: (templateId: string, reorderedTasks: TemplateTask[]) => void;
}

export const TemplateBuilderModal: React.FC<TemplateBuilderModalProps> = ({ 
  template, assetTypes, onClose, onSave, onReorderTasks, assetTypeConfigs, projectTemplates, users, assets
}) => {
  const [activeTab, setActiveTab] = useState('plan');
  const [editingTask, setEditingTask] = useState<TemplateTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingPlaceholder, setEditingPlaceholder] = useState<DefinedPlaceholder | { name: string, description: string, defaultAssignment: TaskAssignment } | null>(null);

  const [currentTemplate, setCurrentTemplate] = useState<ProjectTemplate>(() => {
    if (template) return template;
    // Default for new template
    return {
      id: `template-${Date.now()}`,
      name: '',
      description: '',
      appliesToAssetTypeIds: [],
      appliesToAssetIds: [],
      definedPlaceholders: [],
      tasks: [],
      lastUpdated: new Date().toISOString(),
      assetAssignmentRule: { type: 'primary_only' },
      accessPermissions: { userIds: [], positionIds: [] },
    };
  });
  
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTemplate(produce(draft => {
        if (name === 'name' || name === 'description') {
            draft[name] = value;
        } else if (name === 'assetAssignmentRuleType') {
            draft.assetAssignmentRule.type = value as ProjectTemplate['assetAssignmentRule']['type'];
        }
    }));
  };

   const handleAssetTypeChange = (assetTypeId: string) => {
    setCurrentTemplate(produce(draft => {
      const index = draft.appliesToAssetTypeIds.indexOf(assetTypeId);
      if (index > -1) {
        draft.appliesToAssetTypeIds.splice(index, 1);
      } else {
        draft.appliesToAssetTypeIds.push(assetTypeId);
      }
    }));
  };
  
    const handleAppliesToAssetIdsChange = (assetId: string) => {
        setCurrentTemplate(produce(draft => {
            const currentList = draft.appliesToAssetIds || [];
            const index = currentList.indexOf(assetId);
            if(index > -1) {
                currentList.splice(index, 1);
            } else {
                currentList.push(assetId);
            }
            draft.appliesToAssetIds = currentList;
        }));
    };

  const handleManualAssetListChange = (assetId: string) => {
    setCurrentTemplate(produce(draft => {
        if (draft.assetAssignmentRule.type === 'manual_list') {
            const currentList = draft.assetAssignmentRule.assetIds || [];
            const index = currentList.indexOf(assetId);
            if(index > -1) {
                currentList.splice(index, 1);
            } else {
                currentList.push(assetId);
            }
            draft.assetAssignmentRule.assetIds = currentList;
        } else {
            // This case should ideally not happen if UI is correct
            draft.assetAssignmentRule = { type: 'manual_list', assetIds: [assetId] };
        }
    }));
  };

  const handleAccessChange = (type: 'user' | 'position', id: string) => {
    setCurrentTemplate(produce(draft => {
        let list: string[];
        if (type === 'user') {
            list = draft.accessPermissions.userIds;
        } else { // type === 'position'
            list = draft.accessPermissions.positionIds;
        }

        const index = list.indexOf(id);
        if (index > -1) {
            list.splice(index, 1);
        } else {
            list.push(id);
        }
    }));
  }

  const handleSavePlaceholder = () => {
      if (!editingPlaceholder || !editingPlaceholder.name) return;

      setCurrentTemplate(produce(draft => {
          if (!draft.definedPlaceholders) {
              draft.definedPlaceholders = [];
          }
          if ('id' in editingPlaceholder) {
              const index = draft.definedPlaceholders.findIndex(p => p.id === editingPlaceholder.id);
              if (index > -1) {
                  draft.definedPlaceholders[index] = editingPlaceholder;
              }
          } else {
              draft.definedPlaceholders.push({
                  ...editingPlaceholder,
                  id: `ph-${Date.now()}`
              });
          }
      }));
      setEditingPlaceholder(null);
  };
  
  const handleDeletePlaceholder = (id: string) => {
       setCurrentTemplate(produce(draft => {
          draft.definedPlaceholders = draft.definedPlaceholders?.filter(p => p.id !== id);
       }));
  }

  const handleSaveTemplate = () => {
    setIsSaving(true);
    const finalTemplate = produce(currentTemplate, draft => {
        draft.lastUpdated = new Date().toISOString();
        draft.tasks.forEach((task, index) => {
            task.displayOrder = index + 1;
        });
    });
    setTimeout(() => {
        onSave(finalTemplate);
        setIsSaving(false);
        onClose();
    }, 700);
  };

  const handleSaveTask = (task: TemplateTask) => {
    setCurrentTemplate(produce(draft => {
        const index = draft.tasks.findIndex(t => t.id === task.id);
        if(index > -1) {
            draft.tasks[index] = task;
        } else {
            task.displayOrder = draft.tasks.length + 1;
            draft.tasks.push(task);
        }
    }));
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };
  
  const handleAddTask = (type: TaskType) => {
    const baseNewTask = {
        id: `task-${Date.now()}`,
        displayOrder: currentTemplate.tasks.length + 1,
        title: '',
        assignment: { roleIds: [], userIds: [], placeholderIds: [] },
        dueDate: { value: 1, unit: 'Days' as DueDateUnit, direction: 'After' as DueDateDirection, ref: 'Project Start' as DueDateRefPoint },
    };

    let specificTask: TemplateTask;

    switch (type) {
        case 'Task':
            specificTask = { ...baseNewTask, type, description: '', dependencies: [] };
            break;
        case 'Recurring Task':
            specificTask = { ...baseNewTask, type, description: '', recurrence: { freq: 'Weekly', daysOfWeek: ['M'], time: "09:00" } };
            break;
        case 'Sub-Project':
            specificTask = { ...baseNewTask, type, subProjectTemplateId: '', trigger: 'Automatic' };
            break;
        case 'Learning Module':
            specificTask = { ...baseNewTask, type, lmsCourseIds: [], requirement: 'Required' };
            break;
        case 'File Requirement':
            specificTask = { ...baseNewTask, type, description: '', requiresApproval: false };
            break;
        case 'Discussion':
            specificTask = { ...baseNewTask, type, prompt: '' };
            break;
        default:
            return;
    }

    setEditingTask(specificTask);
    setIsTaskModalOpen(true);
}

  const handleEditTask = (task: TemplateTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }

  const filteredAssets = useMemo(() => {
    if (currentTemplate.appliesToAssetTypeIds.length === 0) {
      return assets;
    }
    return assets.filter(asset => currentTemplate.appliesToAssetTypeIds.includes(asset.assetTypeId));
  }, [assets, currentTemplate.appliesToAssetTypeIds]);
  
  const availablePositions = useMemo(() => {
    const positions = new Map<string, string>();
    assetTypeConfigs.forEach(config => {
        config.positions.forEach(pos => {
            if (!positions.has(pos.id)) {
                positions.set(pos.id, pos.title);
            }
        });
    });
    return Array.from(positions.entries()).map(([id, title]) => ({ id, title }));
  }, [assetTypeConfigs]);

  const tabs = [
      { key: 'plan', label: 'Project Plan' },
      { key: 'roles', label: 'Project Roles' },
      { key: 'assignment', label: 'Asset Assignment' },
      { key: 'access', label: 'Launch Permissions' },
  ]

  const renderRolesTab = () => (
    <div className="p-6 space-y-4">
        {editingPlaceholder ? (
            <Card title={'id' in editingPlaceholder ? 'Edit Project Role' : 'Add New Project Role'}>
                <div className="space-y-4">
                    <input 
                        type="text"
                        value={editingPlaceholder.name}
                        onChange={(e) => setEditingPlaceholder(p => ({...p!, name: e.target.value }))}
                        placeholder="Role Name (e.g., New Hire)"
                        className="w-full p-2 text-sm border-slate-300 dark:border-slate-700 rounded-md bg-transparent"
                    />
                    <textarea 
                         value={editingPlaceholder.description}
                         onChange={(e) => setEditingPlaceholder(p => ({...p!, description: e.target.value }))}
                         placeholder="Description..."
                         rows={2}
                         className="w-full p-2 text-sm border-slate-300 dark:border-slate-700 rounded-md bg-transparent"
                    />
                    
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm">Default Assignment</h4>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">By Position</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {availablePositions.map(pos => <button key={pos.id} onClick={() => setEditingPlaceholder(produce(p => { const roles = p!.defaultAssignment.roleIds; const idx = roles.indexOf(pos.id); if(idx > -1) roles.splice(idx,1); else roles.push(pos.id); }))} className={`text-xs px-2 py-0.5 rounded-full border ${editingPlaceholder.defaultAssignment.roleIds.includes(pos.id) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-700'}`}>{pos.title}</button>)}
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">By Specific User</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {users.map(u => <button key={u.id} onClick={() => setEditingPlaceholder(produce(p => { const users = p!.defaultAssignment.userIds; const idx = users.indexOf(u.id); if(idx > -1) users.splice(idx,1); else users.push(u.id); }))} className={`text-xs px-2 py-0.5 rounded-full border ${editingPlaceholder.defaultAssignment.userIds.includes(u.id) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-700'}`}>{u.firstName} {u.lastName}</button>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setEditingPlaceholder(null)} className="px-3 py-1 text-sm rounded-md border">Cancel</button>
                        <button onClick={handleSavePlaceholder} className="px-3 py-1 text-sm rounded-md bg-primary-600 text-white">Save Role</button>
                    </div>
                </div>
            </Card>
        ) : (
            <Card title="Project Roles" action={<button onClick={() => setEditingPlaceholder({name: '', description: '', defaultAssignment: {roleIds: [], userIds:[], placeholderIds: []}})} className="text-sm font-semibold text-primary-600 flex items-center"><Icon name="plus" className="h-4 w-4 mr-1"/> Add Role</button>}>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Define reusable roles for this project. These can be assigned to tasks and will be filled in with specific people when the project is launched.</p>
                <ul className="space-y-2">
                    {(currentTemplate.definedPlaceholders || []).map(p => (
                        <li key={p.id} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md">
                           <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                                    <p className="text-xs text-slate-500">{p.description}</p>
                                </div>
                                <div className="space-x-1">
                                    <button onClick={() => setEditingPlaceholder(p)} className="p-1.5 rounded-md hover:bg-slate-200"><Icon name="pencil" className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeletePlaceholder(p.id)} className="p-1.5 rounded-md hover:bg-slate-200 text-danger-500"><Icon name="trash" className="h-4 w-4" /></button>
                                </div>
                           </div>
                           {(p.defaultAssignment.roleIds.length > 0 || p.defaultAssignment.userIds.length > 0) &&
                            <div className="text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Default: </span>
                                {p.defaultAssignment.roleIds.map(rid => availablePositions.find(pos => pos.id === rid)?.title).filter(Boolean).join(', ')}
                                {p.defaultAssignment.roleIds.length > 0 && p.defaultAssignment.userIds.length > 0 ? ', ' : ''}
                                {p.defaultAssignment.userIds.map(uid => users.find(u => u.id === uid)).filter(Boolean).map(u => `${u?.firstName} ${u?.lastName}`).join(', ')}
                            </div>}
                        </li>
                    ))}
                     {(currentTemplate.definedPlaceholders || []).length === 0 && <p className="text-center text-sm text-slate-500 py-4">No project roles defined.</p>}
                </ul>
            </Card>
        )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-slate-50 dark:bg-slate-950 z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {template ? 'Edit Project Template' : 'Create New Project Template'}
              </h2>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <Icon name="x-mark" className="h-6 w-6 text-slate-500" />
              </button>
          </div>
          <div className="space-y-4">
            <input type="text" name="name" placeholder="Template Name (e.g., New Employee Onboarding)" value={currentTemplate.name} onChange={handleFieldChange} className="w-full text-lg font-semibold p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:ring-primary-500 focus:border-primary-500"/>
            <textarea name="description" placeholder="Add a description for this template..." value={currentTemplate.description} onChange={handleFieldChange} rows={2} className="w-full text-sm p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:ring-primary-500 focus:border-primary-500"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Applies to Asset Type(s):</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {assetTypeConfigs.map(at => (
                            <button key={at.id} onClick={() => handleAssetTypeChange(at.id)} className={`px-3 py-1 text-sm font-semibold rounded-full border ${currentTemplate.appliesToAssetTypeIds.includes(at.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}>
                                {at.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Applies to Specific Asset(s) (Optional)</label>
                     <p className="text-xs text-slate-500 dark:text-slate-400">If none selected, applies to all assets of the chosen type(s).</p>
                    <div className="h-24 mt-2 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 p-2 space-y-1 bg-white dark:bg-slate-800">
                        {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                            <label key={asset.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                <input
                                    type="checkbox"
                                    checked={currentTemplate.appliesToAssetIds?.includes(asset.id)}
                                    onChange={() => handleAppliesToAssetIdsChange(asset.id)}
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                                />
                                <span>{asset.name}</span>
                            </label>
                        )) : <p className="text-sm text-slate-500 text-center py-4">Select an asset type to see specific assets.</p>}
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
            <nav className="-mb-px flex space-x-6">
                 {tabs.map(tab => (
                    <button 
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300'}`}
                    >
                        {tab.label}
                    </button>
                 ))}
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'plan' && (
             <ProjectPlanTab
                currentTemplate={currentTemplate}
                setCurrentTemplate={setCurrentTemplate}
                onReorderTasks={onReorderTasks}
                users={users}
                assetTypeConfigs={assetTypeConfigs}
                onEditTask={handleEditTask}
                onAddTask={(type) => { handleAddTask(type) }}
             />
           )}
           {activeTab === 'roles' && renderRolesTab()}
           {activeTab === 'assignment' && (
            <div className="p-6 space-y-4">
                 <fieldset className="space-y-4">
                    <legend className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Asset Assignment Rule</legend>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Determines which assets are included when a project is launched.</p>
                     <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="primary_only" name="assetAssignmentRuleType" type="radio" value="primary_only" checked={currentTemplate.assetAssignmentRule.type === 'primary_only'} onChange={handleFieldChange} className="h-4 w-4 text-primary-600" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="primary_only" className="font-medium text-gray-900 dark:text-gray-100">Primary Asset Only</label><p className="text-gray-500 dark:text-gray-400">Project applies only to the asset selected at launch.</p></div></div>
                     <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="primary_district" name="assetAssignmentRuleType" type="radio" value="primary_district" checked={currentTemplate.assetAssignmentRule.type === 'primary_district'} onChange={handleFieldChange} className="h-4 w-4 text-primary-600" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="primary_district" className="font-medium text-gray-900 dark:text-gray-100">Primary Asset's Entire District</label><p className="text-gray-500 dark:text-gray-400">Automatically includes all assets in the primary asset's district.</p></div></div>
                     <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="manual_list" name="assetAssignmentRuleType" type="radio" value="manual_list" checked={currentTemplate.assetAssignmentRule.type === 'manual_list'} onChange={handleFieldChange} className="h-4 w-4 text-primary-600" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="manual_list" className="font-medium text-gray-900 dark:text-gray-100">Manually Pre-defined List</label><p className="text-gray-500 dark:text-gray-400">Project always applies to a specific list of assets.</p></div></div>
                 </fieldset>
                 {currentTemplate.assetAssignmentRule.type === 'manual_list' && (
                    <div className="pl-8 pt-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Assets</label>
                        <div className="mt-2 h-48 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 p-2 space-y-1">
                            {assets.map(asset => (
                                <label key={asset.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <input type="checkbox" onChange={() => handleManualAssetListChange(asset.id)} checked={currentTemplate.assetAssignmentRule.assetIds?.includes(asset.id)} className="h-4 w-4 rounded" />
                                    <span>{asset.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
           )}
            {activeTab === 'access' && (
             <div className="p-6 space-y-4">
                 <h3 className="font-semibold text-slate-800 dark:text-slate-200">Who can launch this template?</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-2">By Position</h4>
                         <div className="h-48 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 p-2 space-y-1">
                            {availablePositions.map(pos => (
                                <label key={pos.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <input type="checkbox" onChange={() => handleAccessChange('position', pos.id)} checked={currentTemplate.accessPermissions.positionIds.includes(pos.id)} className="h-4 w-4 rounded" />
                                    <span>{pos.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-2">By Specific User</h4>
                        <div className="h-48 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 p-2 space-y-1">
                            {users.map(user => (
                                <label key={user.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <input type="checkbox" onChange={() => handleAccessChange('user', user.id)} checked={currentTemplate.accessPermissions.userIds.includes(user.id)} className="h-4 w-4 rounded" />
                                    <span>{user.firstName} {user.lastName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>
           )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600" disabled={isSaving}>Cancel</button>
          <button onClick={handleSaveTemplate} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-32 flex justify-center items-center" disabled={isSaving}>
            {isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save Template'}
          </button>
        </div>
      </div>
      
      {isTaskModalOpen && editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => {setIsTaskModalOpen(false); setEditingTask(null);}}
          onSave={handleSaveTask}
          templateAssetTypeIds={currentTemplate.appliesToAssetTypeIds}
          assetTypeConfigs={assetTypeConfigs}
          projectTemplates={projectTemplates}
          allTasks={currentTemplate.tasks}
          users={users}
          definedPlaceholders={currentTemplate.definedPlaceholders || []}
        />
      )}
    </>
  );
};
