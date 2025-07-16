import { NavigationRoute } from './types';
import { Home, Calendar, LayoutGrid, Users, Image } from 'lucide-react';

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, isCenter: true },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
];