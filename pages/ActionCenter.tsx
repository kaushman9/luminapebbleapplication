import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { ActiveProject, ProjectTemplate, User, Asset, TaskAssignment, AssetTypeConfig, ActionItem, RecurringTaskTemplate, RecurringProjectTemplate, DisplayTask } from '../types';
import { LaunchProjectModal } from '../components/action-center/LaunchProjectModal';
import { ActiveProjectView } from '../components/action-center/ActiveProjectView';
import { CreateTaskModal } from '../components/action-center/CreateTaskModal';
import { Icon } from '../components/ui/Icons';
import { Dropdown, DropdownItem } from '../components/ui/Dropdown';
import { WorkspaceView } from '../components/action-center/views/WorkspaceView';
import { RecurringTemplatesView } from '../components/action-center/views/RecurringTemplatesView';
import { AllProjectsView } from '../components/action-center/views/AllProjectsView';
import { NewRecurringTaskModal } from '../components/action-center/modals/NewRecurringTaskModal';
import { NewRecurringProjectModal } from '../components/action-center/modals/NewRecurringProjectModal';

interface ActionCenterProps {
    projects: ActiveProject[];
    templates: ProjectTemplate[];
    currentUser: User;
    assets: Asset[];
    users: User[];
    assetTypeConfigs: AssetTypeConfig[];
    actionItems: ActionItem[];
    recurringTaskTemplates: RecurringTaskTemplate[];
    recurringProjectTemplates: RecurringProjectTemplate[];
    onLaunchProject: (projectName: string, templateId: string, primaryAssetId: string, placeholderAssignments: Record<string, TaskAssignment>) => void;
    onToggleTask: (projectId: string, taskId: string) => void;
    onToggleActionItem: (itemId: string) => void;
    onCreateActionItem: (description: string, dueDate: string) => void;
    onSaveRecurringTaskTemplate: (template: RecurringTaskTemplate) => void;
    onSaveRecurringProjectTemplate: (template: RecurringProjectTemplate) => void;
}

type ActionCenterView = 'workspace' | 'recurring' | 'projects';

