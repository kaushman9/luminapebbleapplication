


import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icons';
import { ProjectTemplate, User, Asset, TaskAssignment, AssetTypeConfig } from '../../types';
import { Card } from '../ui/Card';
import { produce } from 'immer';

interface LaunchProjectModalProps {
    show: boolean;
    onClose: () => void;
    templates: ProjectTemplate[];
    currentUser: User;
    assets: Asset[];
    users: User[];
    assetTypeConfigs: AssetTypeConfig[];
    onLaunch: (projectName: string, templateId: string, primaryAssetId: string, placeholderAssignments: Record<string, TaskAssignment>) => void;
}

export const LaunchProjectModal: React.FC<LaunchProjectModalProps> = ({ show, onClose, templates, currentUser, assets, onLaunch, users, assetTypeConfigs }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState('');
    const [primaryAssetId, setPrimaryAssetId] = useState<string | null>(null);
    const [placeholderAssignments, setPlaceholderAssignments] = useState<Record<string, TaskAssignment>>({});
    const [step, setStep] = useState(1);
    
    const selectedAsset = assets.find(a => a.id === primaryAssetId);

    const availableTemplates = useMemo(() => {
        if (!selectedAsset) return [];
        
        return templates.filter(template => {
            // Check if user has permission to launch
            const userPositions = currentUser.assignments.map(a => a.positionId);
            const canLaunchByUser = template.accessPermissions.userIds.includes(currentUser.id);
            const canLaunchByPosition = template.accessPermissions.positionIds.some(posId => userPositions.includes(posId));
            const isAdmin = currentUser.globalPermissions?.includes('ACCESS_ADMIN_PANEL');
            const hasLaunchPermission = canLaunchByUser || canLaunchByPosition || isAdmin;
            
            if (!hasLaunchPermission) return false;

            // Check if template is applicable to the selected asset
            const appliesToType = template.appliesToAssetTypeIds.includes(selectedAsset.assetTypeId);
            const appliesToAsset = template.appliesToAssetIds?.includes(selectedAsset.id) ?? false;
            
            // If appliesToAssetIds is populated, it's an exclusive list. Otherwise, check type.
            if(template.appliesToAssetIds && template.appliesToAssetIds.length > 0) {
                return appliesToAsset;
            }

            return appliesToType;
        });
    }, [templates, currentUser, selectedAsset]);
    
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    
    useEffect(() => {
        // When the selected template changes, pre-populate assignments from its defaults
        if (selectedTemplate?.definedPlaceholders) {
            const initialAssignments: Record<string, TaskAssignment> = {};
            selectedTemplate.definedPlaceholders.forEach(p => {
                initialAssignments[p.id] = p.defaultAssignment;
            });
            setPlaceholderAssignments(initialAssignments);
        } else {
            setPlaceholderAssignments({});
        }
    }, [selectedTemplate]);

    const availablePositions = useMemo(() => {
        if (!selectedAsset) return [];
        const config = assetTypeConfigs.find(c => c.id === selectedAsset.assetTypeId);
        return config ? config.positions : [];
    }, [selectedAsset, assetTypeConfigs]);

    const handleSelectAsset = (assetId: string) => {
        setPrimaryAssetId(assetId);
        setStep(2);
    }

    const handleSelectTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplateId(templateId);
            setProjectName(template.name); // Pre-fill name
            setStep(3);
        }
    };
    
    const handlePlaceholderAssignmentChange = (placeholderId: string, type: 'user' | 'role', id: string) => {
        setPlaceholderAssignments(produce(draft => {
            if (!draft[placeholderId]) {
                draft[placeholderId] = { userIds: [], roleIds: [], placeholderIds: [] };
            }
            const list = type === 'user' ? draft[placeholderId].userIds : draft[placeholderId].roleIds;
            const index = list.indexOf(id);
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(id);
            }
        }));
    };
    
    const handleLaunchProject = () => {
        if (projectName && selectedTemplateId && primaryAssetId) {
            onLaunch(projectName, selectedTemplateId, primaryAssetId, placeholderAssignments);
        }
    };

    const reset = () => {
        setStep(1);
        setPrimaryAssetId(null);
        setSelectedTemplateId(null);
        setProjectName('');
        setPlaceholderAssignments({});
    }

    const handleClose = () => {
        reset();
        onClose();
    }

    return (
        <Modal show={show} onClose={handleClose} title="Launch New Project" size="4xl">
            <div className="min-h-[60vh] flex flex-col">
                {/* Step 1: Select Asset */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Step 1: Choose the Primary Asset</h3>
                        <p className="text-sm text-slate-500">For which asset are you launching this project?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    className="text-left h-full w-full"
                                    onClick={() => handleSelectAsset(asset.id)}
                                >
                                    <Card className="hover:border-primary-500 hover:shadow-lg transition-all h-full p-4">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">{asset.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{asset.location.city}, {asset.location.state}</p>
                                    </Card>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Template */}
                {step === 2 && (
                     <div className="space-y-4">
                         <button onClick={() => setStep(1)} className="text-sm font-semibold text-primary-600 hover:text-primary-500 flex items-center">
                            <Icon name="arrow-left" className="h-4 w-4 mr-1"/>
                            Back to Asset Selection
                        </button>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Step 2: Choose a Template</h3>
                        <p className="text-sm text-slate-500">Showing templates applicable for <span className="font-bold">{selectedAsset?.name}</span>.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                            {availableTemplates.map(template => (
                                <button
                                    key={template.id}
                                    className="text-left h-full w-full"
                                    onClick={() => handleSelectTemplate(template.id)}
                                >
                                    <Card className="hover:border-primary-500 hover:shadow-lg transition-all h-full p-4">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">{template.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{template.description}</p>
                                    </Card>
                                </button>
                            ))}
                            {availableTemplates.length === 0 && (
                                <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                                    <p className="text-slate-500">No available templates for this asset and your permissions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Configure */}
                {step === 3 && selectedTemplate && (
                    <div className="space-y-6">
                         <button onClick={() => { setStep(2); setSelectedTemplateId(null); }} className="text-sm font-semibold text-primary-600 hover:text-primary-500 flex items-center">
                            <Icon name="arrow-left" className="h-4 w-4 mr-1"/>
                            Back to Template Selection
                        </button>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Step 3: Name and Launch</h3>
                        <p className="text-sm text-slate-500">Confirm the details and launch your new project.</p>
                        
                        <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Name</label>
                            <input 
                                type="text" 
                                id="projectName"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="mt-1 block w-full text-lg font-semibold p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500"
                                required 
                            />
                        </div>

                        {(selectedTemplate.definedPlaceholders?.length || 0) > 0 && (
                            <Card title="Project Assignments" bodyClassName="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">Assign people or roles to the placeholders defined in this template. Defaults have been pre-selected.</p>
                                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                                {selectedTemplate.definedPlaceholders?.map(placeholder => (
                                    <div key={placeholder.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{placeholder.name}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{placeholder.description}</p>
                                        <div className="space-y-4">
                                            <div>
                                                <h6 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Assign Person</h6>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {users.map(user => (
                                                        <button key={user.id} type="button" onClick={() => handlePlaceholderAssignmentChange(placeholder.id, 'user', user.id)}
                                                            className={`px-3 py-1 text-sm font-semibold rounded-full border ${placeholderAssignments[placeholder.id]?.userIds.includes(user.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}
                                                        >
                                                            {user.firstName} {user.lastName}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Assign Position</h6>
                                                 <div className="flex flex-wrap gap-2 mt-2">
                                                    {availablePositions.map(pos => (
                                                         <button key={pos.id} type="button" onClick={() => handlePlaceholderAssignmentChange(placeholder.id, 'role', pos.id)}
                                                             className={`px-3 py-1 text-sm font-semibold rounded-full border ${placeholderAssignments[placeholder.id]?.roleIds.includes(pos.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}
                                                         >
                                                             {pos.title}
                                                         </button>
                                                    ))}
                                                 </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </Card>
                        )}
                        
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleLaunchProject}
                                className="flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                                disabled={!projectName}
                            >
                                <Icon name="rocket-launch" className="h-5 w-5 mr-2" />
                                Launch Project
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};