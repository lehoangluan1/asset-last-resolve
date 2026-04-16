import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Box, ArrowLeftRight, HandCoins, ClipboardCheck,
  AlertTriangle, Wrench, Trash2, BarChart3, Settings, Users, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/', grant: grants.dashboardRead },
    ],
  },
  {
    label: 'Asset Operations',
    items: [
      { label: 'Assets', icon: Box, path: '/assets', grant: grants.assetsRead },
      { label: 'Assignments & Transfers', icon: ArrowLeftRight, path: '/assignments', grant: grants.assignmentsRead },
      { label: 'Borrow Requests', icon: HandCoins, path: '/borrow-requests', grant: grants.borrowsRead },
    ],
  },
  {
    label: 'Verification',
    items: [
      { label: 'Verification Campaigns', icon: ClipboardCheck, path: '/verification', grant: grants.verificationRead },
      { label: 'Discrepancies', icon: AlertTriangle, path: '/discrepancies', grant: grants.discrepanciesRead },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Maintenance', icon: Wrench, path: '/maintenance', grant: grants.maintenanceRead },
      { label: 'Disposal', icon: Trash2, path: '/disposal', grant: grants.disposalRead },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Reports & Audit', icon: BarChart3, path: '/reports', grant: grants.reportsRead },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Reference Data', icon: Settings, path: '/admin', grant: grants.referenceManage },
      { label: 'User Management', icon: Users, path: '/users', grant: grants.usersManage },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { hasGrant } = useAuth();

  return (
    <aside className={cn(
      'flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex items-center gap-2 px-4 h-14 border-b shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-sm text-foreground tracking-tight">Asset Mgmt</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        {navGroups.map(group => {
          const items = group.items.filter(item => hasGrant(item.grant));
          if (items.length === 0) return null;
          return (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map(item => {
                const active = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )})}
      </nav>

      <div className="border-t p-2 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full rounded-lg py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