const ActionCenter: React.FC<ActionCenterProps> = (props) => {
    const { projects, templates, currentUser, assets, onLaunchProject, users, assetTypeConfigs, actionItems, onCreateActionItem } = props;
    
    const [activeView, setActiveView] = useState<ActionCenterView>('workspace');
    const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ActiveProject | null>(null);

    // Modal States
    const [modal, setModal] = useState<string | null>(null);
    const [editingRecurringTask, setEditingRecurringTask] = useState<RecurringTaskTemplate | null>(null);
    const [editingRecurringProject, setEditingRecurringProject] = useState<RecurringProjectTemplate | null>(null);

    const handleViewProjectDetail = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProjectForDetail(project);
        }
    };
    
    const handleReturnToDashboard = () => {
        setSelectedProjectForDetail(null);
    }

    const handleEditRecurringTask = (template: RecurringTaskTemplate) => {
        setEditingRecurringTask(template);
        setModal('new-recurring-task');
    };
    
    const handleEditRecurringProject = (template: RecurringProjectTemplate) => {
        setEditingRecurringProject(template);
        setModal('new-recurring-project');
    };
    
    const handleCloseModal = () => {
        setModal(null);
        setEditingRecurringTask(null);
        setEditingRecurringProject(null);
    };
    
    const viewConfig = [
        { key: 'workspace', label: 'My Workspace', icon: 'check-circle' as const },
        { key: 'recurring', label: 'Recurring Templates', icon: 'arrow-path' as const },
        { key: 'projects', label: 'All Projects', icon: 'folder' as const },
    ];
    
    const unifiedTasks: DisplayTask[] = useMemo(() => {
        const projectTasks: DisplayTask[] = projects.flatMap(p => {
          const asset = assets.find(a => a.id === p.primaryAssetId);
          return p.tasks.map((t): DisplayTask => ({
            id: `proj-task-${t.id}`,
            title: t.title,
            status: t.status,
            completedAt: t.completedAt,
            assignment: t.assignment,
            absoluteDueDate: t.absoluteDueDate,
            sourceType: t.sourceType,
            projectId: p.id,
            projectName: p.name,
            originalTaskId: t.id,
            isRecurringInstance: t.type === 'Recurring Task',
            assetName: asset?.name,
            attachmentCount: t.attachmentCount,
            commentCount: t.commentCount,
            sopLink: t.sopLink,
          }))
        });
  
        const standaloneTasks: DisplayTask[] = actionItems.map((a): DisplayTask => ({
          id: `action-item-${a.id}`,
          title: a.description,
          status: a.status,
          completedAt: a.completedAt,
          assignment: { userIds: [currentUser.id], roleIds: [], placeholderIds: [] },
          absoluteDueDate: a.dueDate,
          sourceType: a.sourceType,
          originalActionItemId: a.id,
          isRecurringInstance: a.sourceType === 'recurring_task',
          attachmentCount: a.attachmentCount,
          commentCount: a.commentCount,
          sopLink: a.sopLink,
          assetName: 'General', 
        }));
        
        return [...projectTasks, ...standaloneTasks];
      }, [projects, actionItems, currentUser, assets]);


    const renderActiveView = () => {
        switch(activeView) {
            case 'workspace':
                return <WorkspaceView {...props} unifiedTasks={unifiedTasks} onViewProjectDetail={handleViewProjectDetail} />;
            case 'recurring':
                return <RecurringTemplatesView 
                            taskTemplates={props.recurringTaskTemplates} 
                            recurringProjectTemplates={props.recurringProjectTemplates}
                            onNewRecurringTask={() => setModal('new-recurring-task')}
                            onNewRecurringProject={() => setModal('new-recurring-project')}
                            onEditRecurringTask={handleEditRecurringTask}
                            onEditRecurringProject={handleEditRecurringProject}
                            assets={props.assets}
                            users={props.users}
                            assetTypeConfigs={props.assetTypeConfigs}
                            projectTemplates={props.templates}
                        />;
            case 'projects':
                return <AllProjectsView />;
            default:
                return null;
        }
    }

    if (selectedProjectForDetail) {
        return (
            <div className="h-full">
                <button onClick={handleReturnToDashboard} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 mb-4">
                    <Icon name="arrow-left" className="h-4 w-4 mr-2" />
                    Back to Workspace
                </button>
                <ActiveProjectView 
                    project={selectedProjectForDetail} 
                    onToggleTask={props.onToggleTask} 
                    users={users}
                    templates={templates}
                    assetTypeConfigs={assetTypeConfigs}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Page Header & View Toggle */}
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                           Action Center
                        </h1>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                         <Dropdown
                            buttonLabel="Create New..."
                            buttonProps={{
                                className: "flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                            }}
                            icon={<Icon name="plus" className="h-4 w-4 mr-2" />}
                         >
                            <DropdownItem onSelect={() => setModal('new-task')}>New Task</DropdownItem>
                            <DropdownItem onSelect={() => setModal('new-project')}>New Project</DropdownItem>
                             <div className="my-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                            <DropdownItem onSelect={() => setModal('new-recurring-task')}>New Recurring Task</DropdownItem>
                            <DropdownItem onSelect={() => setModal('new-recurring-project')}>New Recurring Project</DropdownItem>
                         </Dropdown>
                    </div>
                </div>

                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {viewConfig.map(view => (
                            <button
                                key={view.key}
                                onClick={() => setActiveView(view.key as ActionCenterView)}
                                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeView === view.key
                                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-600'
                                }`}
                            >
                                <Icon name={view.icon} className="h-5 w-5" />
                                {view.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-2">
                {renderActiveView()}
            </div>
            
            {/* Modals */}
            {modal === 'new-project' && (
                <LaunchProjectModal
                    show={true}
                    onClose={handleCloseModal}
                    templates={templates}
                    currentUser={currentUser}
                    assets={assets}
                    users={users}
                    assetTypeConfigs={assetTypeConfigs}
                    onLaunch={(...args) => {
                      onLaunchProject(...args);
                      handleCloseModal();
                    }}
                />
            )}
             {modal === 'new-task' && (
                <CreateTaskModal
                    onClose={handleCloseModal}
                    onCreate={(desc, date) => {
                        onCreateActionItem(desc, date);
                        handleCloseModal();
                    }}
                />
            )}
            {modal === 'new-recurring-task' && (
                <NewRecurringTaskModal 
                    template={editingRecurringTask || undefined}
                    onClose={handleCloseModal}
                    onSave={props.onSaveRecurringTaskTemplate}
                    assets={props.assets}
                    users={props.users}
                    assetTypeConfigs={props.assetTypeConfigs}
                />
            )}
            {modal === 'new-recurring-project' && (
                <NewRecurringProjectModal 
                    template={editingRecurringProject || undefined}
                    onClose={handleCloseModal}
                    onSave={props.onSaveRecurringProjectTemplate}
                    projectTemplates={props.templates}
                    users={props.users}
                />
            )}

        </div>
    );
};

export default ActionCenter;