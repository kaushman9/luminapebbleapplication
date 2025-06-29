import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icons';
import { format } from 'date-fns';

interface CreateTaskModalProps {
    onClose: () => void;
    onCreate: (description: string, dueDate: string) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onCreate }) => {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date());

    const handleCreate = () => {
        if (description.trim()) {
            onCreate(description.trim(), dueDate.toISOString());
        }
    };

    return (
        <Modal show={true} onClose={onClose} title="Create New Task">
            <div className="space-y-4">
                <div>
                    <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Task Description
                    </label>
                    <textarea
                        id="task-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="What needs to be done?"
                    />
                </div>
                <div>
                    <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Due Date
                    </label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={format(dueDate, 'yyyy-MM-dd')}
                        onChange={(e) => setDueDate(new Date(e.target.value))}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!description.trim()}
                        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                        Create Task
                    </button>
                </div>
            </div>
        </Modal>
    );
};