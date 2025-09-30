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

export const iconMap: Record<string, LucideIcon> = {
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
  return iconMap[iconName] || Circle; // fallback to Circle if icon not found
}