import type { LucideIcon } from "lucide-react";
import type { IconName } from "../utils/iconMapper";
import type { Priority } from '../schemas';
import type { NoteSection, JournalEntry } from './notes';

// Re-export shared Priority type from schemas
export type { Priority };

// API response types (icon as string name)
export interface SidebarItemData {
    key: string;
    iconName: IconName;
    title: string;
    description?: string;
    count: number;
    priority: Priority;
    dueDate?: string;
    showCount?: boolean;
    sections?: NoteSection[];
    journal?: JournalEntry[];
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