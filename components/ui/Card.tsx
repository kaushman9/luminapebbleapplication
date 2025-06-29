import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', action, bodyClassName = 'p-4 sm:p-5' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-800">
          {title && <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
};
