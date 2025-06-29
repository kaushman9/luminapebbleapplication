import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icons';
import { User, Asset } from '../../types';

interface TopBarProps {
  currentUser: User;
  assignedAssets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onToggleMobileSidebar: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CustomDropdown: React.FC<{
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ assets, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedAsset = assets.find(a => a.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);
  
  return (
    <div className="relative w-48" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-200"
      >
        <span className="truncate">{selectedAsset?.name || 'Select Asset'}</span>
        {isOpen ? <Icon name="chevron-up" className="h-4 w-4 text-slate-500" /> : <Icon name="chevron-down" className="h-4 w-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md border border-slate-200 dark:border-slate-700 py-1">
          {assets.map(asset => (
            <button 
              key={asset.id}
              onClick={() => { onSelect(asset.id); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 flex items-center justify-between"
            >
              <span className="truncate">{asset.name}</span>
              {asset.id === selectedId && <Icon name="check-circle" className="h-4 w-4 text-primary-500" />}
            </button>
          ))}
          {assets.length === 0 && <span className="px-3 py-2 text-sm text-slate-500">No assigned assets</span>}
        </div>
      )}
    </div>
  );
}

const UserActionsMenu: React.FC<{ onNavigate: (page: string) => void; onLogout: () => void; }> = ({ onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
        <Icon name="user-circle" className="h-6 w-6" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 z-20">
          <button
            onClick={() => { onNavigate('MyProfile'); setIsOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            My Profile
          </button>
          <button
            onClick={() => { onLogout(); setIsOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};


const TopBar: React.FC<TopBarProps> = ({ currentUser, assignedAssets, selectedAssetId, onSelectAsset, onToggleMobileSidebar, onNavigate, onLogout }) => {
  const [darkMode, setDarkMode] = React.useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  const currentAssignment = currentUser.assignments.find(a => a.assetId === selectedAssetId);
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  
  return (
    <div className="flex-shrink-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleMobileSidebar} className="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-400">
          <Icon name="bars-3" className="h-6 w-6" />
        </button>
        <CustomDropdown
          assets={assignedAssets}
          selectedId={selectedAssetId}
          onSelect={onSelectAsset}
        />
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="text-right">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{fullName}</p>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">{currentAssignment?.positionTitle || 'No active role'}</p>
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden sm:flex items-center space-x-2">
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button 
              onClick={() => console.log('Notifications clicked')}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Notifications"
            >
              <Icon name="bell" className="h-6 w-6" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Toggle dark mode"
            >
              {darkMode ? <Icon name="sun" className="h-6 w-6" /> : <Icon name="moon" className="h-6 w-6" />}
            </button>
             <button
                onClick={() => onNavigate('MyProfile')}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="My Profile"
              >
                My Profile
            </button>
            <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Logout"
            >
                Logout
            </button>
        </div>
        
        {/* Mobile Dropdown Menu */}
        <div className="sm:hidden">
            <UserActionsMenu onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;