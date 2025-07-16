export interface NavigationRoute {
  id: string;
  label: string;
  isCenter?: boolean;
  icon: React.ElementType;
}

export interface NavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export interface NavigationIconProps {
  route: NavigationRoute;
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface NavigationItemProps {
  route: NavigationRoute;
  isActive: boolean;
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
}