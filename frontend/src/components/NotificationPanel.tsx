import type { ElementType } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, HandCoins, AlertTriangle, ClipboardCheck, Wrench, Trash2, Users, ArrowLeftRight, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';
import { api } from '@/lib/api';

const typeIcon: Record<string, ElementType> = {
  'borrow-pending': HandCoins, 'borrow-approved': HandCoins, 'borrow-rejected': HandCoins,
  'asset-overdue': AlertTriangle, 'verification-due': ClipboardCheck, 'verification-assigned': ClipboardCheck,
  'discrepancy-created': AlertTriangle, 'maintenance-completed': Wrench,
  'disposal-review': Trash2, 'user-created': Users, 'asset-transferred': ArrowLeftRight, 'general': Info,
};

const typeColor: Record<string, string> = {
  'borrow-pending': 'text-warning', 'borrow-approved': 'text-success', 'borrow-rejected': 'text-destructive',
  'asset-overdue': 'text-destructive', 'verification-due': 'text-warning', 'verification-assigned': 'text-info',
  'discrepancy-created': 'text-destructive', 'maintenance-completed': 'text-success',
  'disposal-review': 'text-warning', 'user-created': 'text-info', 'asset-transferred': 'text-primary', 'general': 'text-muted-foreground',
};

function routeForNotification(notification: AppNotification): string {
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

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
  });

  const markAllMutation = useMutation({
    mutationFn: api.notifications.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markMutation = useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter(notification => !notification.read).length;

  const handleClick = (notification: AppNotification) => {
    if (!notification.read) {
      markMutation.mutate(notification.id);
    }
    setOpen(false);
    navigate(routeForNotification(notification));
  };

  const today = notifications.filter(notification => Date.now() - new Date(notification.timestamp).getTime() < 86400000);
  const earlier = notifications.filter(notification => Date.now() - new Date(notification.timestamp).getTime() >= 86400000);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => markAllMutation.mutate()}>
              <CheckCheck className="h-3.5 w-3.5" />Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <>
              {today.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
                  {today.map(notification => <NotifItem key={notification.id} notification={notification} onRead={id => markMutation.mutate(id)} onClick={handleClick} />)}
                </div>
              )}
              {earlier.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Earlier</p>
                  {earlier.map(notification => <NotifItem key={notification.id} notification={notification} onRead={id => markMutation.mutate(id)} onClick={handleClick} />)}
                </div>
              )}
            </>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setOpen(false); navigate('/notifications'); }}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotifItem({ notification, onRead, onClick }: { notification: AppNotification; onRead: (id: string) => void; onClick: (notification: AppNotification) => void }) {
  const Icon = typeIcon[notification.type] || Info;
  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0',
        !notification.read && 'bg-primary/[0.03]'
      )}
      onClick={() => onClick(notification)}
    >
      <div className={cn('mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0', !notification.read ? 'bg-primary/10' : 'bg-muted')}>
        <Icon className={cn('h-4 w-4', typeColor[notification.type] || 'text-muted-foreground')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm truncate', !notification.read ? 'font-semibold' : 'font-medium')}>{notification.title}</p>
          {notification.priority === 'high' && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Urgent</Badge>}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notification.timestamp)}</p>
      </div>
      {!notification.read && (
        <button
          className="mt-1 h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted shrink-0"
          onClick={event => { event.stopPropagation(); onRead(notification.id); }}
          title="Mark as read"
        >
          <Check className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
