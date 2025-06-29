import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { PlaybookLog, PlaybookEntry } from '../types';
import { Icon } from '../components/ui/Icons';
import { format } from 'date-fns';

interface PlaybookItemProps {
  item: PlaybookEntry;
  onToggle: (id: string, isCompleted: boolean) => void;
}

const PlaybookItem: React.FC<PlaybookItemProps> = ({ item, onToggle }) => {
  // Optimistic UI: manage local state for immediate feedback
  const [isCompleted, setIsCompleted] = useState(item.isCompleted);

  const handleToggle = () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState); // Update local UI instantly
    onToggle(item.id, newCompletedState); // Propagate change to parent for "server" update
  };

  return (
    <li className={`flex items-start space-x-4 py-3 px-2 rounded-lg transition-colors duration-200 ${isCompleted ? 'bg-green-50 dark:bg-green-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
      <div className="flex-shrink-0 pt-0.5">
        <button 
          onClick={handleToggle}
          aria-label={isCompleted ? `Mark '${item.label}' as incomplete` : `Mark '${item.label}' as complete`}
          className="cursor-pointer group"
        >
          {isCompleted ? (
            <Icon name="check-badge" className="h-6 w-6 text-green-500" />
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary-500 transition-colors bg-white dark:bg-slate-900 flex items-center justify-center" />
          )}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
          {item.label}
        </p>
        {isCompleted && item.completedBy && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                <Icon name="clock" className="h-3 w-3 mr-1"/>
                <span>Completed by {item.completedBy} at {format(new Date(item.completedAt!), 'h:mm a')}</span>
            </div>
        )}
      </div>
    </li>
  );
};


interface ShiftPlaybookProps {
  log: PlaybookLog;
  onToggleItem: (entryId: string, newCompletedState: boolean) => void;
}

const ShiftPlaybook: React.FC<ShiftPlaybookProps> = ({ log, onToggleItem }) => {

  const sections = Array.from(new Set(log.entries.map(e => e.section)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Shift Playbook
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            For {log.assetName} on {format(new Date(log.shiftDate), 'eeee, MMMM d, yyyy')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm">
            Submit & Close Shift
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => {
            const itemsInSection = log.entries.filter(e => e.section === section);
            return (
                <Card key={section} title={section}>
                    <ul className="divide-y divide-slate-200/80 dark:divide-slate-800 -my-2">
                        {itemsInSection.map(item => (
                            <PlaybookItem key={item.id} item={item} onToggle={onToggleItem} />
                        ))}
                    </ul>
                </Card>
            );
        })}
      </div>

    </div>
  );
};

export default ShiftPlaybook;