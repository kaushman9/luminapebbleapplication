import React, { useEffect, useState } from 'react';
import { Icon } from './Icons';

type ModalSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-lg', // Default was lg, keeping it consistent
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};


export const Modal: React.FC<ModalProps> = ({ show, onClose, title, children, size = 'lg' }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (show) {
      setIsRendered(true);
    } 
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) {
      setIsRendered(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      onTransitionEnd={handleAnimationEnd}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div 
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full ${sizeClasses[size]} transition-all duration-300 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
          <div className="flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
              <Icon name="x-mark" className="h-5 w-5 text-slate-500"/>
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
      </div>
    </div>
  );
};