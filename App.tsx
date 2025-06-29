import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import UserManagement from './pages/UserManagement';
import AdminUserProfile from './pages/AdminUserProfile';
import { AssetManagement } from './pages/AssetManagement';
import LoginPage from './pages/LoginPage';
import SmDashboard from './pages/SmDashboard';
import ShiftPlaybook from './pages/ShiftPlaybook';
import { AccessControlHub } from './pages/AccessControl';
import MyProfile from './pages/MyProfile';
import TemplatesBuilder from './pages/TemplatesBuilder';
import ActionCenter from './pages/ActionCenter';
import University from './pages/University';
import CurriculumStudio from './pages/CurriculumStudio';
import { MOCK_USERS, MOCK_ASSETS, MOCK_ACCESS_CONTROL_CONFIGS, MOCK_SHIFT_PLAYBOOK_LOG, MOCK_ACTION_ITEMS, MOCK_PROJECT_TEMPLATES, MOCK_ACTIVE_PROJECTS, MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_CERTIFICATIONS, MOCK_LEARNING_PATHS, MOCK_RECURRING_TASK_TEMPLATES, MOCK_RECURRING_PROJECT_TEMPLATES } from './constants';
import { User, Asset, PlaybookLog, AssetTypeConfig, ActionItem, ProjectTemplate, TemplateTask, ActiveProject, ActiveTask, TaskAssignment, UniversityCourse, UserEnrollment, UserCertification, LearningPath, RelativeDueDate, RecurringTaskTemplate, RecurringProjectTemplate } from './types';
import { produce } from 'immer';
import { addDays, addWeeks, addMonths } from 'date-fns';


