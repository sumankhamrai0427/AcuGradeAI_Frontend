import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LogOut } from 'lucide-react';

export interface PageAccess {
  id: number;
  icon: string;
  isActive: number;
  menuOrder: number;
  pageName: string;
  pageRoute: string;
}

interface SidebarProps {
  pageAccess: PageAccess[];
  isSidebarCollapsed: boolean;
  setMobileSidebarOpen?: (open: boolean) => void;
  onToggleSidebar?: () => void;
  onLogout: () => void;
  activePersona?: string;
  activeChildName?: string;
}

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  if (!IconComponent) return Icons.Circle; // fallback icon
  return IconComponent;
};

export const Sidebar: React.FC<SidebarProps> = ({
  pageAccess,
  isSidebarCollapsed,
  setMobileSidebarOpen,
  onToggleSidebar,
  onLogout,
  activePersona,
  activeChildName
}) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200">
      {/* Header / Brand */}
      <div className={`h-16 w-full flex items-center justify-between ${isSidebarCollapsed ? 'lg:justify-center px-4' : 'px-6'} border-b border-stone-100 flex-shrink-0 transition-all`}>
        <div className="flex items-center gap-2">
          <Icons.GraduationCap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <span className={`text-lg font-bold text-stone-900 tracking-tight transition-all ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            SahajPath<span className="text-yellow-500">.</span>
          </span>
        </div>

        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className={`hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors ${isSidebarCollapsed ? '' : 'ml-auto'}`}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <Icons.ChevronRight className="w-5 h-5" />
            ) : (
              <Icons.ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Dynamic Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
        {activePersona && !isSidebarCollapsed && (
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-2 mt-1">
            {activePersona === 'student' ? 'Student Workspace' : 'Family & Management'}
          </div>
        )}
        
        {(Array.isArray(pageAccess) ? pageAccess : [])
          .filter(page => page.isActive === 1)
          .sort((a, b) => a.menuOrder - b.menuOrder)
          .map((page) => {
            const Icon = getIconComponent(page.icon);
            return (
              <NavLink
                key={page.id}
                to={page.pageRoute}
                onClick={() => setMobileSidebarOpen?.(false)}
                className={({ isActive }) => `
                  group w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'}
                  ${isActive
                    ? 'text-yellow-600 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                  }
                `}
                title={page.pageName}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-yellow-600' : 'text-stone-400 group-hover:text-stone-900'}`} />
                    <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                      {page.pageName}
                    </span>
                  </>
                )}
              </NavLink>
            );
        })}
      </nav>

      {/* Footer Actions (Logout) */}
      <div className="p-4 border-t border-stone-100 mt-auto">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors ${
            isSidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
          title="Log out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Log out</span>
        </button>
      </div>
    </div>
  );
};
