import type { LucideIcon } from "lucide-react";

export type Priority = 'low' | 'medium' | 'high';

// API response types (icon as string name)
export interface SidebarItemData {
    key: string;
    iconName: string;
    title: string;
    count: number;
    priority: Priority;
    showCount?: boolean;
}

export interface SidebarConfigData {
    smartLists: SidebarItemData[];
    areas: SidebarItemData[];
    projects: SidebarItemData[];
}

// Component props types (icon as component)
export type SidebarItem = {
    key: string;
    icon: LucideIcon;
    title: string;
    count: number;
    selected: boolean;
    priority: 'low' | 'medium' | 'high';
    showCount?: boolean;
};

export interface SidebarSection{
    title: string;
    items: SidebarItem[];
}

export interface SidebarConfig {
    smartLists: SidebarItem[];
    areas: SidebarItem[];
    projects: SidebarItem[];
}