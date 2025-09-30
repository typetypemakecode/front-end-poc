
import SidebarItem from './sidebar-item'
import type { ComponentType } from 'react';

type ListProps = {
    title: string;
    onItemClick?: (key: string) => void;
    items: {
        key: string;
        icon: ComponentType<{ className?: string }>;
        title: string;
        count: number;
        selected: boolean;
        priority?: 'low' | 'medium' | 'high';
        showCount?: boolean;
    }[];
}

export default function List({ title, items, onItemClick }: ListProps) {

    return (
        <div className='mb-6'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>{title}</h3>
            <div className='space-y-1'>
{items.map(item => (
    <SidebarItem
        key={item.key}
        itemKey={item.key}
        icon={item.icon}
        title={item.title}
        count={item.count}
        selected={item.selected}
        priority={item.priority}
        showCount={item.showCount}
        onClick={() => onItemClick?.(item.key)}
    />
))}
            </div>
        </div>
            
    )
}
