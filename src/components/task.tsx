import { Circle, CircleCheckBig, Pencil } from "lucide-react"

    type Tag = {
        label: string;
        theme?: 'emerald' | 'purple';
    }

    export type TaskProps = {
        id: string;
        title: string;
        description?: string;
        dueDate?: string;
        assignee?: string;
        tags?: Tag[];
        completed?: boolean;
        selected?: boolean;
        onclick?: (id: string) => void;
        onToggleComplete?: (id: string) => void;
        onEdit?: (id: string) => void;
        dragHandle?: React.ReactNode;
    }

export default function Task({ id, title, description, dueDate, assignee, tags, completed, selected, onclick, onToggleComplete, onEdit, dragHandle }: TaskProps) {

    const handleCircleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the task selection
        onToggleComplete?.(id);
    };

    return (
        <article
            className={`relative p-4 mt-6 ${selected ? 'bg-task-selected border border-primary shadow-glow-emerald' : 'bg-card border border-border'} rounded ${completed ? 'opacity-60' : ''} transition-opacity cursor-pointer`}
            onClick={() => onclick?.(id)}
            aria-label={`Task: ${title}`}
            aria-selected={selected}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onclick?.(id);
                }
            }}
        >
            <div className="flex items-start gap-3">
                {dragHandle && <div className="flex items-center">{dragHandle}</div>}
                <button
                    onClick={handleCircleClick}
                    className="hover:scale-110 transition-transform"
                    aria-label={completed ? `Mark task "${title}" as incomplete` : `Mark task "${title}" as complete`}
                    type="button"
                >
                    {completed ? <CircleCheckBig className="text-accent" aria-hidden="true" /> : <Circle aria-hidden="true" />}
                </button>
                <div className='flex-1'>
                    <h4 className='font-medium'>{title}</h4>
                    {description && <p className='text-sm mt-1 text-muted-foreground'>{description}</p>}
                    <div className='flex items-center gap-4 mt-2'>
                        {dueDate && <span className='text-sm text-muted-foreground'>Due: {dueDate}</span>}
                        {assignee && <span className='text-sm text-muted-foreground'>👤 {assignee}</span>}
                        {tags && tags.length > 0 && (
                            <div role="list" aria-label="Task tags">
                                {tags.map(tag => {
                                    const themeClasses = tag.theme === 'purple'
                                        ? 'bg-tag-purple text-purpureus'
                                        : 'bg-glow-emerald text-emerald';
                                    return (
                                        <span key={tag.label} className={`${themeClasses} p-1.5 rounded-2xl text-xs`} role="listitem">
                                            {tag.label}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {/* Edit button - only visible when selected */}
            {selected && onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label={`Edit task "${title}"`}
                    type="button"
                >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </article>
    )
}