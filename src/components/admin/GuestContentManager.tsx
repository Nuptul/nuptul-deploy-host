import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  Edit,
  Save,
  Calendar,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Camera,
  Heart,
  Settings,
  CheckCircle,
  Gift
} from 'lucide-react';

const GuestContentManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  const sections = [
    { id: 'dashboard', label: 'Guest Dashboard', icon: Heart },
    { id: 'schedule', label: 'Event Schedule', icon: Calendar },
    { id: 'venue', label: 'Venue Info', icon: MapPin },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'gallery', label: 'Photo Gallery', icon: Camera }
  ];

  const toggleEdit = (section: string) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Dashboard Content</h3>
        <Button 
          onClick={() => toggleEdit('dashboard')}
          variant={editMode.dashboard ? 'default' : 'outline'}
        >
          {editMode.dashboard ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {editMode.dashboard ? 'Save Changes' : 'Edit Content'}
        </Button>
      </div>

      {/* Quick Stats Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quick Stats Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Days Until Wedding</label>
              <input 
                type="text" 
                value="142" 
                disabled={!editMode.dashboard}
                className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default RSVP Status Display</label>
              <select 
                disabled={!editMode.dashboard}
                className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
              >
                <option>Attending</option>
                <option>Pending</option>
                <option>Declined</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Update RSVP', icon: CheckCircle, enabled: true },
              { name: 'Venue Details', icon: MapPin, enabled: true },
              { name: 'Gift Registry', icon: Gift, enabled: true },
              { name: 'Share Photos', icon: Camera, enabled: true }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span>{action.name}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={action.enabled}
                    disabled={!editMode.dashboard}
                    className="w-4 h-4"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScheduleContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Schedule Management</h3>
        <Button 
          onClick={() => toggleEdit('schedule')}
          variant={editMode.schedule ? 'default' : 'outline'}
        >
          {editMode.schedule ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {editMode.schedule ? 'Save Changes' : 'Edit Schedule'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wedding Day Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { time: '2:30 PM', event: 'Guest Arrival', location: 'Ben Ean Winery', color: 'blue' },
            { time: '3:00 PM', event: 'Wedding Ceremony', location: 'Ben Ean Winery', color: 'purple' },
            { time: '4:30 PM', event: 'Cocktail Hour', location: 'Garden Terrace', color: 'green' },
            { time: '6:00 PM', event: 'Reception', location: 'Ben Ean Function Centre', color: 'orange' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
              <input 
                type="time" 
                value={item.time}
                disabled={!editMode.schedule}
                className="p-2 border rounded disabled:bg-gray-100"
              />
              <input 
                type="text" 
                value={item.event}
                disabled={!editMode.schedule}
                className="flex-1 p-2 border rounded disabled:bg-gray-100"
              />
              <input 
                type="text" 
                value={item.location}
                disabled={!editMode.schedule}
                className="flex-1 p-2 border rounded disabled:bg-gray-100"
              />
              {editMode.schedule && (
                <Button variant="outline" size="sm">Remove</Button>
              )}
            </div>
          ))}
          {editMode.schedule && (
            <Button variant="outline" className="w-full">+ Add New Event</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVenueContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Venue Information Management</h3>
        <Button 
          onClick={() => toggleEdit('venue')}
          variant={editMode.venue ? 'default' : 'outline'}
        >
          {editMode.venue ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {editMode.venue ? 'Save Changes' : 'Edit Venue Info'}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea 
              value="123 Wedding Lane, Love City, LC 12345"
              disabled={!editMode.venue}
              className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Parking Information</label>
            <textarea 
              value="Complimentary valet parking available"
              disabled={!editMode.venue}
              className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dress Code</label>
            <input 
              type="text" 
              value="Formal attire requested"
              disabled={!editMode.venue}
              className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessagesContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Messages Management</h3>
        <Button variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Guest Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { from: 'Sarah & Mike', message: 'So excited to celebrate with you both!', time: '2 hours ago', approved: true },
            { from: 'Wedding Coordinator', message: 'Final headcount confirmation needed by Friday', time: '1 day ago', approved: true },
            { from: 'Guest User', message: 'Can we bring children to the reception?', time: '3 hours ago', approved: false }
          ].map((msg, index) => (
            <div key={index} className={`p-3 border rounded-lg ${msg.approved ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm">{msg.from}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  {!msg.approved && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline">Hide</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">{msg.message}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderGalleryContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photo Gallery Management</h3>
        <Button variant="outline">
          <Camera className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Allow guest photo uploads</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Require photo approval before display</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Enable photo downloads</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Photo Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No photos pending approval</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'schedule': return renderScheduleContent();
      case 'venue': return renderVenueContent();
      case 'messages': return renderMessagesContent();
      case 'gallery': return renderGalleryContent();
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Guest Content Management</h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          Control what guests see and experience
        </span>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
        {sections.map(section => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>

      {/* Preview Button */}
      <div className="flex justify-center pt-6 border-t">
        <Button className="px-8">
          <Eye className="w-4 h-4 mr-2" />
          Preview Guest Experience
        </Button>
      </div>
    </div>
  );
};

export default GuestContentManager;