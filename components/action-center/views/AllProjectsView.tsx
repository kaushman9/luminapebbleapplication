import React from 'react';
import { Icon } from '../../ui/Icons';

export const AllProjectsView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 rounded-lg bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed">
      <Icon name="folder" className="h-12 w-12 text-slate-400" />
      <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">All Projects Library</h2>
      <p className="mt-2 text-slate-500">This feature is coming soon!</p>
      <p className="text-sm text-slate-400">A searchable library of all active and archived projects will be available here.</p>
    </div>
  );
};