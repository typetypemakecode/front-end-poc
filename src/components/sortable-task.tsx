import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import Task from './task';
import type { TaskProps } from './task';

export default function SortableTask({id, title, description, dueDate, assignee, tags, completed, selected, onclick, onToggleComplete}: TaskProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const dragHandleButton = (
        <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Drag to reorder task: ${title}`}
            type="button"
        >
            <GripVertical className="w-5 h-5" aria-hidden="true" />
        </button>
    );

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
            <Task
                id={id}
                title={title}
                description={description}
                dueDate={dueDate}
                assignee={assignee}
                tags={tags}
                completed={completed}
                selected={selected}
                onclick={onclick}
                onToggleComplete={onToggleComplete}
                dragHandle={dragHandleButton}
            />
        </div>
    );
}   