const resolveDueDate = (baseDate: Date, relativeDueDate: RelativeDueDate): Date => {
    // For this implementation, we assume Project End and Previous Step Completion resolve to the same as Project Start
    // A real implementation would require more complex logic based on project graph.
    let date = new Date(baseDate);
    const { value, unit, direction } = relativeDueDate;
    
    const amount = direction === 'After' ? value : -value;

    switch(unit) {
        case 'Days':
            date = addDays(date, amount);
            break;
        case 'Weeks':
            date = addWeeks(date, amount);
            break;
        case 'Months':
            date = addMonths(date, amount);
            break;
    }
    return date;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Data State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [playbookLog, setPlaybookLog] = useState<PlaybookLog>(MOCK_SHIFT_PLAYBOOK_LOG);
  const [actionItems, setActionItems] = useState<ActionItem[]>(MOCK_ACTION_ITEMS);
  const [assetTypeConfigs, setAssetTypeConfigs] = useState<AssetTypeConfig[]>(MOCK_ACCESS_CONTROL_CONFIGS);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>(MOCK_PROJECT_TEMPLATES);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>(MOCK_ACTIVE_PROJECTS);
  
  // New University Data State
  const [universityCourses, setUniversityCourses] = useState<UniversityCourse[]>(MOCK_COURSES);
  const [userEnrollments, setUserEnrollments] = useState<UserEnrollment[]>(MOCK_ENROLLMENTS);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>(MOCK_CERTIFICATIONS);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(MOCK_LEARNING_PATHS);
  
  // New Recurring Templates State
  const [recurringTaskTemplates, setRecurringTaskTemplates] = useState<RecurringTaskTemplate[]>(MOCK_RECURRING_TASK_TEMPLATES);
  const [recurringProjectTemplates, setRecurringProjectTemplates] = useState<RecurringProjectTemplate[]>(MOCK_RECURRING_PROJECT_TEMPLATES);


  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [initialAutoCollapseDone, setInitialAutoCollapseDone] = useState(false);
  
  const handleLogin = (emailOrUsername: string, pass: string): boolean => {
    const loginIdentifier = emailOrUsername.toLowerCase();
    const user = users.find(u => 
        (u.email.toLowerCase() === loginIdentifier || u.username.toLowerCase() === loginIdentifier) 
        && u.password === pass
    );
    if (user) {
      setCurrentUser(user);
      if (user.assignments.length > 0) {
        setSelectedAssetId(user.assignments[0].assetId);
      } else {
          // If user has no assignments, select the first available asset for demo purposes
          if(assets.length > 0) setSelectedAssetId(assets[0].id);
      }
      setIsAuthenticated(true);
      setCurrentPage('Dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedAssetId(null);
    setEditingUserId(null);
    setSidebarCollapsed(false);
    setInitialAutoCollapseDone(false);
  };
  
  const handleNavigate = (page: string, contextId: string | null = null) => {
    if (isAuthenticated && !isSidebarCollapsed && !initialAutoCollapseDone) {
       setSidebarCollapsed(true);
       setInitialAutoCollapseDone(true);
    }
    
    setCurrentPage(page);

    if (page === 'AdminUserProfile') {
      setEditingUserId(contextId);
    }
    if (page !== 'AdminUserProfile') {
      setEditingUserId(null);
    }
    setMobileSidebarOpen(false);
  };
  
  const handleUpdateUser = (updatedUserData: Partial<User> & { id: string }, oldPassword?: string) => {
    setUsers(produce(draft => {
        const userIndex = draft.findIndex(u => u.id === updatedUserData.id);
        if (userIndex !== -1) {
            
            // Handle password change validation for non-admins
            if (oldPassword) {
                if (draft[userIndex].password !== oldPassword) {
                    throw new Error("Current password does not match.");
                }
            }

            // Update user object
            const updatedUser = { ...draft[userIndex], ...updatedUserData };
            draft[userIndex] = updatedUser;

            // Update current user if they are the one being changed
            if (currentUser?.id === updatedUser.id) {
                setCurrentUser(updatedUser);
            }
        }
    }));
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers(prevUsers => {
      const isNewUser = !prevUsers.some(u => u.id === updatedUser.id);
      if (isNewUser) {
        return [...prevUsers, { ...updatedUser, id: `user-${Date.now()}` }];
      } else {
        return prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
      }
    });
    // Concurrently update the currentUser state if the edited user is the one logged in.
    // This ensures UI components like the TopBar reflect changes immediately.
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    handleNavigate('UserManagement');
  };
  
  const handleCreateNewUser = () => {
    handleNavigate('AdminUserProfile', `new-user-${Date.now()}`);
  }

  // --- Asset CRUD Handlers ---
  const handleCreateAsset = (newAsset: Omit<Asset, 'id' | 'status'>) => {
    const assetWithId = { ...newAsset, id: `asset-${Date.now()}`, status: 'Active' as const };
    setAssets(prevAssets => [...prevAssets, assetWithId]);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prevAssets => prevAssets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset));
    
    // Concurrency fix: ensure asset name changes propagate everywhere
    setUsers(produce(draft => {
        draft.forEach(user => {
            user.assignments.forEach(assignment => {
                if (assignment.assetId === updatedAsset.id) {
                    assignment.assetName = updatedAsset.name;
                }
            });
        });
    }));

     if (currentUser) {
        setCurrentUser(produce(currentUser, draft => {
            draft.assignments.forEach(assignment => {
                if (assignment.assetId === updatedAsset.id) {
                    assignment.assetName = updatedAsset.name;
                }
            });
        }));
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
    setUsers(prevUsers => prevUsers.map(user => ({
      ...user,
      assignments: user.assignments.filter(assign => assign.assetId !== assetId)
    })));
  };

  // --- Access Control Config Handlers ---
  const handleSaveAssetTypeConfig = (updatedConfig: AssetTypeConfig) => {
    setAssetTypeConfigs(produce(draft => {
      const index = draft.findIndex(c => c.id === updatedConfig.id);
      if (index !== -1) {
        draft[index] = updatedConfig;
      } else {
        draft.push(updatedConfig);
      }
    }));
  };

  const handleDeleteAssetTypeConfig = (configId: string) => {
      if (assets.some(a => a.assetTypeId === configId)) {
          alert("Cannot delete this asset type. It is currently being used by one or more assets.");
          return;
      }
      setAssetTypeConfigs(prev => prev.filter(c => c.id !== configId));
  };


  const handlePlaybookItemToggle = (entryId: string, newCompletedState: boolean) => {
    setPlaybookLog(prevLog => {
        const newEntries = prevLog.entries.map(entry => {
            if (entry.id === entryId) {
                const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System';
                return {
                    ...entry,
                    isCompleted: newCompletedState,
                    completedBy: newCompletedState ? fullName : undefined,
                    completedAt: newCompletedState ? new Date().toISOString() : undefined,
                };
            }
            return entry;
        });
        return { ...prevLog, entries: newEntries };
    });
  };
  
  const handleToggleActionItem = (itemId: string) => {
      setActionItems(produce(draft => {
          const item = draft.find(i => i.id === itemId);
          if (item) {
              if (item.status === 'Completed') {
                  item.status = 'Pending';
                  item.completedAt = undefined;
              } else {
                  item.status = 'Completed';
                  item.completedAt = new Date().toISOString();
              }
          }
      }));
  };

  const handleCreateActionItem = (description: string, dueDate: string) => {
    if (!currentUser) return;
    const newItem: ActionItem = {
      id: `action-${Date.now()}`,
      description,
      dueDate,
      source: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'Pending',
      sourceType: 'standalone',
      attachmentCount: 0,
      commentCount: 0,
      sopLink: undefined,
    };
    setActionItems(prev => [...prev, newItem]);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prevState => !prevState);
    // Any manual interaction with the sidebar should prevent further auto-collapsing.
    if (!initialAutoCollapseDone) {
        setInitialAutoCollapseDone(true);
    }
  };
  
    // --- Templates Builder Handlers ---
  const handleSaveProjectTemplate = (template: ProjectTemplate) => {
    setProjectTemplates(produce(draft => {
      const index = draft.findIndex(t => t.id === template.id);
      if (index !== -1) {
        draft[index] = template;
      } else {
        draft.push(template);
      }
    }));
  };

  const handleDeleteProjectTemplate = (templateId: string) => {
    setProjectTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleDuplicateProjectTemplate = (templateId: string) => {
    const original = projectTemplates.find(t => t.id === templateId);
    if(original) {
      const newTemplate = produce(original, draft => {
        draft.id = `template-${Date.now()}`;
        draft.name = `${original.name} (Copy)`;
        draft.lastUpdated = new Date().toISOString();
      });
      setProjectTemplates(prev => [...prev, newTemplate]);
    }
  };

  const handleReorderTemplateTasks = (templateId: string, reorderedTasks: TemplateTask[]) => {
      setProjectTemplates(produce(draft => {
        const template = draft.find(t => t.id === templateId);
        if (template) {
          template.tasks = reorderedTasks;
        }
      }));
  };

  // --- Recurring Template Handlers ---
  const handleSaveRecurringTaskTemplate = (template: RecurringTaskTemplate) => {
      setRecurringTaskTemplates(produce(draft => {
          const index = draft.findIndex(t => t.id === template.id);
          if (index > -1) {
              draft[index] = template;
          } else {
              draft.push(template);
          }
      }));
  };
  
  const handleSaveRecurringProjectTemplate = (template: RecurringProjectTemplate) => {
      setRecurringProjectTemplates(produce(draft => {
          const index = draft.findIndex(t => t.id === template.id);
          if (index > -1) {
              draft[index] = template;
          } else {
              draft.push(template);
          }
      }));
  };

  // --- Action Center Handlers ---
    const handleLaunchProject = (
        projectName: string,
        templateId: string,
        primaryAssetId: string,
        placeholderAssignments: Record<string, TaskAssignment>
    ) => {
        const template = projectTemplates.find(t => t.id === templateId);
        if (!template || !currentUser) return;
        const launchDate = new Date();

        const newProject: ActiveProject = {
            id: `proj-${Date.now()}`,
            name: projectName,
            templateId: template.id,
            primaryAssetId: primaryAssetId,
            status: 'On Track',
            launchedAt: launchDate.toISOString(),
            launchedBy: currentUser.id,
            tasks: template.tasks.map((t): ActiveTask => {
                 const finalAssignment: TaskAssignment = produce(t.assignment, draft => {
                    const resolvedUserIds = new Set(draft.userIds);
                    const resolvedRoleIds = new Set(draft.roleIds);

                    // Iterate over the placeholder IDs in the task's assignment
                    (draft.placeholderIds || []).forEach(pId => {
                        // Get the user's resolution for this placeholder from the launch modal
                        const resolution = placeholderAssignments[pId];
                        if (resolution) {
                            resolution.userIds.forEach(uid => resolvedUserIds.add(uid));
                            resolution.roleIds.forEach(rid => resolvedRoleIds.add(rid));
                        }
                    });

                    draft.userIds = Array.from(resolvedUserIds);
                    draft.roleIds = Array.from(resolvedRoleIds);
                    // The placeholders are now resolved, so we can clear the placeholderIds for the active task
                    draft.placeholderIds = []; 
                });
                
                const absoluteDueDate = resolveDueDate(launchDate, t.dueDate);

                return {
                    ...t,
                    status: 'Pending',
                    assignment: finalAssignment,
                    absoluteDueDate: absoluteDueDate.toISOString(),
                    completedAt: undefined,
                    sourceType: t.type === 'Recurring Task' ? 'recurring_task' : 'project',
                    attachmentCount: t.attachmentCount || 0,
                    commentCount: t.commentCount || 0,
                    sopLink: t.sopLink,
                };
            })
        };
        setActiveProjects(prev => [...prev, newProject]);
    };

  const handleToggleActiveTaskStatus = (projectId: string, taskId: string) => {
      setActiveProjects(produce(draft => {
          const project = draft.find(p => p.id === projectId);
          if (project) {
              const task = project.tasks.find(t => t.id === taskId);
              if (task) {
                  task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
                  if (task.status === 'Completed' && currentUser) {
                    task.completedAt = new Date().toISOString();
                    task.completedBy = `${currentUser.firstName} ${currentUser.lastName}`;
                  } else {
                    task.completedAt = undefined;
                    task.completedBy = undefined;
                  }
              }
          }
      }));
  }

  // --- University & Integration Handlers ---
  const handleCourseCompletion = (courseId: string, userId: string) => {
      if (!currentUser || currentUser.id !== userId) return; // Ensure the action is for the logged in user

      const course = universityCourses.find(c => c.id === courseId);
      if (!course) return;

      setUserEnrollments(produce(draft => {
          let enrollment = draft.find(e => e.userId === userId && e.courseId === courseId);
          if (enrollment) {
              enrollment.status = 'Completed';
              enrollment.progress = 100;
              enrollment.completionDate = new Date().toISOString();
          } else {
              // If no enrollment exists, create one
              draft.push({
                  id: `enroll-${Date.now()}`,
                  userId,
                  courseId,
                  status: 'Completed',
                  progress: 100,
                  completionDate: new Date().toISOString(),
              });
          }
      }));

      // Issue certification if applicable
      if (course.recertificationRule) {
          const issueDate = new Date();
          const expirationDate = new Date(issueDate);
          const { interval, unit } = course.recertificationRule;
          if (unit === 'year') expirationDate.setFullYear(expirationDate.getFullYear() + interval);
          if (unit === 'month') expirationDate.setMonth(expirationDate.getMonth() + interval);
          
          setUserCertifications(produce(draft => {
              draft.push({
                  id: `cert-${Date.now()}`,
                  userId,
                  courseId,
                  issueDate: issueDate.toISOString(),
                  expirationDate: expirationDate.toISOString(),
              })
          }));
      }

      // ** ACTION CENTER INTEGRATION **
      // Find and complete the corresponding Learning Module task in active projects
      setActiveProjects(produce(draft => {
          draft.forEach(project => {
              project.tasks.forEach(task => {
                  if (task.type === 'Learning Module' && task.lmsCourseIds.includes(courseId)) {
                      // Check if the user is assigned to this task
                      const isUserAssigned = task.assignment.userIds.includes(userId);
                      const userPositions = currentUser.assignments.map(a => a.positionId);
                      const isRoleAssigned = task.assignment.roleIds.some(roleId => userPositions.includes(roleId));

                      if ((isUserAssigned || isRoleAssigned) && task.status !== 'Completed') {
                          task.status = 'Completed';
                          task.completedAt = new Date().toISOString();
                          task.completedBy = `${currentUser.firstName} ${currentUser.lastName}`;
                      }
                  }
              });
          });
      }));
      
      alert(`Course "${course.title}" completed! Check the Action Center for any updated project tasks.`);
  };

  const handleSaveCourse = (course: UniversityCourse) => {
    setUniversityCourses(produce(draft => {
      const index = draft.findIndex(c => c.id === course.id);
      if (index !== -1) {
        draft[index] = course;
      } else {
        draft.push(course);
      }
    }));
  };

  const handleSaveLearningPath = (path: LearningPath) => {
    setLearningPaths(produce(draft => {
      const index = draft.findIndex(p => p.id === path.id);
      if (index !== -1) {
        draft[index] = path;
      } else {
        draft.push(path);
      }
    }));
  };


  useEffect(() => {
    if (isAuthenticated && currentPage === 'Dashboard' && !initialAutoCollapseDone) {
      const timer = setTimeout(() => {
        setSidebarCollapsed(true);
        setInitialAutoCollapseDone(true); 
      }, 3000); // 3 seconds delay
      
      // Cleanup function to clear the timer if the component unmounts
      // or dependencies change before the timer fires.
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentPage, initialAutoCollapseDone]);

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const userAssignedAssets = assets.filter(asset => 
    currentUser.assignments.some(a => a.assetId === asset.id)
  );
  
  const getAssetTypeById = (typeId: string) => assetTypeConfigs.find(c => c.id === typeId);
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const renderPage = () => {
    const PlaceholderPage = ({pageName}: {pageName: string}) => (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{pageName}</h1>
        <p className="mt-2 text-slate-500">This page is under construction.</p>
      </div>
    );
    
    switch (currentPage) {
      case 'Dashboard':
      case 'Hotel Dashboard':
        return <SmDashboard currentUser={currentUser} selectedAsset={selectedAsset} actionItems={actionItems} onToggleActionItem={handleToggleActionItem}/>;
      case 'Action Center':
        return <ActionCenter 
                    projects={activeProjects}
                    templates={projectTemplates}
                    currentUser={currentUser}
                    assets={assets}
                    users={users}
                    onLaunchProject={handleLaunchProject}
                    onToggleTask={handleToggleActiveTaskStatus}
                    assetTypeConfigs={assetTypeConfigs}
                    actionItems={actionItems}
                    onToggleActionItem={handleToggleActionItem}
                    onCreateActionItem={handleCreateActionItem}
                    recurringTaskTemplates={recurringTaskTemplates}
                    recurringProjectTemplates={recurringProjectTemplates}
                    onSaveRecurringTaskTemplate={handleSaveRecurringTaskTemplate}
                    onSaveRecurringProjectTemplate={handleSaveRecurringProjectTemplate}
                />;
      case 'Shift Playbook':
        return <ShiftPlaybook log={playbookLog} onToggleItem={handlePlaybookItemToggle} />;
      case 'UserManagement':
        return <UserManagement users={users} onNavigate={handleNavigate} onCreateUser={handleCreateNewUser} userCertifications={userCertifications} />;
      case 'AssetManagement':
        return <AssetManagement
                  assets={assets}
                  assetTypes={assetTypeConfigs}
                  onCreateAsset={handleCreateAsset}
                  onUpdateAsset={handleUpdateAsset}
                  onDeleteAsset={handleDeleteAsset}
                />;
       case 'AccessControlHub':
        return <AccessControlHub 
                  configs={assetTypeConfigs}
                  onSaveConfig={handleSaveAssetTypeConfig}
                  onDeleteConfig={handleDeleteAssetTypeConfig}
                />;
      case 'Templates Builder':
        return <TemplatesBuilder 
                  templates={projectTemplates}
                  assetTypes={assetTypeConfigs}
                  assetTypeConfigs={assetTypeConfigs}
                  projectTemplates={projectTemplates}
                  onSave={handleSaveProjectTemplate}
                  onDelete={handleDeleteProjectTemplate}
                  onDuplicate={handleDuplicateProjectTemplate}
                  onReorderTasks={handleReorderTemplateTasks}
                  users={users}
                  assets={assets}
                />;
      case 'MyProfile':
        return <MyProfile currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'AdminUserProfile':
        const userToEdit = users.find(u => u.id === editingUserId);
        return <AdminUserProfile 
                  userToEdit={userToEdit}
                  isNewUser={!users.some(u => u.id === editingUserId)}
                  assets={assets}
                  assetTypeConfigs={assetTypeConfigs}
                  onSave={handleSaveUser}
                  onUpdateUser={handleUpdateUser}
                  onCancel={() => handleNavigate('UserManagement')} 
                  userEnrollments={userEnrollments.filter(e => e.userId === editingUserId)}
                  userCertifications={userCertifications.filter(c => c.userId === editingUserId)}
                  allCourses={universityCourses}
                />;
      case 'Employee Handbook':
        return <PlaceholderPage pageName={currentPage} />;
      case 'University':
        return <University 
                  courses={universityCourses}
                  enrollments={userEnrollments}
                  certifications={userCertifications}
                  learningPaths={learningPaths}
                  currentUser={currentUser}
                  onCourseComplete={(courseId) => handleCourseCompletion(courseId, currentUser.id)}
                  users={users}
                />;
      case 'Curriculum Studio':
        return <CurriculumStudio 
                  courses={universityCourses}
                  learningPaths={learningPaths}
                  templates={projectTemplates}
                  assetTypeConfigs={assetTypeConfigs}
                  onSaveCourse={handleSaveCourse}
                  onSaveLearningPath={handleSaveLearningPath}
               />
      default:
        return <PlaceholderPage pageName={currentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        selectedAssetId={selectedAssetId}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        assetTypeConfig={getAssetTypeById(assets.find(a => a.id === selectedAssetId)?.assetTypeId || '')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          currentUser={currentUser}
          assignedAssets={userAssignedAssets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;