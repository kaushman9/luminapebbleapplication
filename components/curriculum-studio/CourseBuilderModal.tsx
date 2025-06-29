import React, { useState } from 'react';
import { UniversityCourse, AssetTypeConfig, CourseModule, ModuleType } from '../../types';
import { produce } from 'immer';
import { Icon } from '../ui/Icons';
import { AddModuleModal } from './AddModuleModal';

interface CourseBuilderModalProps {
  course: UniversityCourse;
  onClose: () => void;
  onSave: (course: UniversityCourse) => void;
  assetTypeConfigs: AssetTypeConfig[];
}

export const CourseBuilderModal: React.FC<CourseBuilderModalProps> = ({ course, onClose, onSave, assetTypeConfigs }) => {
  const [currentCourse, setCurrentCourse] = useState(course);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);


  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCourse(produce(draft => {
      (draft as any)[name] = value;
    }));
  };
  
  const handleRelevanceChange = (assetTypeId: string) => {
    setCurrentCourse(produce(draft => {
        const index = draft.assetTypeRelevance.indexOf(assetTypeId);
        if (index > -1) {
            draft.assetTypeRelevance.splice(index, 1);
        } else {
            draft.assetTypeRelevance.push(assetTypeId);
        }
    }));
  };

  const handleRecertRuleChange = (field: 'interval' | 'unit' | 'method', value: string | number) => {
    setCurrentCourse(produce(draft => {
        if (!draft.recertificationRule) {
            draft.recertificationRule = { interval: 1, unit: 'year', method: 'full_course' };
        }
        (draft.recertificationRule as any)[field] = value;
    }));
  };

  const handleAddModule = (moduleType: ModuleType) => {
    const baseNewModule = {
        id: `mod-${Date.now()}`,
        title: `New ${moduleType} Module`,
        moduleType,
        order: currentCourse.modules.length + 1,
    };
    
    let newModule: CourseModule;
    switch(moduleType) {
        case 'Video':
            newModule = {...baseNewModule, content: { url: '', lengthMinutes: 0 }};
            break;
        case 'Document':
            newModule = {...baseNewModule, content: { url: '' }};
            break;
        case 'Quiz':
            newModule = {...baseNewModule, content: { questions: [] }};
            break;
        case 'LiveSession':
            newModule = {...baseNewModule, content: { topic: '', instructor: '', startTime: new Date().toISOString(), endTime: new Date().toISOString(), meetingUrl: '' }};
            break;
        default:
            // For unhandled types, let's give a default empty content object for now
            newModule = {...baseNewModule, content: {} as any};
    }
    
    setCurrentCourse(produce(draft => {
        draft.modules.push(newModule);
    }));
    setIsAddingModule(false);
  }

  const handleDeleteModule = (moduleId: string) => {
      setCurrentCourse(produce(draft => {
        draft.modules = draft.modules.filter(m => m.id !== moduleId).map((m, i) => ({...m, order: i + 1}));
      }))
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, moduleId: string) => {
    setDraggedModuleId(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedModuleId) return;

    const modules = [...currentCourse.modules];
    const draggedIndex = modules.findIndex(m => m.id === draggedModuleId);
    const targetIndex = modules.findIndex(m => m.id === targetModuleId);

    const [draggedItem] = modules.splice(draggedIndex, 1);
    modules.splice(targetIndex, 0, draggedItem);
    
    const reorderedModules = modules.map((module, index) => ({ ...module, order: index + 1 }));
    
    setCurrentCourse(produce(draft => {
      draft.modules = reorderedModules;
    }));
    
    setDraggedModuleId(null);
  };


  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-slate-50 shadow-2xl dark:bg-slate-950">
        <div className="flex-shrink-0 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Builder</h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
              <Icon name="x-mark" className="h-6 w-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button onClick={() => setActiveTab('content')} className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'content' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Content</button>
              <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'settings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Settings</button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'content' && (
              <div className="space-y-4">
                  <input type="text" name="title" value={currentCourse.title} onChange={handleFieldChange} placeholder="Course Title" className="w-full rounded-md border-slate-300 bg-white p-2 text-lg font-semibold dark:border-slate-700 dark:bg-slate-900" />
                <div className="space-y-2">
                    {currentCourse.modules.sort((a,b) => a.order - b.order).map(module => (
                        <div 
                            key={module.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, module.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, module.id)}
                            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4 cursor-move"
                        >
                            <Icon name="bars-3" className="h-5 w-5 text-slate-400"/>
                            <div className="flex-1">
                                <p className="font-semibold">{module.title}</p>
                                <p className="text-xs text-slate-500">{module.moduleType}</p>
                            </div>
                            <button onClick={() => handleDeleteModule(module.id)} className="text-danger-500 p-1 rounded-md hover:bg-danger-100 dark:hover:bg-danger-900/50"><Icon name="trash" className="h-4 w-4"/></button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setIsAddingModule(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-500 hover:border-primary-500 hover:text-primary-600 dark:border-slate-700">
                    <Icon name="plus" className="h-5 w-5" /> Add Module
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea name="description" value={currentCourse.description} onChange={handleFieldChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asset Type Relevance</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {assetTypeConfigs.map(atc => (
                            <button key={atc.id} onClick={() => handleRelevanceChange(atc.id)} className={`rounded-full border px-3 py-1 text-sm font-semibold ${currentCourse.assetTypeRelevance.includes(atc.id) ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 bg-white dark:bg-slate-800'}`}>{atc.name}</button>
                        ))}
                    </div>
                 </div>
                 <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="font-semibold">Recertification & Refresh</h4>
                    <div className="flex items-center space-x-2">
                        <span>Valid for</span>
                        <input type="number" value={currentCourse.recertificationRule?.interval || 1} onChange={e => handleRecertRuleChange('interval', parseInt(e.target.value))} className="w-20 rounded-md border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800" />
                        <select value={currentCourse.recertificationRule?.unit || 'year'} onChange={e => handleRecertRuleChange('unit', e.target.value)} className="rounded-md border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
                            <option value="day">Days</option>
                            <option value="week">Weeks</option>
                            <option value="month">Months</option>
                            <option value="year">Years</option>
                        </select>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Recertification Method</p>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2"><input type="radio" name="recertMethod" value="refresher_exam" checked={currentCourse.recertificationRule?.method === 'refresher_exam'} onChange={e => handleRecertRuleChange('method', e.target.value)} className="text-primary-600" /> Refresher Exam</label>
                            <label className="flex items-center gap-2"><input type="radio" name="recertMethod" value="full_course" checked={currentCourse.recertificationRule?.method === 'full_course'} onChange={e => handleRecertRuleChange('method', e.target.value)} className="text-primary-600" /> Full Course</label>
                        </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 justify-end space-x-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={onClose} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={() => onSave(currentCourse)} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Save Course</button>
        </div>
      </div>
      {isAddingModule && <AddModuleModal onAdd={handleAddModule} onClose={() => setIsAddingModule(false)} />}
    </>
  );
};