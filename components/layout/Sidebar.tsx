import React, { useState } from 'react';
import { Icon } from '../ui/Icons';
import { User, AssetTypeConfig } from '../../types';

interface NavItemProps {
  iconName: React.ComponentProps<typeof Icon>['name'];
  label: string;
  active?: boolean;
  isExpanded: boolean;
  onClick: () => void;
  isSubItem?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ iconName, label, active = false, isExpanded, onClick, isSubItem = false }) => {
  const baseClasses = 'w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors text-left';
  const activeClasses = 'bg-primary-600 text-white shadow-sm cursor-default';
  const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-800';
  const collapsedClasses = isExpanded ? (isSubItem ? 'pl-9 pr-3' : 'px-3') : 'justify-center px-2';
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${collapsedClasses}`} disabled={active} title={!isExpanded ? label : ''}>
      <Icon name={iconName} className={`h-5 w-5 flex-shrink-0 ${isExpanded && !isSubItem ? 'mr-3' : 'mr-0'}`} />
      <span className={!isExpanded ? 'hidden' : `inline ${isSubItem ? 'ml-3' : ''}`}>{label}</span>
    </button>
  );
};


interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, contextId?: string) => void;
  currentUser: User;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
  assetTypeConfig?: AssetTypeConfig | null;
  selectedAssetId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, onNavigate, currentUser, isMobileOpen, setMobileOpen, assetTypeConfig, selectedAssetId, isCollapsed, onToggleCollapse
}) => {
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  
  const hasAdminAccess = currentUser.globalPermissions?.includes('ACCESS_ADMIN_PANEL');
  
  const isEffectivelyExpanded = !isCollapsed || isHoverExpanded;

  const currentAssignmentForSelectedAsset = currentUser.assignments.find(a => a.assetId === selectedAssetId);
  const currentPositionId = currentAssignmentForSelectedAsset?.positionId;

  // Dynamically build the contextual navigation based on the asset type config and user permissions
  const contextualNavItems = assetTypeConfig && currentPositionId ? assetTypeConfig.pages
    .filter(page => {
      // Filter pages based on whether the user's position has access
      const hasAccess = assetTypeConfig.permissionMatrix[currentPositionId!]?.[page.id] ?? false;
      // Exclude dashboards from this dynamic list as it is now in the General section
      const isDashboardPage = page.name.toLowerCase().includes('dashboard');
      return hasAccess && !isDashboardPage;
    })
    .map(page => ({
      key: page.id,
      label: page.name,
      iconName: page.icon as React.ComponentProps<typeof Icon>['name'],
      pageName: page.name, 
    })) : [];
  
  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHoverExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHoverExpanded(false);
  };
  
  const sidebarContent = (
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 transition-all duration-300 ${isEffectivelyExpanded ? 'px-4 justify-start' : 'px-0 justify-center'}`}>
          <Icon name="globe-alt" className="h-8 w-8 text-primary-600 flex-shrink-0" />
          {isEffectivelyExpanded && (
            <h1 className="ml-3 text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap">
              Atlas
            </h1>
          )}
        </div>
        
        {/* Main Content of Sidebar (Nav, Admin, Toggle) */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          <div className="p-4 space-y-4">
              {/* General Pages Section */}
               <div>
                <h3 className={`px-3 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-opacity duration-200 ${!isEffectivelyExpanded ? 'opacity-0' : 'opacity-100'}`}>
                    General
                </h3>
                <div className="space-y-1">
                    <NavItem iconName="home" label="Dashboard" active={currentPage.includes('Dashboard')} onClick={() => onNavigate('Dashboard')} isExpanded={isEffectivelyExpanded} />
                    <NavItem iconName="list-bullet" label="Projects and Tasks" active={currentPage === 'Action Center'} onClick={() => onNavigate('Action Center')} isExpanded={isEffectivelyExpanded} />
                    <NavItem iconName="academic-cap" label="My Learning" active={currentPage === 'University'} onClick={() => onNavigate('University')} isExpanded={isEffectivelyExpanded} />
                    <NavItem iconName="book-open" label="Employee Handbook" active={currentPage === 'Employee Handbook'} onClick={() => onNavigate('Employee Handbook')} isExpanded={isEffectivelyExpanded} />
                </div>
              </div>

              {/* Specific Pages Section */}
              {contextualNavItems.length > 0 && (
                 <div>
                    <div className="border-t border-slate-200/80 dark:border-slate-800 my-4 border-dashed"></div>
                    <h3 className={`px-3 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-opacity duration-200 ${!isEffectivelyExpanded ? 'opacity-0' : 'opacity-100'}`}>
                        Specific Pages
                    </h3>
                    <div className="space-y-1">
                        {contextualNavItems.map(item => (
                          <NavItem 
                            key={item.key} 
                            iconName={item.iconName} 
                            label={item.label} 
                            active={currentPage === item.pageName} 
                            onClick={() => onNavigate(item.pageName)} 
                            isExpanded={isEffectivelyExpanded}
                          />
                        ))}
                    </div>
                </div>
              )}


              {/* Admin Navigation */}
              {hasAdminAccess && (
                <div>
                    <div className="border-t border-slate-200/80 dark:border-slate-800 my-2 border-dashed"></div>
                    <button 
                      onClick={() => setIsAdminOpen(!isAdminOpen)} 
                      className={`w-full flex justify-between items-center px-3 py-2 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-opacity duration-200 ${!isEffectivelyExpanded ? 'opacity-0 justify-center' : 'opacity-100'}`}
                    >
                      <span className={!isEffectivelyExpanded ? 'hidden' : 'inline'}>Admin Settings</span>
                      {isEffectivelyExpanded && <Icon name={isAdminOpen ? 'chevron-up' : 'chevron-down'} className="h-4 w-4" />}
                    </button>
                    {isAdminOpen && (
                        <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${isEffectivelyExpanded ? 'max-h-96' : 'max-h-0'}`}>
                            <NavItem iconName="users" label="User Management" active={currentPage === 'UserManagement' || currentPage === 'AdminUserProfile'} onClick={() => onNavigate('UserManagement')} isExpanded={isEffectivelyExpanded} isSubItem={true} />
                            <NavItem iconName="building-office" label="Asset Management" active={currentPage === 'AssetManagement'} onClick={() => onNavigate('AssetManagement')} isExpanded={isEffectivelyExpanded} isSubItem={true} />
                            <NavItem iconName="wrench-screwdriver" label="Access Control" active={currentPage === 'AccessControlHub'} onClick={() => onNavigate('AccessControlHub')} isExpanded={isEffectivelyExpanded} isSubItem={true} />
                            <NavItem iconName="clipboard-document-list" label="Templates Builder" active={currentPage === 'Templates Builder'} onClick={() => onNavigate('Templates Builder')} isExpanded={isEffectivelyExpanded} isSubItem={true} />
                            <NavItem iconName="academic-cap" label="Curriculum Studio" active={currentPage === 'Curriculum Studio'} onClick={() => onNavigate('Curriculum Studio')} isExpanded={isEffectivelyExpanded} isSubItem={true} />
                        </div>
                    )}
                </div>
              )}
          </div>
          
          {/* Collapse Toggle */}
          <div className="mt-auto p-2 border-t border-slate-200 dark:border-slate-800">
             <button 
               onClick={onToggleCollapse}
               className="w-full flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
               title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
             >
                {isCollapsed ? <Icon name="chevron-double-right" className="h-5 w-5" /> : <Icon name="chevron-double-left" className="h-5 w-5" />}
             </button>
          </div>
        </div>
      </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 transition-opacity md:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)}></div>
          <div className={`relative flex w-64 max-w-full h-full bg-white dark:bg-slate-900 transition-transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {sidebarContent}
          </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isEffectivelyExpanded ? 'w-64' : 'w-20'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;