import React from 'react';
import { Icon } from '../ui/Icons';
import { CustomSelect } from '../ui/CustomSelect';
import { Asset, User } from '../../types';

export interface Filters {
    type: 'all' | 'projects' | 'tasks' | 'recurring';
    dateFilter: 'all' | 'overdue' | 'today';
    asset: string; // 'all' or assetId
    assignee: string; // 'me' or userId
    keyword: string;
}

interface FilterBarProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    assets: Asset[];
    users: User[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, assets, users }) => {
    
    const handleFilter = (key: keyof Filters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const assetOptions = [
        { value: 'all', label: 'All Assets' },
        ...assets.map(a => ({ value: a.id, label: a.name }))
    ];

    const assigneeOptions = [
        { value: 'me', label: 'Assigned to Me' },
        { value: 'all', label: 'Anyone' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <div className="relative flex-grow min-w-[200px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="magnifying-glass" className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by keyword..."
                    value={filters.keyword}
                    onChange={(e) => handleFilter('keyword', e.target.value)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500"
                />
            </div>
            <div className="w-48">
                 <CustomSelect
                    options={assetOptions}
                    selectedValue={filters.asset}
                    onSelect={(value) => handleFilter('asset', value)}
                />
            </div>
             <div className="w-48">
                 <CustomSelect
                    options={assigneeOptions}
                    selectedValue={filters.assignee}
                    onSelect={(value) => handleFilter('assignee', value)}
                />
            </div>
        </div>
    );
};