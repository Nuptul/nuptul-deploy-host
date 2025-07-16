import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Utensils, MapPin, MessageSquare, Eye, Edit, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { EnhancedRSVP } from './types';

interface RSVPListProps {
  rsvps: EnhancedRSVP[];
}

const RSVPList: React.FC<RSVPListProps> = ({ rsvps }) => {
  const [selectedRSVP, setSelectedRSVP] = useState<EnhancedRSVP | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending': return CheckCircle;
      case 'declined': return XCircle;
      case 'maybe': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'default';
      case 'declined': return 'destructive';
      case 'maybe': return 'secondary';
      default: return 'outline';
    }
  };

  const handleViewDetails = (rsvp: EnhancedRSVP) => {
    setSelectedRSVP(rsvp);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <div className="space-y-2 h-64 overflow-y-auto">
        {rsvps.slice(0, 10).map((rsvp) => {
          const StatusIcon = getStatusIcon(rsvp.status);
          return (
            <div key={rsvp.id} className="neu-card p-3 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-1 ${
                    rsvp.status === 'attending' ? 'text-glass-green' :
                    rsvp.status === 'declined' ? 'text-glass-pink' :
                    rsvp.status === 'maybe' ? 'text-glass-blue' :
                    'text-muted-foreground'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-wedding-navy truncate group-hover:text-wedding-gold transition-colors">
                      {rsvp.profiles.first_name && rsvp.profiles.last_name
                        ? `${rsvp.profiles.first_name} ${rsvp.profiles.last_name}`
                        : rsvp.profiles.email
                      }
                      {rsvp.plus_one_name && (
                        <span className="text-xs text-glass-pink ml-2">+{rsvp.plus_one_name}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {rsvp.profiles.email}
                    </div>
                    
                    {/* Enhanced details */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rsvp.dietary_restrictions && (
                        <Badge variant="outline" className="text-xs">
                          <Utensils className="w-2 h-2 mr-1" />
                          {rsvp.dietary_restrictions}
                        </Badge>
                      )}
                      {rsvp.table_assignment && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-2 h-2 mr-1" />
                          Table {rsvp.table_assignment}
                        </Badge>
                      )}
                      {rsvp.accommodation_needed && (
                        <Badge variant="outline" className="text-xs bg-glass-blue">
                          Accommodation
                        </Badge>
                      )}
                      {rsvp.transportation_needed && (
                        <Badge variant="outline" className="text-xs bg-glass-purple">
                          Transport
                        </Badge>
                      )}
                    </div>
                    
                    {rsvp.message && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        <MessageSquare className="w-2 h-2 inline mr-1" />
                        {rsvp.message.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge variant={getStatusColor(rsvp.status)}>
                      {rsvp.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDetails(rsvp)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {rsvp.guest_count > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {rsvp.guest_count} guests
                    </Badge>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(rsvp.updated_at || rsvp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {rsvps.length > 10 && (
          <div className="text-center text-xs text-muted-foreground">
            Showing 10 of {rsvps.length} RSVPs
          </div>
        )}
      </div>

      {/* Enhanced Detail View Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="glass-popup max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Guest Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRSVP && (
            <div className="space-y-6">
              {/* Guest Information */}
              <div className="neu-card p-4 space-y-3">
                <h4 className="font-semibold text-wedding-navy flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Guest Information
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Full Name</label>
                    <div className="font-medium">
                      {selectedRSVP.profiles.first_name && selectedRSVP.profiles.last_name
                        ? `${selectedRSVP.profiles.first_name} ${selectedRSVP.profiles.last_name}`
                        : 'Not provided'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <div className="font-medium flex items-center gap-2">
                      {selectedRSVP.profiles.email}
                      <Button size="sm" variant="ghost" className="p-1 h-auto">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Phone</label>
                    <div className="font-medium flex items-center gap-2">
                      {selectedRSVP.profiles.phone || 'Not provided'}
                      {selectedRSVP.profiles.phone && (
                        <Button size="sm" variant="ghost" className="p-1 h-auto">
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Guest Count</label>
                    <div className="font-medium">{selectedRSVP.guest_count || 1}</div>
                  </div>
                </div>
                
                {selectedRSVP.plus_one_name && (
                  <div>
                    <label className="text-xs text-muted-foreground">Plus One</label>
                    <div className="font-medium">{selectedRSVP.plus_one_name}</div>
                  </div>
                )}
              </div>

              {/* RSVP Status & Preferences */}
              <div className="neu-card p-4 space-y-3">
                <h4 className="font-semibold text-wedding-navy flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  RSVP Status & Preferences
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <Badge variant={getStatusColor(selectedRSVP.status)} className="ml-2">
                      {selectedRSVP.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Response Date</label>
                    <div className="font-medium">
                      {new Date(selectedRSVP.updated_at || selectedRSVP.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {selectedRSVP.dietary_restrictions && (
                  <div>
                    <label className="text-xs text-muted-foreground">Dietary Restrictions</label>
                    <div className="font-medium">{selectedRSVP.dietary_restrictions}</div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedRSVP.accommodation_needed || false}
                      disabled
                      className="rounded"
                    />
                    <span className="text-sm">Needs Accommodation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedRSVP.transportation_needed || false}
                      disabled
                      className="rounded"
                    />
                    <span className="text-sm">Needs Transportation</span>
                  </div>
                </div>
                
                {selectedRSVP.table_assignment && (
                  <div>
                    <label className="text-xs text-muted-foreground">Table Assignment</label>
                    <div className="font-medium">Table {selectedRSVP.table_assignment}</div>
                  </div>
                )}
              </div>

              {/* Message */}
              {selectedRSVP.message && (
                <div className="neu-card p-4 space-y-3">
                  <h4 className="font-semibold text-wedding-navy flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Guest Message
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm italic">
                    "{selectedRSVP.message}"
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RSVPList;