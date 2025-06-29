import React, { useState } from 'react';
import { produce } from 'immer';
import { Modal } from '../../ui/Modal';
import { Icon } from '../../ui/Icons';
import { RecurringProjectTemplate, RecurrenceRule, TaskAssignment, ProjectTemplate, User, RecurrenceFreq } from '../../../types';

interface NewRecurringProjectModalProps {
  template?: RecurringProjectTemplate;
  onClose: () => void;
  onSave: (template: RecurringProjectTemplate) => void;
  projectTemplates: ProjectTemplate[];
  users: User[];
}

const BLANK_TEMPLATE: Omit<RecurringProjectTemplate, 'id'> = {
    seriesName: '',
    baseProjectTemplateId: '',
    recurrenceRule: { freq: 'Monthly', dayOfMonth: 1, time: '09:00' },
    defaultLead: { roleIds: [], userIds: [], placeholderIds: [] },
    status: 'Active',
};

export const NewRecurringProjectModal: React.FC<NewRecurringProjectModalProps> = (props) => {
    const [template, setTemplate] = useState<Omit<RecurringProjectTemplate, 'id'>>(() => {
        if (props.template) return props.template;
        const initial = { ...BLANK_TEMPLATE };
        if (props.projectTemplates.length > 0) {
            initial.baseProjectTemplateId = props.projectTemplates[0].id;
        }
        return initial;
    });

    const handleFieldChange = (field: keyof Omit<RecurringProjectTemplate, 'id'>, value: any) => {
        setTemplate(produce(draft => {
            (draft as any)[field] = value;
        }));
    };
    
    const handleRuleChange = (field: keyof RecurrenceRule, value: any) => {
        setTemplate(produce(draft => {
            (draft.recurrenceRule as any)[field] = value;
        }));
    };

    const handleLeadChange = (userId: string) => {
        setTemplate(produce(draft => {
            draft.defaultLead.userIds = [userId];
        }))
    }

    const handleSave = () => {
        const finalTemplate: RecurringProjectTemplate = {
            ...template,
            id: (props.template?.id) || `recproj-${Date.now()}`
        };
        props.onSave(finalTemplate);
        props.onClose();
    };

    return (
        <Modal show={true} onClose={props.onClose} title={props.template ? 'Edit Recurring Project Rule' : 'New Recurring Project Rule'} size="2xl">
            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium">Series Name</label>
                    <input type="text" value={template.seriesName} onChange={e => handleFieldChange('seriesName', e.target.value)} placeholder="e.g., Monthly P&L Review" className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Base Project Template</label>
                    <select value={template.baseProjectTemplateId} onChange={e => handleFieldChange('baseProjectTemplateId', e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                         {props.projectTemplates.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                    </select>
                </div>
                
                 <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                    <h4 className="font-semibold">Recurrence Rule</h4>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Frequency</label>
                            <select value={template.recurrenceRule.freq} onChange={e => handleRuleChange('freq', e.target.value as RecurrenceFreq)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Annually">Annually</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">At Time</label>
                            <input type="time" value={template.recurrenceRule.time} onChange={e => handleRuleChange('time', e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                        </div>
                    </div>
                     {template.recurrenceRule.freq === 'Monthly' && (
                        <div>
                            <label className="block text-sm font-medium">Day of Month</label>
                            <input type="number" min="1" max="31" value={template.recurrenceRule.dayOfMonth || 1} onChange={e => handleRuleChange('dayOfMonth', parseInt(e.target.value))} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                        </div>
                    )}
                 </div>

                 <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                    <h4 className="font-semibold">Default Project Lead</h4>
                    <select value={template.defaultLead.userIds[0] || ''} onChange={e => handleLeadChange(e.target.value)} className="w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                         <option value="">-- Select a Lead --</option>
                         {props.users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                 </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={props.onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Cancel</button>
                    <button onClick={handleSave} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Save Rule</button>
                </div>
            </div>
        </Modal>
    )
}