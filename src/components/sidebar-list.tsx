
import SidebarItem from './sidebar-item'
import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';

type ListProps = {
    title: string;
    onItemClick?: (key: string) => void;
    items: {
        key: string;
        icon: ComponentType<{ className?: string }>;
        title: string;
        description?: string;
        count: number;
        selected: boolean;
        priority?: 'low' | 'medium' | 'high';
        dueDate?: string;
        showCount?: boolean;
    }[];
}

export default function List({ title, items, onItemClick }: ListProps) {
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
        let targetIndex: number | null = null;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                targetIndex = currentIndex < items.length - 1 ? currentIndex + 1 : currentIndex;
                break;
            case 'ArrowUp':
                e.preventDefault();
                targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
                break;
            case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                targetIndex = items.length - 1;
                break;
        }

        if (targetIndex !== null && targetIndex !== currentIndex) {
            const targetKey = items[targetIndex].key;
            const targetElement = itemRefs.current.get(targetKey);
            targetElement?.focus();
        }
    };

    const setItemRef = (key: string, element: HTMLButtonElement | null) => {
        if (element) {
            itemRefs.current.set(key, element);
        } else {
            itemRefs.current.delete(key);
        }
    };

    // Clean up refs when items change
    useEffect(() => {
        const currentKeys = new Set(items.map(item => item.key));
        const refsToDelete: string[] = [];

        itemRefs.current.forEach((_, key) => {
            if (!currentKeys.has(key)) {
                refsToDelete.push(key);
            }
        });

        refsToDelete.forEach(key => itemRefs.current.delete(key));
    }, [items]);

    return (
        <nav className='mb-6' aria-label={title}>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>{title}</h3>
            <ul className='space-y-1' role="list">
{items.map((item, index) => (
    <li key={item.key}>
        <SidebarItem
            itemKey={item.key}
            icon={item.icon}
            title={item.title}
            count={item.count}
            selected={item.selected}
            priority={item.priority}
            showCount={item.showCount}
            onClick={() => onItemClick?.(item.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => setItemRef(item.key, el)}
        />
    </li>
))}
            </ul>
        </nav>

    )
}
