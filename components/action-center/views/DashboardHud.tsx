import React from 'react';
import { isToday, isPast } from 'date-fns';
import { DisplayTask } from '../../../types';
import { Icon } from '../../ui/Icons';

interface DashboardHudProps {
    tasks: DisplayTask[];
    onFilterClick: (type: 'overdue' | 'today') => void;
}

export const DashboardHud: React.FC<DashboardHudProps> = ({ tasks, onFilterClick }) => {
    const today = new Date();
    const overdueCount = tasks.filter(t => t.status !== 'Completed' && t.absoluteDueDate && isPast(new Date(t.absoluteDueDate)) && !isToday(new Date(t.absoluteDueDate))).length;
    const dueTodayCount = tasks.filter(t => t.status !== 'Completed' && t.absoluteDueDate && isToday(new Date(t.absoluteDueDate))).length;
    // Add logic for projects approaching deadline if needed

    const stats = [
        { label: 'Overdue', value: overdueCount, filter: 'overdue' as const, icon: 'exclamation-triangle' as const, color: 'text-danger-500' },
        { label: 'Due Today', value: dueTodayCount, filter: 'today' as const, icon: 'calendar-days' as const, color: 'text-warning-500' },
    ];

    return (
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
            <span className="font-semibold">Quick View:</span>
            {stats.map(stat => stat.value > 0 && (
                <button 
                    key={stat.label} 
                    onClick={() => onFilterClick(stat.filter)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    <Icon name={stat.icon} className={`h-4 w-4 ${stat.color}`} />
                    <span className="font-bold">{stat.value}</span>
                    <span>{stat.label}</span>
                </button>
            ))}
            {(overdueCount + dueTodayCount) === 0 && <span className="text-slate-500">No urgent tasks.</span>}
        </div>
    );
};