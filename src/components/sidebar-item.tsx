import type { ComponentType } from 'react';

type SidebarItemProps = {
    itemKey: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    count?: number;
    selected?: boolean;
    priority?: 'low' | 'medium' | 'high' ;
    showCount?: boolean;
    onClick?: (key: string) => void;
};

export default function SidebarItem({ itemKey, icon: Icon, title, count = 0, selected, priority = 'low', showCount = true, onClick }: SidebarItemProps) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-300 ${selected ?
         'bg-task-selected shadow-glow-emerald' : 
         'hover:bg-task-hover hover:translate-x-1'}`} onClick={() => onClick?.(itemKey)}>
            <Icon className={`w-4 h-4 text-accent ${priority === 'high' ? 'text-priority-high' : priority === 'medium' ? 'text-priority-medium' : 'text-priority-low' }`} />
            <span className='flex-1'>{title}</span>
            {showCount && <span className={`text-sm px-2 py-1 rounded-full text-background ${priority === 'high' ? 'bg-priority-high' : priority === 'medium' ? 'bg-priority-medium' :  'bg-priority-low' }`}>{count}</span>}
        </div>
    )
}
