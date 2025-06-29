import React, { useState } from 'react';
import { produce } from 'immer';
import { LearningPath, LearningPathStage, PathRequirement, UniversityCourse, ProjectTemplate } from '../../types';
import { Icon } from '../ui/Icons';
import { AddRequirementModal } from './AddRequirementModal';

interface PathwayBuilderModalProps {
  path: LearningPath;
  onClose: () => void;
  onSave: (path: LearningPath) => void;
  allCourses: UniversityCourse[];
  allProjectTemplates: ProjectTemplate[];
}

export const PathwayBuilderModal: React.FC<PathwayBuilderModalProps> = (props) => {
  const [currentPath, setCurrentPath] = useState(props.path);
  const [addingRequirementToStageId, setAddingRequirementToStageId] = useState<string | null>(null);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPath(produce(draft => {
      (draft as any)[name] = value;
    }));
  };

  const handleAddStage = () => {
    setCurrentPath(produce(draft => {
      const newStage: LearningPathStage = {
        id: `stage-${Date.now()}`,
        title: `New Stage ${draft.stages.length + 1}`,
        order: draft.stages.length + 1,
        requirements: [],
      };
      draft.stages.push(newStage);
    }));
  };

  const handleRequirementAdd = (stageId: string, requirement: PathRequirement) => {
    setCurrentPath(produce(draft => {
        const stage = draft.stages.find(s => s.id === stageId);
        if (stage) {
            stage.requirements.push(requirement);
        }
    }));
    setAddingRequirementToStageId(null);
  };
  
  const getRequirementText = (req: PathRequirement) => {
    switch(req.type) {
        case 'course':
            return `Course: ${props.allCourses.find(c => c.id === req.courseId)?.title || 'Unknown'}`;
        case 'project':
            return `Project: ${props.allProjectTemplates.find(p => p.id === req.projectTemplateId)?.name || 'Unknown'}`;
        case 'manual_sign_off':
            return `Sign-off: ${req.description}`;
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={props.onClose}></div>
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-slate-50 shadow-2xl dark:bg-slate-950">
        <div className="flex-shrink-0 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pathway Builder</h2>
            <button onClick={props.onClose} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
              <Icon name="x-mark" className="h-6 w-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <input type="text" name="title" value={currentPath.title} onChange={handleFieldChange} placeholder="Learning Path Title" className="w-full rounded-md border-slate-300 bg-white p-2 text-lg font-semibold dark:border-slate-700 dark:bg-slate-900" />
            <textarea name="description" value={currentPath.description} onChange={handleFieldChange} placeholder="Description..." rows={2} className="w-full rounded-md border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            
            <div className="space-y-4">
                {currentPath.stages.map(stage => (
                    <div key={stage.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <input type="text" value={stage.title} onChange={(e) => setCurrentPath(produce(draft => {
                            const s = draft.stages.find(s => s.id === stage.id);
                            if (s) s.title = e.target.value;
                        }))} className="font-semibold bg-transparent w-full mb-2"/>

                        <ul className="space-y-2">
                           {stage.requirements.map((req, i) => (
                                <li key={i} className="flex items-center rounded-md bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                    <Icon name={req.type === 'course' ? 'academic-cap' : req.type === 'project' ? 'clipboard-document-list' : 'check-badge'} className="mr-2 h-4 w-4 text-slate-500"/>
                                    <span>{getRequirementText(req)}</span>
                                </li>
                           ))}
                        </ul>

                        <button onClick={() => setAddingRequirementToStageId(stage.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-500 hover:border-primary-500 hover:text-primary-600 dark:border-slate-700">
                            <Icon name="plus" className="h-4 w-4" /> Add Requirement
                        </button>
                    </div>
                ))}
            </div>

             <button onClick={handleAddStage} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-500 hover:border-primary-500 hover:text-primary-600 dark:border-slate-700">
                <Icon name="plus" className="h-5 w-5" /> Add Stage
            </button>

        </div>

        <div className="flex flex-shrink-0 justify-end space-x-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={props.onClose} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={() => props.onSave(currentPath)} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Save Path</button>
        </div>

        {addingRequirementToStageId && (
            <AddRequirementModal
                stageId={addingRequirementToStageId}
                onAdd={handleRequirementAdd}
                onClose={() => setAddingRequirementToStageId(null)}
                allCourses={props.allCourses}
                allProjectTemplates={props.allProjectTemplates}
            />
        )}
      </div>
    </>
  );
};
