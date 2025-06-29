import React from 'react';
import { Card } from '../ui/Card';
import { ActionItem } from '../../types';
import { Icon } from '../ui/Icons';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';

const ActionItemRow: React.FC<{ item: ActionItem; onToggle: (id: string) => void; }> = ({ item, onToggle }) => {
  const dueDate = new Date(item.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);

  const dueDateText = formatDistanceToNow(dueDate, { addSuffix: true });

  return (
    <li className={`flex items-start space-x-4 py-3 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 ${item.status === 'Completed' ? 'opacity-60' : ''}`}>
      <div className="flex-shrink-0 pt-0.5">
        <button 
          onClick={() => onToggle(item.id)}
          aria-label={item.status === 'Completed' ? 'Mark as incomplete' : 'Mark as complete'}
          className="cursor-pointer group"
        >
          {item.status === 'Completed' ? (
            <Icon name="check-circle" className="h-6 w-6 text-success-500" />
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 group-hover:border-primary-500 transition-colors bg-white dark:bg-slate-900 flex items-center justify-center">
              {isOverdue && <div className="h-2 w-2 rounded-full bg-danger-500"></div>}
            </div>
          )}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${item.status === 'Completed' ? 'line-through' : ''}`}>
          {item.description}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Source: {item.source}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        {isOverdue && item.status !== 'Completed' && (
           <span className="px-2 py-0.5 text-xs font-semibold text-danger-800 bg-danger-100 rounded-full dark:bg-danger-500/20 dark:text-danger-300">
            Overdue
          </span>
        )}
        {!isOverdue && item.status !== 'Completed' &&(
            <p className="text-xs text-slate-500 dark:text-slate-400">{dueDateText}</p>
        )}
        {item.status === 'Completed' && (
             <p className="text-xs font-semibold text-success-600">Completed</p>
        )}
      </div>
    </li>
  );
};

interface ActionItemsProps {
  items: ActionItem[];
  onToggle: (id: string) => void;
}

export const ActionItems: React.FC<ActionItemsProps> = ({ items, onToggle }) => {
  const sortedItems = [...items].sort((a, b) => {
    if ((a.status === 'Completed') !== (b.status === 'Completed')) {
        return a.status === 'Completed' ? 1 : -1;
    }
    const aIsOverdue = isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate));
    const bIsOverdue = isPast(new Date(b.dueDate)) && !isToday(new Date(b.dueDate));
    if (aIsOverdue !== bIsOverdue) return aIsOverdue ? -1 : 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  return (
    <Card title="My Action Items">
      <ul className="divide-y divide-slate-200/80 dark:divide-slate-800 -my-2">
        {sortedItems.length > 0 ? sortedItems.map(item => (
          <ActionItemRow key={item.id} item={item} onToggle={onToggle} />
        )) : <p className="text-center py-6 text-sm text-slate-500">No action items. You're all caught up!</p>}
      </ul>
    </Card>
  );
};