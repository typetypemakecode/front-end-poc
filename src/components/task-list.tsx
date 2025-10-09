import { useState, useEffect } from 'react'
import Task from './task'
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

    if (isLoading) {
        return <div className="text-muted-foreground p-4">Loading tasks...</div>;
    }

    return (
    <div>
        {tasks.map(task => (
            <Task
                key={task.id}
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
        ))}
    </div>
    )
}