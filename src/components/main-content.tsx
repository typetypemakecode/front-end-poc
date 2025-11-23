import { useState, useEffect, useCallback } from 'react';
import {Funnel, ArrowUpNarrowWide} from 'lucide-react'
import TaskList from './task-list';
import { dataService } from '../services/dataService';
import type { TaskCounts, TaskData } from '../types/task';
import { filterTasksByList } from '../utils/taskFilters';

interface MainContentProps {
    refreshKey?: number;
    selectedListId?: string | null;
    onDataChange?: () => void;
}

export default function MainContent({ refreshKey, selectedListId = null, onDataChange }: MainContentProps) {
    const [selectedFilterKey, setSelectedFilterKey] = useState<number>(1);
    const [counts, setCounts] = useState<TaskCounts>({ all: 0, active: 0, completed: 0, archived: 0 });

    const loadCounts = useCallback(async () => {
        try {
            // If a smart list or area/project is selected, calculate counts from filtered tasks
            if (selectedListId) {
                // Fetch all tasks and filter them based on selected list
                const allTasks = await dataService.getTasks();
                const filteredTasks = filterTasksByList(allTasks, selectedListId);

                // Calculate counts from filtered tasks
                const taskCounts: TaskCounts = {
                    all: filteredTasks.length,
                    active: filteredTasks.filter((t: TaskData) => t.status === 'active').length,
                    completed: filteredTasks.filter((t: TaskData) => t.status === 'completed').length,
                    archived: filteredTasks.filter((t: TaskData) => t.status === 'archived').length,
                };
                setCounts(taskCounts);
            } else {
                // No filter selected, get global counts
                const fetchedCounts = await dataService.getTaskCounts();
                setCounts(fetchedCounts);
            }
        } catch (error) {
            console.error('Failed to load task counts:', error);
        }
    }, [selectedListId]);

    // Load counts on mount and when refreshKey or selectedListId changes
    useEffect(() => {
        loadCounts();
    }, [refreshKey, loadCounts]);

    const handleCountsChange = async () => {
        await loadCounts();
        // Notify parent to refresh sidebar
        if (onDataChange) {
            onDataChange();
        }
    };

    const handleFilterChange = (key: number) => {
        setSelectedFilterKey(key);
    };

  return (
    <div className='h-full px-4 py-4 flex flex-col overflow-hidden'>
        <div className="flex flex-row text-muted-foreground text-xl" role="toolbar" aria-label="Task filters and actions">
            <div className="flex items-center gap-3" role="group" aria-label="Status filters">
                <button
                    key={1}
                    type="button"
                    className={`px-3 py-1 text-sm ${selectedFilterKey === 1 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                    onClick={() => handleFilterChange(1)}
                    aria-pressed={selectedFilterKey === 1}
                    aria-label={`Show all tasks (${counts.all})`}
                >
                    All ({counts.all})
                </button>
                <button
                    key={2}
                    type="button"
                    className={`px-3 py-1 text-sm ${selectedFilterKey === 2 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                    onClick={() => handleFilterChange(2)}
                    aria-pressed={selectedFilterKey === 2}
                    aria-label={`Show active tasks (${counts.active})`}
                >
                    Active ({counts.active})
                </button>
                <button
                    key={3}
                    type="button"
                    className={`px-3 py-1 text-sm ${selectedFilterKey === 3 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                    onClick={() => handleFilterChange(3)}
                    aria-pressed={selectedFilterKey === 3}
                    aria-label={`Show completed tasks (${counts.completed})`}
                >
                    Completed ({counts.completed})
                </button>
            </div>
            <div className="justify-end flex flex-1 gap-4" role="group" aria-label="Task actions">
                <button
                    type="button"
                    className='p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-accent'
                    aria-label="Filter tasks"
                >
                    <Funnel className="w-6 h-6" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className='p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-accent'
                    aria-label="Sort tasks"
                >
                    <ArrowUpNarrowWide className="w-6 h-6" aria-hidden="true" />
                </button>
            </div>
        </div>
        <div className='flex-1 overflow-y-auto px-4 space-y-2 min-h-0' role="region" aria-label="Task list">
            <TaskList filterKey={selectedFilterKey} selectedListId={selectedListId || null} refreshKey={refreshKey} onCountsChange={handleCountsChange} />
        </div>
    </div>
  )
}
