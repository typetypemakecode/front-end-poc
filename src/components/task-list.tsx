import { useState, useEffect } from 'react'
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableTask from './sortable-task'
import { QuickAddTask } from './quick-add-task'
import { dataService } from '../services/dataService'
import type { TaskData } from '../types/task'
import { filterTasksByList } from '../utils/taskFilters'

interface TaskListProps {
    filterKey: number;
    selectedListId: string | null;
    onCountsChange?: () => void | Promise<void>;
}

export default function TaskList({ filterKey, selectedListId, onCountsChange }: TaskListProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Configure sensors for drag interaction
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Load tasks from service when filterKey or selectedListId changes
    useEffect(() => {
        const loadTasks = async () => {
            try {
                setIsLoading(true);

                // Map filterKey to status parameter
                let status: 'active' | 'completed' | undefined;
                if (filterKey === 2) status = 'active';
                if (filterKey === 3) status = 'completed';

                // Fetch all tasks first, then filter client-side for smart lists
                const fetchedTasks = await dataService.getTasks(undefined, status);

                // Filter tasks based on selected list
                const filteredTasks = filterTasksByList(fetchedTasks, selectedListId);

                setTasks(filteredTasks);
            } catch (error) {
                console.error('Failed to load tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTasks();
    }, [filterKey, selectedListId]);

    const handleTaskClick = (id: string) => {
        setSelectedTaskId(id);
    }

    const handleToggleComplete = async (id: string) => {
        try {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const newStatus = task.status === 'completed' ? 'active' : 'completed';
            const updatedTask = await dataService.updateTask(id, { status: newStatus });

            setTasks(tasks.map(t =>
                t.id === id ? updatedTask : t
            ));

            // Notify parent to refresh counts
            if (onCountsChange) {
                await onCountsChange();
            }
        } catch (error) {
            console.error('Failed to toggle task completion:', error);
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return; // No change needed
        }

        // Find the old and new index
        const oldIndex = tasks.findIndex(task => task.id === active.id);
        const newIndex = tasks.findIndex(task => task.id === over.id);

        // Reorder the tasks array
        const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

        // Optimistically update UI
        setTasks(reorderedTasks);

        try {
            // Persist the new order to the backend
            const taskIds = reorderedTasks.map(task => task.id);
            await dataService.reorderTasks(taskIds);

            // Refresh counts if needed
            if (onCountsChange) {
                await onCountsChange();
            }
        } catch (error) {
            console.error('Failed to reorder tasks:', error);
            // Revert on error
            setTasks(tasks);
        }
    };

    if (isLoading) {
        return <div className="text-muted-foreground p-4">Loading tasks...</div>;
    }

    return (
        <div className="w-full">
            <QuickAddTask
                selectedListId={selectedListId}
                onTaskCreated={onCountsChange || (() => {})}
            />
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <ul role="list" aria-label="Tasks" className="w-full">
                        {tasks.map(task => (
                            <li key={task.id} className="w-full">
                                <SortableTask
                                    id={task.id}
                                    title={task.title}
                                    description={task.description}
                                    dueDate={task.dueDate}
                                    tags={task.tags?.map(tag => ({ label: tag, theme: 'emerald' as const }))}
                                    completed={task.status === 'completed'}
                                    selected={selectedTaskId === task.id}
                                    onclick={handleTaskClick}
                                    onToggleComplete={handleToggleComplete}
                                />
                            </li>
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    )
}