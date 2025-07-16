import React from 'react';
import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { RSVPEvent } from './types';

interface RSVPFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  selectedEvent: string;
  setSelectedEvent: (eventId: string) => void;
  events: RSVPEvent[];
  pendingCount: number;
  onSendReminders: () => void;
  showReminderDialog: boolean;
  setShowReminderDialog: (show: boolean) => void;
}

const RSVPFilters: React.FC<RSVPFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  selectedEvent,
  setSelectedEvent,
  events,
  pendingCount,
  onSendReminders,
  showReminderDialog,
  setShowReminderDialog
}) => {
  return (
    <>
      {/* Enhanced Actions */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Bell className="w-3 h-3 mr-1" />
              Send Reminders
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send RSVP Reminders</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send RSVP reminders to {pendingCount} guests who haven't responded yet.
              </p>
              <div className="flex space-x-2">
                <Button onClick={onSendReminders} className="flex-1">
                  Send Reminders
                </Button>
                <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search RSVPs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-secondary border-0 flex-1"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="maybe">Maybe</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default RSVPFilters;