import { Circle, CircleCheckBig } from "lucide-react"

    type Tag = {
        label: string;
        theme?: 'emerald' | 'purple';
    }

    type TaskProps = {
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
    }

export default function Task({ id, title, description, dueDate, assignee, tags, completed, selected, onclick, onToggleComplete }: TaskProps) {

    const handleCircleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the task selection
        onToggleComplete?.(id);
    };

    return (
        <div className={`p-4 mt-6 ${selected ? 'bg-task-selected border border-primary shadow-glow-emerald' : 'bg-card border border-border'} rounded ${completed ? 'opacity-60' : ''} transition-opacity cursor-pointer`} onClick={() => onclick?.(id)}>
            <div className="flex items-start gap-3">
                <button onClick={handleCircleClick} className="hover:scale-110 transition-transform">
                    {completed ? <CircleCheckBig className="text-accent" /> : <Circle />}
                </button>
                <div className='flex-1'>
                    <h4 className='font-medium'>{title}</h4>
                    <p className='text-sm mt-1 text-muted-foreground'>{description}</p>
                    <div className='flex items-center gap-4 mt-2'>
                        <span className='text-sm text-muted-foreground'>Due: {dueDate}</span>
                        <span className='text-sm text-muted-foreground'>👤 {assignee}</span>
                        {tags?.map(tag => {
                            const themeClasses = tag.theme === 'purple'
                                ? 'bg-tag-purple text-purpureus'
                                : 'bg-glow-emerald text-emerald';
                            return (
                                <span key={tag.label} className={`${themeClasses} p-1.5 rounded-2xl text-xs`}>
                                    {tag.label}
                                </span>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    )
}