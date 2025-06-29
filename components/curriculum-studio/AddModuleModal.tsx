import React from 'react';
import { Modal } from '../ui/Modal';
import { ModuleType } from '../../types';
import { Icon } from '../ui/Icons';

interface AddModuleModalProps {
  onAdd: (type: ModuleType) => void;
  onClose: () => void;
}

const moduleTypes: { type: ModuleType; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { type: 'Video', label: 'Video', icon: 'video-camera' },
    { type: 'Document', label: 'Document', icon: 'document-text' },
    { type: 'Quiz', label: 'Quiz / Exam', icon: 'question-mark-circle' },
    { type: 'LiveSession', label: 'Live Session', icon: 'users' },
    { type: 'PeerReview', label: 'Peer Review', icon: 'user-group' },
    { type: 'Simulation', label: 'Simulation', icon: 'desktop-computer' },
];

export const AddModuleModal: React.FC<AddModuleModalProps> = ({ onAdd, onClose }) => {
  return (
    <Modal show={true} onClose={onClose} title="Add New Module">
      <p className="text-sm text-slate-500 mb-4">Select the type of content you want to add.</p>
      <div className="grid grid-cols-2 gap-4">
        {moduleTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-slate-200 p-6 text-center hover:border-primary-500 hover:bg-primary-50 dark:border-slate-700 dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
          >
            <Icon name={icon} className="h-8 w-8 text-primary-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
