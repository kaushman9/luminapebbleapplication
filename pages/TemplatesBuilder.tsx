import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icons';
import { ProjectTemplate, AssetTypeConfig, SortConfig, AssetType, TemplateTask, User, Asset } from '../types';
import { format } from 'date-fns';
import { TemplateBuilderModal } from '../components/templates-builder/TemplateBuilderModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

interface TemplatesBuilderProps {
  templates: ProjectTemplate[];
  assetTypes: AssetType[];
  assetTypeConfigs: AssetTypeConfig[];
  projectTemplates: ProjectTemplate[];
  users: User[];
  assets: Asset[];
  onSave: (template: ProjectTemplate) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (templateId: string) => void;
  onReorderTasks: (templateId: string, reorderedTasks: TemplateTask[]) => void;
}

const TemplatesBuilder: React.FC<TemplatesBuilderProps> = ({ 
  templates, assetTypes, onSave, onDelete, onDuplicate, onReorderTasks, assetTypeConfigs, projectTemplates, users, assets
}) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastUpdated', direction: 'descending' });

  const getAssetTypeNames = (ids: string[]) => {
    return ids.map(id => assetTypeConfigs.find(at => at.id === id)?.name || 'Unknown').join(', ');
  };
  
  const handleEdit = (template: ProjectTemplate) => {
    setEditingTemplate(template);
    setShowBuilderModal(true);
  };
  
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowBuilderModal(true);
  };
  
  const handleDeleteConfirm = () => {
    if (deletingTemplateId) {
      onDelete(deletingTemplateId);
      setDeletingTemplateId(null);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <Icon name="arrow-up" className="h-4 w-4" /> : <Icon name="arrow-down" className="h-4 w-4" />;
  };
  
  const sortedTemplates = useMemo(() => {
    let sortableItems = [...templates];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        if(sortConfig.key === 'taskCount') {
          aValue = a.tasks.length;
          bValue = b.tasks.length;
        } else {
          aValue = a[sortConfig.key as keyof ProjectTemplate];
          bValue = b[sortConfig.key as keyof ProjectTemplate];
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [templates, sortConfig]);
  
  const filteredAndSortedTemplates = useMemo(() => {
    return sortedTemplates.filter(template =>
      template.name.toLowerCase().includes(filter.toLowerCase()) ||
      getAssetTypeNames(template.appliesToAssetTypeIds).toLowerCase().includes(filter.toLowerCase())
    );
  }, [sortedTemplates, filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Templates Builder
      </h1>
      
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('projects')}
            className={activeTab === 'projects'
              ? 'border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            }
          >
            Projects
          </button>
          {/* Add other template types like "Shift Playbooks" here */}
        </nav>
      </div>

      {activeTab === 'projects' && (
        <Card>
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative max-w-xs w-full sm:w-auto flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="funnel" className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filter templates..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500"
                  />
              </div>
              <button
                onClick={handleCreateNew}
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
                <Icon name="plus" className="h-4 w-4 mr-2" />
                Create New Template
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  {[{key: 'name', label: 'Template Name'}, {key: 'appliesToAssetTypeIds', label: 'Applies To'}, {key: 'taskCount', label: 'Tasks'}, {key: 'lastUpdated', label: 'Last Updated'}].map(h => (
                    <th key={h.key} scope="col" className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <button onClick={() => requestSort(h.key)} className="flex items-center space-x-1 group">
                        <span>{h.label}</span>
                        <span className="opacity-50 group-hover:opacity-100 transition-opacity">{getSortIndicator(h.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="relative p-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900">
                {filteredAndSortedTemplates.map(template => (
                  <tr key={template.id} className="border-b border-slate-200/80 dark:border-slate-800/50 last:border-b-0 hover:bg-primary-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{template.name}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getAssetTypeNames(template.appliesToAssetTypeIds)}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{template.tasks.length}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{format(new Date(template.lastUpdated), 'MMM d, yyyy')}</td>
                    <td className="p-3 text-right space-x-1">
                      <button onClick={() => handleEdit(template)} title="Edit" className="p-1.5 text-slate-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="pencil" className="h-4 w-4"/></button>
                      <button onClick={() => onDuplicate(template.id)} title="Duplicate" className="p-1.5 text-slate-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="document-duplicate" className="h-4 w-4"/></button>
                      <button onClick={() => setDeletingTemplateId(template.id)} title="Delete" className="p-1.5 text-slate-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-danger-500"><Icon name="trash" className="h-4 w-4"/></button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedTemplates.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500">No project templates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showBuilderModal && (
        <TemplateBuilderModal
          template={editingTemplate}
          assetTypes={assetTypes}
          onClose={() => setShowBuilderModal(false)}
          onSave={onSave}
          assetTypeConfigs={assetTypeConfigs}
          projectTemplates={projectTemplates}
          onReorderTasks={onReorderTasks}
          users={users}
          assets={assets}
        />
      )}
      
      {deletingTemplateId && (
        <ConfirmationModal
          title="Delete Template"
          message={`Are you sure you want to delete this template? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTemplateId(null)}
        />
      )}

    </div>
  );
};

export default TemplatesBuilder;