import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { Modal } from '../../ui/Modal';
import { Icon } from '../../ui/Icons';
import { RecurringTaskTemplate, RecurrenceRule, TaskAssignment, Asset, User, AssetTypeConfig, RecurrenceFreq } from '../../../types';

interface NewRecurringTaskModalProps {
  template?: RecurringTaskTemplate;
  onClose: () => void;
  onSave: (template: RecurringTaskTemplate) => void;
  assets: Asset[];
  users: User[];
  assetTypeConfigs: AssetTypeConfig[];
}

const BLANK_TEMPLATE: Omit<RecurringTaskTemplate, 'id'> = {
    title: '',
    description: '',
    recurrenceRule: { freq: 'Weekly', daysOfWeek: ['M'], time: '09:00' },
    appliesToAssetId: '',
    assignment: { roleIds: [], userIds: [], placeholderIds: [] },
    status: 'Active',
};

export const NewRecurringTaskModal: React.FC<NewRecurringTaskModalProps> = (props) => {
    const [template, setTemplate] = useState<Omit<RecurringTaskTemplate, 'id'>>(() => {
        if (props.template) return props.template;
        const initial = { ...BLANK_TEMPLATE };
        if (props.assets.length > 0) {
            initial.appliesToAssetId = props.assets[0].id;
        }
        return initial;
    });

    const availablePositions = useMemo(() => {
        if (!template.appliesToAssetId) return [];
        const asset = props.assets.find(a => a.id === template.appliesToAssetId);
        if (!asset) return [];
        const config = props.assetTypeConfigs.find(c => c.id === asset.assetTypeId);
        return config ? config.positions : [];
    }, [template.appliesToAssetId, props.assets, props.assetTypeConfigs]);
    
    const handleFieldChange = (field: keyof Omit<RecurringTaskTemplate, 'id'>, value: any) => {
        setTemplate(produce(draft => {
            (draft as any)[field] = value;
        }));
    };
    
    const handleRuleChange = (field: keyof RecurrenceRule, value: any) => {
        setTemplate(produce(draft => {
            (draft.recurrenceRule as any)[field] = value;
        }));
    };

    const handleAssigneeToggle = (type: 'role' | 'user', id: string) => {
        setTemplate(produce(draft => {
            const list = type === 'role' ? draft.assignment.roleIds : draft.assignment.userIds;
            const index = list.indexOf(id);
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(id);
            }
        }));
    };

    const handleSave = () => {
        const finalTemplate: RecurringTaskTemplate = {
            ...template,
            id: (props.template?.id) || `rectask-${Date.now()}`
        };
        props.onSave(finalTemplate);
        props.onClose();
    };

    return (
        <Modal show={true} onClose={props.onClose} title={props.template ? 'Edit Recurring Task Rule' : 'New Recurring Task Rule'} size="2xl">
            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium">Task Title</label>
                    <input type="text" value={template.title} onChange={e => handleFieldChange('title', e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Asset</label>
                    <select value={template.appliesToAssetId} onChange={e => handleFieldChange('appliesToAssetId', e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                         {props.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                    </select>
                </div>
                
                 <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                    <h4 className="font-semibold">Recurrence Rule</h4>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Frequency</label>
                            <select value={template.recurrenceRule.freq} onChange={e => handleRuleChange('freq', e.target.value as RecurrenceFreq)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">At Time</label>
                            <input type="time" value={template.recurrenceRule.time} onChange={e => handleRuleChange('time', e.target.value)} className="mt-1 w-full text-sm rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                        </div>
                    </div>
                 </div>

                 <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                    <h4 className="font-semibold">Default Assignment</h4>
                     <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">By Position</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                             {availablePositions.map(pos => <button key={pos.id} type="button" onClick={() => handleAssigneeToggle('role', pos.id)} className={`px-3 py-1 text-sm font-semibold rounded-full border ${template.assignment.roleIds.includes(pos.id) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800'}`}>{pos.title}</button>)}
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">By Specific User</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {props.users.map(u => <button key={u.id} type="button" onClick={() => handleAssigneeToggle('user', u.id)} className={`px-3 py-1 text-sm font-semibold rounded-full border ${template.assignment.userIds.includes(u.id) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800'}`}>{u.firstName} {u.lastName}</button>)}
                        </div>
                    </div>
                 </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={props.onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Cancel</button>
                    <button onClick={handleSave} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Save Rule</button>
                </div>
            </div>
        </Modal>
    )
}