import {
  Activity,
  Briefcase,
  Calendar,
  CalendarDays,
  Circle,
  Folder,
  Globe,
  House,
  Inbox,
  Megaphone,
  Smartphone,
  Tag,
  TriangleAlert,
  type LucideIcon
} from 'lucide-react';

/**
 * Valid icon names - union type for type safety
 */
export type IconName =
  | 'Activity'
  | 'Briefcase'
  | 'Calendar'
  | 'CalendarDays'
  | 'Circle'
  | 'Folder'
  | 'Globe'
  | 'House'
  | 'Inbox'
  | 'Megaphone'
  | 'Smartphone'
  | 'Tag'
  | 'TriangleAlert';

export const iconMap: Record<IconName, LucideIcon> = {
  Activity,
  Briefcase,
  Calendar,
  CalendarDays,
  Circle,
  Folder,
  Globe,
  House,
  Inbox,
  Megaphone,
  Smartphone,
  Tag,
  TriangleAlert,
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName as IconName] || Circle; // fallback to Circle if icon not found
}