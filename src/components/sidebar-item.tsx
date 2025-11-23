import type { ComponentType } from 'react';
import { forwardRef } from 'react';

type SidebarItemProps = {
    itemKey: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    count?: number;
    selected?: boolean;
    priority?: 'low' | 'medium' | 'high' ;
    showCount?: boolean;
    onClick?: (key: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
    ({ itemKey, icon: Icon, title, count = 0, selected, priority = 'low', showCount = true, onClick, onKeyDown }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 text-left ${selected ?
                 'bg-task-selected shadow-glow-emerald' :
                 'hover:bg-task-hover hover:translate-x-1'}`}
                onClick={() => onClick?.(itemKey)}
                onKeyDown={onKeyDown}
                aria-label={`${title}${showCount ? `, ${count} tasks` : ''}`}
                aria-current={selected ? 'page' : undefined}
            >
                <Icon className={`w-4 h-4 text-accent ${priority === 'high' ? 'text-priority-high' : priority === 'medium' ? 'text-priority-medium' : 'text-priority-low' }`} aria-hidden="true" />
                <span className='flex-1'>{title}</span>
                {showCount && <span className={`text-sm px-2 py-1 rounded-full text-background ${priority === 'high' ? 'bg-priority-high' : priority === 'medium' ? 'bg-priority-medium' :  'bg-priority-low' }`} aria-label={`${count} tasks`}>{count}</span>}
            </button>
        )
    }
);

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;
