import React from 'react';
import { Card } from '../ui/Card';
import { ScorecardMetric, MetricStatus, MetricTrend } from '../../types';
import { Icon } from '../ui/Icons';

const statusStyles = {
  [MetricStatus.OnTrack]: {
    icon: 'check-circle' as const,
    iconColor: 'text-success-500 dark:text-success-400',
    borderColor: 'border-success-500',
  },
  [MetricStatus.AtRisk]: {
    icon: 'exclamation-triangle' as const,
    iconColor: 'text-warning-500 dark:text-warning-400',
    borderColor: 'border-warning-500',
  },
  [MetricStatus.OffTrack]: {
    icon: 'x-circle' as const,
    iconColor: 'text-danger-500 dark:text-danger-400',
    borderColor: 'border-danger-500',
  },
};

const trendIcons = {
    [MetricTrend.Up]: <Icon name="arrow-up" className="w-5 h-5 text-success-500" />,
    [MetricTrend.Down]: <Icon name="arrow-down" className="w-5 h-5 text-danger-500" />,
    [MetricTrend.Flat]: <Icon name="minus" className="w-5 h-5 text-slate-500" />,
}

const MetricCard: React.FC<{ metric: ScorecardMetric }> = ({ metric }) => {
  const styles = statusStyles[metric.status];

  return (
    <div className={`p-4 rounded-lg bg-white dark:bg-slate-900 border-l-4 shadow-sm ${styles.borderColor}`}>
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{metric.name}</p>
            <Icon name={styles.icon} className={`h-6 w-6 ${styles.iconColor}`} />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">/ {metric.target}</p>
            <div className="flex items-center">
                {trendIcons[metric.trend]}
            </div>
        </div>
        <div className="mt-4">
             <button
                onClick={() => console.log(`Action for ${metric.name}: ${metric.actionPrompt}`)}
                aria-label={`Action for ${metric.name}: ${metric.actionPrompt}`}
                className="w-full text-left text-sm text-primary-700 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center group"
              >
                <Icon name="information-circle" className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="group-hover:underline">{metric.actionPrompt}</span>
            </button>
        </div>
    </div>
  );
};

interface ScorecardProps {
  metrics: ScorecardMetric[];
}

export const Scorecard: React.FC<ScorecardProps> = ({ metrics }) => {
  return (
    <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">4P Performance Scorecard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(metric => (
                <MetricCard key={metric.id} metric={metric} />
            ))}
        </div>
    </div>
  );
};