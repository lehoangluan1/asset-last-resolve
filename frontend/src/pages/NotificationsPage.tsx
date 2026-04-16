import type { ElementType } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCheck, Bell, HandCoins, AlertTriangle, ClipboardCheck, Wrench, Trash2, Users, ArrowLeftRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

const typeIcon: Record<string, ElementType> = {
  'borrow-pending': HandCoins, 'borrow-approved': HandCoins, 'borrow-rejected': HandCoins,
  'asset-overdue': AlertTriangle, 'verification-due': ClipboardCheck, 'verification-assigned': ClipboardCheck,
  'discrepancy-created': AlertTriangle, 'maintenance-completed': Wrench,
  'disposal-review': Trash2, 'user-created': Users, 'asset-transferred': ArrowLeftRight, 'general': Info,
};

function routeFor(notification: AppNotification): string {
  switch (notification.entityType) {
    case 'BorrowRequest': return '/borrow-requests';
    case 'Asset': return '/assets';
    case 'Campaign': return '/verification';
    case 'Discrepancy': return '/discrepancies';
    case 'Maintenance': return '/maintenance';
    case 'Disposal': return '/disposal';
    case 'User': return '/users';
    default: return '/';
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const readAllMutation = useMutation({
    mutationFn: api.notifications.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = query.data ?? [];
  const filtered = useMemo(() => {
    return notifications.filter(notification => {
      const matchSearch = !search || notification.title.toLowerCase().includes(search.toLowerCase()) || notification.message.toLowerCase().includes(search.toLowerCase());
      const matchTab = tab === 'all' || (tab === 'unread' && !notification.read) || (tab === 'read' && notification.read);
      return matchSearch && matchTab;
    });
  }, [notifications, search, tab]);

  const pagination = usePagination(filtered, 10);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div>
      <PageHeader title="All Notifications" description="Review and manage your notifications">
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => readAllMutation.mutate()}>
            <CheckCheck className="h-4 w-4" />Mark all as read
          </Button>
        )}
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {pagination.paginatedItems.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            pagination.paginatedItems.map(notification => {
              const Icon = typeIcon[notification.type] || Info;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-4 px-5 py-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors',
                    !notification.read && 'bg-primary/[0.03]'
                  )}
                  onClick={() => {
                    if (!notification.read) readMutation.mutate(notification.id);
                    navigate(routeFor(notification));
                  }}
                >
                  <div className={cn('mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0', !notification.read ? 'bg-primary/10' : 'bg-muted')}>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm', !notification.read ? 'font-semibold' : 'font-medium')}>{notification.title}</p>
                      {notification.priority === 'high' && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Urgent</Badge>}
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp).toLocaleString()}{notification.actor ? ` · ${notification.actor}` : ''}</p>
                  </div>
                </div>
              );
            })
          )}
          <PaginationBar
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            canPrev={pagination.canPrev}
            canNext={pagination.canNext}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            firstPage={pagination.firstPage}
            lastPage={pagination.lastPage}
            nextPage={pagination.nextPage}
            prevPage={pagination.prevPage}
          />
        </div>
      </div>
    </div>
  );
}
