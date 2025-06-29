import React from 'react';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icons';
import { RecurringTaskTemplate, RecurringProjectTemplate, Asset, ProjectTemplate, User, AssetTypeConfig, TaskAssignment } from '../../../types';

// Helper function to format recurrence rules nicely
const getRecurrenceText = (rule: RecurringTaskTemplate['recurrenceRule']) => {
    if (rule.freq === 'Daily') return `Daily at ${rule.time}`;
    if (rule.freq === 'Weekly') return `Weekly on ${rule.daysOfWeek?.join(', ')} at ${rule.time}`;
    if (rule.freq === 'Monthly') return `On day ${rule.dayOfMonth} of the month at ${rule.time}`;
    return `${rule.freq} at ${rule.time}`;
};

interface RecurringTemplatesViewProps {
  taskTemplates: RecurringTaskTemplate[];
  recurringProjectTemplates: RecurringProjectTemplate[];
  onNewRecurringTask: () => void;
  onNewRecurringProject: () => void;
  onEditRecurringTask: (template: RecurringTaskTemplate) => void;
  onEditRecurringProject: (template: RecurringProjectTemplate) => void;
  assets: Asset[];
  users: User[];
  assetTypeConfigs: AssetTypeConfig[];
  projectTemplates: ProjectTemplate[];
}

export const RecurringTemplatesView: React.FC<RecurringTemplatesViewProps> = (props) => {
    const getAssetName = (id: string) => props.assets.find(a => a.id === id)?.name || 'Unknown Asset';
    const getProjectTemplateName = (id: string) => props.projectTemplates.find(p => p.id === id)?.name || 'Unknown Template';
    
    const getProjectLeadName = (assignment: RecurringProjectTemplate['defaultLead']) => {
        if (assignment.userIds.length > 0) {
            const user = props.users.find(u => u.id === assignment.userIds[0]);
            return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        }
        return 'Unassigned';
    };

    const getTaskAssignmentText = (assignment: TaskAssignment, assetId: string) => {
        const parts: string[] = [];
        
        const asset = props.assets.find(a => a.id === assetId);
        const config = asset ? props.assetTypeConfigs.find(c => c.id === asset.assetTypeId) : null;
        const availablePositions = config ? config.positions : [];
        
        if (assignment.roleIds.length > 0) {
            const roleNames = availablePositions
                .filter(p => assignment.roleIds.includes(p.id))
                .map(p => p.title);
            if (roleNames.length > 0) parts.push(`Roles: ${roleNames.join(', ')}`);
        }
        
        if (assignment.userIds.length > 0) {
            const userNames = props.users
                .filter(u => assignment.userIds.includes(u.id))
                .map(u => `${u.firstName} ${u.lastName}`);
            if (userNames.length > 0) parts.push(`Users: ${userNames.join(', ')}`);
        }

        if (parts.length === 0) return 'Unassigned';
        return parts.join(' | ');
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel 1: Recurring Task Templates */}
            <Card 
                title="Automated Recurring Tasks"
                action={
                     <button onClick={props.onNewRecurringTask} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-500">
                        <Icon name="plus" className="h-4 w-4 mr-1"/> New Rule
                    </button>
                }
                bodyClassName="p-0 overflow-x-auto"
            >
                <table className="min-w-full">
                     <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Task Title</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Recurs On</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Asset</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assignees</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="relative p-3"><span className="sr-only">Actions</span></th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200/80 dark:divide-slate-800">
                        {props.taskTemplates.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t.title}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getRecurrenceText(t.recurrenceRule)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getAssetName(t.appliesToAssetId)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs">{getTaskAssignmentText(t.assignment, t.appliesToAssetId)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === 'Active' ? 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-300' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>{t.status}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => props.onEditRecurringTask(t)} className="p-2 text-slate-500 hover:text-primary-600 rounded-md"><Icon name="pencil" className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        ))}
                         {props.taskTemplates.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-500">No recurring task rules created.</td></tr>
                        )}
                     </tbody>
                </table>
            </Card>

             {/* Panel 2: Recurring Project Templates */}
            <Card 
                title="Automated Recurring Projects"
                action={
                     <button onClick={props.onNewRecurringProject} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-500">
                        <Icon name="plus" className="h-4 w-4 mr-1"/> New Rule
                    </button>
                }
                bodyClassName="p-0 overflow-x-auto"
            >
                 <table className="min-w-full">
                     <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Project Series</th>
                             <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Base Template</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Recurs On</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Project Lead</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="relative p-3"><span className="sr-only">Actions</span></th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200/80 dark:divide-slate-800">
                         {props.recurringProjectTemplates.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t.seriesName}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getProjectTemplateName(t.baseProjectTemplateId)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getRecurrenceText(t.recurrenceRule)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{getProjectLeadName(t.defaultLead)}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === 'Active' ? 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-300' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>{t.status}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => props.onEditRecurringProject(t)} className="p-2 text-slate-500 hover:text-primary-600 rounded-md"><Icon name="pencil" className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        ))}
                        {props.recurringProjectTemplates.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-500">No recurring project rules created.</td></tr>
                        )}
                     </tbody>
                </table>
            </Card>
        </div>
    );
};