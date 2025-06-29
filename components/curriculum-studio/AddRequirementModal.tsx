import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UniversityCourse, ProjectTemplate, PathRequirement } from '../../types';

interface AddRequirementModalProps {
  stageId: string;
  onAdd: (stageId: string, requirement: PathRequirement) => void;
  onClose: () => void;
  allCourses: UniversityCourse[];
  allProjectTemplates: ProjectTemplate[];
}

export const AddRequirementModal: React.FC<AddRequirementModalProps> = (props) => {
  const [type, setType] = useState<PathRequirement['type']>('course');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!value) return;
    let requirement: PathRequirement;
    switch (type) {
      case 'course':
        requirement = { type, courseId: value };
        break;
      case 'project':
        requirement = { type, projectTemplateId: value };
        break;
      case 'manual_sign_off':
        requirement = { type, description: value };
        break;
    }
    props.onAdd(props.stageId, requirement);
  };
  
  const renderValueInput = () => {
    switch (type) {
      case 'course':
        return (
          <select value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
            <option value="">-- Select a course --</option>
            {props.allCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        );
      case 'project':
        return (
          <select value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
            <option value="">-- Select a project template --</option>
            {props.allProjectTemplates.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        );
      case 'manual_sign_off':
        return <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g., Practical skill demonstration" className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />;
    }
  };

  return (
    <Modal show={true} onClose={props.onClose} title="Add Requirement">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Requirement Type</label>
          <select value={type} onChange={e => { setType(e.target.value as any); setValue(''); }} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
            <option value="course">Course</option>
            <option value="project">Project Template</option>
            <option value="manual_sign_off">Manual Sign-off</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Requirement</label>
          {renderValueInput()}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={props.onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">Cancel</button>
          <button onClick={handleAdd} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      </div>
    </Modal>
  );
};
