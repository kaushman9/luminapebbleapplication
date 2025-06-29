import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title?: string;
  confirmText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onConfirm,
  onCancel,
  message,
  title = "Confirm Deletion",
  confirmText = "Delete"
}) => {
  return (
    <Modal show={true} onClose={onCancel} title={title}>
      <div className="space-y-6">
        <p className="text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 rounded-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
