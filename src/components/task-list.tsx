import { useState, useEffect } from 'react'
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableTask from './sortable-task'
import { QuickAddTask } from './quick-add-task'
import { dataService } from '../services/dataService'
import type { TaskData, UpdateTaskInput } from '../types/task'
import type { SidebarItemData } from '../types/sidebar'
import { filterTasksByList } from '../utils/taskFilters'
import { EditTaskModal } from './edit-task-modal'

interface TaskListProps {
    filterKey: number;
    selectedListId: string | null;
    refreshKey?: number;
    onCountsChange?: () => void | Promise<void>;
}

export default function TaskList({ filterKey, selectedListId, refreshKey, onCountsChange }: TaskListProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);
    const [areas, setAreas] = useState<SidebarItemData[]>([]);
    const [projects, setProjects] = useState<SidebarItemData[]>([]);

    // Configure sensors for drag interaction
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Load sidebar config for areas/projects dropdown
    useEffect(() => {
        const config = dataService.getLocalSidebarConfig();
        setAreas(config.areas || []);
        setProjects(config.projects || []);
    }, []);

    // Load tasks from service when filterKey, selectedListId, or refreshKey changes
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
    }, [filterKey, selectedListId, refreshKey]);

    const handleTaskClick = (id: string) => {
        setSelectedTaskId(id);
        // Open edit modal when task is clicked
        const task = tasks.find(t => t.id === id);
        if (task) {
            setEditingTask(task);
        }
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

    const handleSave = async (updates: UpdateTaskInput) => {
        if (!editingTask) return;

        await dataService.updateTask(editingTask.id, updates);
        setEditingTask(null);

        // Refresh counts and task list
        if (onCountsChange) {
            await onCountsChange();
        }
    };

    const handleArchive = async (taskId: string) => {
        await dataService.updateTask(taskId, { status: 'archived' });
        setEditingTask(null);

        // Refresh counts and task list
        if (onCountsChange) {
            await onCountsChange();
        }
    };

    if (isLoading) {
        return <div className="text-muted-foreground p-4">Loading tasks...</div>;
    }

    return (
        <>
            {/* Sticky QuickAddTask at top */}
            <div className="sticky top-0 z-10 pointer-events-none">
                {/* QuickAddTask container */}
                <div className='bg-background/50 backdrop-blur-sm px-4 pt-4 pb-0 pointer-events-auto'>
                    <QuickAddTask
                        selectedListId={selectedListId}
                        onTaskCreated={onCountsChange || (() => {})}
                    />
                </div>
                {/* Gradient fade to soften the edge */}
                <div className='h-4 bg-gradient-to-b from-background/50 to-transparent'></div>
            </div>

            {/* Task list */}
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

            {/* Edit Task Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    isOpen={true}
                    onClose={() => setEditingTask(null)}
                    onSave={handleSave}
                    onArchive={handleArchive}
                    areas={areas}
                    projects={projects}
                />
            )}
        </>
    )
}