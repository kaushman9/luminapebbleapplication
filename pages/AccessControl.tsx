import React, { useState, useMemo, createContext, useContext } from 'react';
import { Card } from '../components/ui/Card';
import { AssetTypeConfig, Position, ConfigurablePage, GranularPermission } from '../types';
import { Icon, iconPaths } from '../components/ui/Icons';
import { produce } from 'immer';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

// --- React Context for state management ---
interface AccessControlContextType {
    configs: AssetTypeConfig[];
    onSaveConfig: (config: AssetTypeConfig) => void;
    onDeleteConfig: (configId: string) => void;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};


// --- Main Hub Component ---
interface AccessControlHubProps {
  configs: AssetTypeConfig[];
  onSaveConfig: (config: AssetTypeConfig) => void;
  onDeleteConfig: (configId: string) => void;
}

const AccessControlHubComponent: React.FC<AccessControlHubProps> = ({ configs, onSaveConfig, onDeleteConfig }) => {
    const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{ type: string | null; data: any }>({ type: null, data: null });

    const handleToggleExpand = (configId: string) => {
        setExpandedConfigId(prevId => prevId === configId ? null : configId);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Access Control
                  </h1>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                      onClick={() => setModalState({ type: 'assetType', data: null })}
                      className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
                      <Icon name="plus" className="h-4 w-4 mr-2" />
                      New Asset Type
                  </button>
                </div>
              </div>

            <Card title="Business Blueprints" bodyClassName="p-0">
                <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {configs.map(config => (
                        <ExpandableAssetTypeRow
                            key={config.id}
                            config={config}
                            isExpanded={expandedConfigId === config.id}
                            onToggleExpand={() => handleToggleExpand(config.id)}
                            onEditAssetType={() => setModalState({type: 'assetType', data: config})}
                        />
                    ))}
                     {configs.length === 0 && (
                        <p className="text-center py-8 text-slate-500">No asset types configured. Add one to begin.</p>
                    )}
                </div>
            </Card>

            <PermissionAssignmentMatrix />

            {modalState.type === 'assetType' && (
                <AssetTypeModal
                    config={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                />
            )}
        </div>
    );
};


// --- Expandable Row Component ---
const ExpandableAssetTypeRow: React.FC<{
    config: AssetTypeConfig;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEditAssetType: () => void;
}> = ({ config, isExpanded, onToggleExpand, onEditAssetType }) => {
    const { onDeleteConfig } = useAccessControl();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'positions' | 'pages'>('positions');
    const [modalState, setModalState] = useState<{ type: string | null, data: any }>({ type: null, data: null });

    const handleDelete = () => {
        if(deletingId) {
            onDeleteConfig(deletingId);
            setDeletingId(null);
        }
    }

    return (
        <div className="transition-all duration-300">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50" onClick={onToggleExpand}>
                <div className="flex items-center">
                    <Icon name="chevron-down" className={`h-5 w-5 mr-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    <Icon name="building-office" className="h-6 w-6 mr-3 text-primary-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{config.name}</span>
                </div>
                <div className="space-x-2" onClick={e => e.stopPropagation()}>
                    <button onClick={onEditAssetType} title="Edit Asset Type" className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-500"><Icon name="pencil" className="h-5 w-5" /></button>
                    <button onClick={() => setDeletingId(config.id)} title="Delete Asset Type" className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-500"><Icon name="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-slate-200/80 dark:border-slate-800">
                   <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('positions')} className={`${activeTab === 'positions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Positions</button>
                            <button onClick={() => setActiveTab('pages')} className={`${activeTab === 'pages' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Pages</button>
                        </nav>
                    </div>
                    <div className="pt-4">
                        {activeTab === 'positions' && (
                             <PositionTable
                                config={config}
                                onAdd={() => setModalState({type: 'position', data: null})}
                                onEdit={(pos) => setModalState({type: 'position', data: pos})}
                            />
                        )}
                        {activeTab === 'pages' && (
                             <PageTable
                                config={config}
                                onAdd={() => setModalState({type: 'page', data: null})}
                                onEdit={(page) => setModalState({type: 'page', data: page})}
                            />
                        )}
                    </div>
                </div>
            </div>

            {deletingId && <ConfirmationModal onConfirm={handleDelete} onCancel={() => setDeletingId(null)} message={`Are you sure you want to delete the asset type "${config.name}"? This action cannot be undone.`} />}

            {modalState.type === 'position' && (
                <PositionModal
                    assetTypeId={config.id}
                    position={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                />
            )}
             {modalState.type === 'page' && (
                <PageModal
                    assetTypeId={config.id}
                    page={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                />
            )}
        </div>
    );
};

// --- Table sub-components ---
const PositionTable: React.FC<{config: AssetTypeConfig, onAdd: () => void, onEdit: (p: Position) => void}> = ({ config, onAdd, onEdit }) => {
    const { onSaveConfig } = useAccessControl();
    const [deletingPos, setDeletingPos] = useState<Position | null>(null);
    const handleDeletePosition = () => {
        if (!deletingPos) return;
        const newConfig = produce(config, draft => {
            draft.positions = draft.positions.filter(p => p.id !== deletingPos.id);
            delete draft.permissionMatrix[deletingPos.id];
        });
        onSaveConfig(newConfig);
        setDeletingPos(null);
    }
    return <div>
         <div className="flex justify-end mb-2"><button onClick={onAdd} className="text-sm font-semibold text-primary-600 hover:text-primary-500 flex items-center"><Icon name="plus" className="h-4 w-4 mr-1"/> Add Position</button></div>
        <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="px-3 py-1.5 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Title</th><th className="px-3 py-1.5"></th></tr></thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200/80 dark:divide-slate-800">
                {config.positions.map(pos => <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-3 py-1.5 font-semibold text-sm text-slate-800 dark:text-slate-100">{pos.title}</td><td className="px-3 py-1.5 text-right space-x-1"><button title="Edit Position" onClick={() => onEdit(pos)} className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Icon name="pencil" className="h-4 w-4"/></button><button title="Delete Position" onClick={() => setDeletingPos(pos)} className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-500"><Icon name="trash" className="h-4 w-4"/></button></td></tr>)}
                {config.positions.length === 0 && <tr><td colSpan={2} className="text-center py-6 text-slate-500 dark:text-slate-400">No positions configured for this asset type.</td></tr>}
            </tbody>
        </table>
         {deletingPos && <ConfirmationModal onConfirm={handleDeletePosition} onCancel={() => setDeletingPos(null)} message={`Are you sure you want to delete the position "${deletingPos.title}"?`} />}
    </div>;
};

const PageTable: React.FC<{config: AssetTypeConfig, onAdd: () => void, onEdit: (p: ConfigurablePage) => void}> = ({ config, onAdd, onEdit}) => {
    const { onSaveConfig } = useAccessControl();
    const [deletingPage, setDeletingPage] = useState<ConfigurablePage | null>(null);
    const handleDeletePage = () => {
        if (!deletingPage) return;
        const newConfig = produce(config, draft => {
            draft.pages = draft.pages.filter(p => p.id !== deletingPage.id);
        });
        onSaveConfig(newConfig);
        setDeletingPage(null);
    }
    return <div>
         <div className="flex justify-end mb-2"><button onClick={onAdd} className="text-sm font-semibold text-primary-600 hover:text-primary-500 flex items-center"><Icon name="plus" className="h-4 w-4 mr-1"/> Add Page</button></div>
        <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="px-3 py-1 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Page</th><th className="px-3 py-1.5"></th></tr></thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200/80 dark:divide-slate-800">
                {config.pages.map(page => <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-3 py-1.5 font-medium text-sm flex items-center"><Icon name={page.icon as any || 'question-mark-circle'} className="h-5 w-5 mr-3 text-primary-600"/><span className="text-slate-800 dark:text-slate-100">{page.name}</span></td><td className="px-3 py-1.5 text-right space-x-1"><button title="Edit Page" onClick={() => onEdit(page)} className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Icon name="pencil" className="h-4 w-4"/></button><button title="Delete Page" onClick={() => setDeletingPage(page)} className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-500"><Icon name="trash" className="h-4 w-4"/></button></td></tr>)}
                {config.pages.length === 0 && <tr><td colSpan={2} className="text-center py-6 text-slate-500 dark:text-slate-400">No pages configured for this asset type.</td></tr>}
            </tbody>
        </table>
        {deletingPage && <ConfirmationModal onConfirm={handleDeletePage} onCancel={() => setDeletingPage(null)} message={`Are you sure you want to delete the page "${deletingPage.name}"?`} />}
    </div>;
};

// --- Permission Matrix Component ---
const PermissionAssignmentMatrix: React.FC = () => {
    const { configs, onSaveConfig } = useAccessControl();
    const [selectedConfigId, setSelectedConfigId] = useState<string>('');
    const selectedConfig = configs.find(c => c.id === selectedConfigId);
    
    const handlePermissionChange = (positionId: string, permissionId: string, value: boolean) => {
        if (!selectedConfig) return;
        const newConfig = produce(selectedConfig, draft => {
            if (!draft.permissionMatrix[positionId]) {
                draft.permissionMatrix[positionId] = {};
            }
            draft.permissionMatrix[positionId][permissionId] = value;
        });
        onSaveConfig(newConfig);
    };
    
    const handlePageAccessToggle = (positionId: string, pageId: string, value: boolean) => {
        if (!selectedConfig) return;
         const newConfig = produce(selectedConfig, draft => {
            if (!draft.permissionMatrix[positionId]) {
                draft.permissionMatrix[positionId] = {};
            }
            draft.permissionMatrix[positionId][pageId] = value;
            // Also toggle all sub-permissions for that page
            const page = draft.pages.find(p => p.id === pageId);
            if(page) {
                page.permissions.forEach(perm => {
                    draft.permissionMatrix[positionId][perm.id] = value;
                });
            }
        });
        onSaveConfig(newConfig);
    };

    return (
        <Card title="Permission Assignment Matrix">
            <div className="space-y-4">
                <div>
                    <label htmlFor="assetTypeSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Asset Type to Configure</label>
                    <select
                        id="assetTypeSelect"
                        value={selectedConfigId}
                        onChange={e => setSelectedConfigId(e.target.value)}
                        className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled>-- Select an Asset Type --</option>
                        {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {selectedConfig && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                             <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="sticky left-0 bg-slate-100 dark:bg-slate-800 p-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Position</th>
                                    {selectedConfig.pages.map(page => (
                                        <th key={page.id} className="p-2 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{page.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedConfig.positions.map(pos => (
                                    <tr key={pos.id}>
                                        <td className="sticky left-0 bg-white dark:bg-slate-900 p-2 text-sm font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{pos.title}</td>
                                        {selectedConfig.pages.map(page => {
                                            const hasPageAccess = selectedConfig.permissionMatrix[pos.id]?.[page.id] ?? false;
                                            return (
                                                <td key={page.id} className="p-2 text-center border border-slate-200 dark:border-slate-700">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <input 
                                                            type="checkbox" 
                                                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                            checked={hasPageAccess}
                                                            onChange={e => handlePageAccessToggle(pos.id, page.id, e.target.checked)}
                                                        />
                                                        {page.permissions.length > 0 && <GranularPermissionsPopover page={page} position={pos} config={selectedConfig} onPermissionChange={handlePermissionChange} hasPageAccess={hasPageAccess} />}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
};

const GranularPermissionsPopover: React.FC<{page: ConfigurablePage, position: Position, config: AssetTypeConfig, onPermissionChange: any, hasPageAccess: boolean}> = ({page, position, config, onPermissionChange, hasPageAccess}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={!hasPageAccess}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                 title="Configure granular permissions"
            >
                <Icon name="cog-8-tooth" className="h-4 w-4"/>
            </button>
            {isOpen && (
                <div className="absolute z-10 -right-1/2 mt-2 w-72 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl"
                  onMouseLeave={() => setIsOpen(false)}
                >
                    <h4 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">Permissions for {page.name}</h4>
                    <div className="space-y-2">
                        {page.permissions.map(perm => (
                             <label key={perm.id} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                                <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    checked={config.permissionMatrix[position.id]?.[perm.id] ?? false}
                                    onChange={e => onPermissionChange(position.id, perm.id, e.target.checked)}
                                />
                                <span>{perm.description}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}


// --- Modal Components ---
const AssetTypeModal: React.FC<{ config: AssetTypeConfig | null; onClose: () => void; }> = ({ config, onClose }) => {
  const { onSaveConfig } = useAccessControl();
  const [name, setName] = useState(config?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        onSaveConfig(config ? { ...config, name } : { id: `type-${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`, name, positions: [], pages: [], permissionMatrix: {} });
        setIsSaving(false);
        onClose();
    }, 500);
  }

  return (
    <Modal show={true} onClose={onClose} title={config ? 'Edit Asset Type' : 'Create Asset Type'}>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        <div><label htmlFor="assetTypeName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asset Type Name</label><input id="assetTypeName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Warehouse" className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" required /></div>
        <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-500 w-24 flex justify-center" disabled={isSaving}>{isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save'}</button></div>
      </form>
    </Modal>
  )
}

const PositionModal: React.FC<{ assetTypeId: string, position: Position | null, onClose: () => void }> = ({ assetTypeId, position, onClose }) => {
    const { configs, onSaveConfig } = useAccessControl();
    const [title, setTitle] = useState(position?.title || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            const config = configs.find(c => c.id === assetTypeId); 
            if(config) {
                onSaveConfig(produce(config, draft => { 
                    if (position) { 
                        const p = draft.positions.find(pos => pos.id === position.id); 
                        if(p) { p.title = title; } 
                    } else { 
                        draft.positions.push({ id: `pos-${title.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`, title }); 
                    } 
                })); 
            }
            setIsSaving(false);
            onClose(); 
        }, 500);
    }

    return (
        <Modal show={true} onClose={onClose} title={position ? 'Edit Position' : 'Create Position'}>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div><label htmlFor="posTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Position Title</label><input id="posTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Head Chef" className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" required /></div>
                <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-500 w-24 flex justify-center" disabled={isSaving}>{isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save'}</button></div>
            </form>
        </Modal>
    )
}

const PageModal: React.FC<{ assetTypeId: string, page: ConfigurablePage | null, onClose: () => void }> = ({ assetTypeId, page, onClose }) => {
    const { configs, onSaveConfig } = useAccessControl();
    const [name, setName] = useState(page?.name || '');
    const [icon, setIcon] = useState(page?.icon || 'home');
    const [isSaving, setIsSaving] = useState(false);
    const iconOptions = Object.keys(iconPaths);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            const config = configs.find(c => c.id === assetTypeId); 
            if(config) {
                onSaveConfig(produce(config, draft => { 
                    if (page) { 
                        const p = draft.pages.find(pg => pg.id === page.id); 
                        if(p) { p.name = name; p.icon = icon; } 
                    } else { 
                        draft.pages.push({ id: `page-${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`, name, icon, permissions: [] }); 
                    } 
                })); 
            }
            setIsSaving(false);
            onClose();
        }, 500);
    }
    return (
        <Modal show={true} onClose={onClose} title={page ? 'Edit Page' : 'Create Page'}>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div><label htmlFor="pageName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Page Name</label><input id="pageName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Maintenance Log" className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500" required /></div>
                <div><label htmlFor="pageIcon" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Icon</label><select id="pageIcon" value={icon} onChange={e => setIcon(e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500">{iconOptions.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
                <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-500 w-24 flex justify-center" disabled={isSaving}>{isSaving ? <Icon name="arrow-path" className="h-4 w-4 animate-spin"/> : 'Save'}</button></div>
            </form>
        </Modal>
    )
}

const AccessControlWrapper: React.FC<AccessControlHubProps> = (props) => {
    return (
        <AccessControlContext.Provider value={props}>
            <AccessControlHubComponent {...props} />
        </AccessControlContext.Provider>
    );
};

export { AccessControlWrapper as AccessControlHub };