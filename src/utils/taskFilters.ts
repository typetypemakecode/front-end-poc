import type { TaskData } from '../types/task';

/**
 * Helper function to parse date strings consistently (as local dates, not UTC)
 */
const parseDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Filter tasks based on smart list or regular list
 * @param tasks - Array of tasks to filter
 * @param listId - ID of the list/smart list (null = all tasks)
 * @returns Filtered array of tasks
 */
export const filterTasksByList = (tasks: TaskData[], listId: string | null): TaskData[] => {
    // If no list selected, return all tasks
    if (!listId) return tasks;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    switch (listId) {
        case 'inbox':
            // Uncategorized tasks (no dueDate, no listId)
            return tasks.filter(task => !task.dueDate && !task.listId);

        case 'today':
            // Tasks due today
            return tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = parseDate(task.dueDate);
                return dueDate.getFullYear() === today.getFullYear() &&
                       dueDate.getMonth() === today.getMonth() &&
                       dueDate.getDate() === today.getDate();
            });

        case 'upcoming':
            // Tasks due in next 7 days (excluding today)
            return tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = parseDate(task.dueDate);
                return dueDate > today && dueDate <= sevenDaysFromNow;
            });

        case 'past_due':
            // Overdue tasks
            return tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = parseDate(task.dueDate);
                return dueDate < today;
            });

        case 'tags':
            // Tasks with tags
            return tasks.filter(task => task.tags && task.tags.length > 0);

        default:
            // For areas/projects, filter by listId
            return tasks.filter(task => task.listId === listId);
    }
};
