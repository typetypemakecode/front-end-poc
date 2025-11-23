import { Plus } from 'lucide-react'
import List from './sidebar-list'
import { useState, useEffect, useRef } from 'react'
import { dataService } from '../services/dataService'
import { getIcon } from '../utils/iconMapper'
import type { SidebarItemData, SidebarConfigData } from '../types/sidebar'
import Modal from './modal'
import NewListForm from './new-list-form'
import { showError, showSuccess } from '../lib/toastUtils'

interface SidebarProps {
    refreshKey?: number;
    onListSelect?: (listId: string) => void;
}

export default function Sidebar({ refreshKey, onListSelect }: SidebarProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
    const [sidebarData, setSidebarData] = useState<SidebarConfigData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const newListButtonRef = useRef<HTMLButtonElement>(null);

    const handleItemClick = (key: string) => {
        // Toggle: if clicking same item, deselect
        const newSelectedId = selectedId === key ? null : key;
        setSelectedId(newSelectedId);

        if (onListSelect) {
            onListSelect(key);
        }
    };

    const handleNewListClick = () => {
        setIsNewListModalOpen(true);
    }

    const handleFormSubmit = async (type: 'area' | 'project', title: string, description: string, dueDate?: string) => {
        try {
            if (type === 'area') {
                await dataService.addArea(title, undefined, undefined, description);
                showSuccess(`Area "${title}" created successfully`);
            } else {
                await dataService.addProject(title, undefined, undefined, description, dueDate);
                showSuccess(`Project "${title}" created successfully`);
            }

            // Reload sidebar data to reflect the new item
            const updatedData = await dataService.getSidebarConfig();
            setSidebarData(updatedData);

            // Close modal on success
            setIsNewListModalOpen(false);

            // Return focus to "New List" button after modal closes
            setTimeout(() => {
                newListButtonRef.current?.focus();
            }, 100);
        } catch (error) {
            console.error('Failed to add new list:', error);
            showError(error, 'Failed to create list. Please try again.');
        }
    }

    const handleModalClose = () => {
        setIsNewListModalOpen(false);
        // Return focus to "New List" button after modal closes
        setTimeout(() => {
            newListButtonRef.current?.focus();
        }, 100);
    }

    // Load sidebar data on component mount and when refreshKey changes
    useEffect(() => {
        const loadSidebarData = async () => {
            try {
                setIsLoading(true);
                const data = await dataService.getSidebarConfig();
                setSidebarData(data);
            } catch (error) {
                showError(error, 'Failed to load sidebar data');
                console.error('Failed to load sidebar data:', error);
                // Fallback to local data on error
                setSidebarData(dataService.getLocalSidebarConfig());
            } finally {
                setIsLoading(false);
            }
        };

        loadSidebarData();
    }, [refreshKey]);

    // Helper function to map API data to component props with icons and selection state
    const mapToListItems = (items: SidebarItemData[]) => {
        return items.map(item => ({
            ...item,
            icon: getIcon(item.iconName),
            selected: selectedId === item.key
        }));
    };

    // Show loading state
    if (isLoading || !sidebarData) {
        return (
            <aside className='flex flex-col w-64 bg-background border-r border-border h-full'>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-muted-foreground'>Loading...</div>
                </div>
            </aside>
        );
    }

    return (
        <aside className='flex flex-col w-64 bg-background border-r border-border h-full relative'>
            {/* Scrollable Content Area */}
            <div className='flex-1 overflow-y-auto'>
                <div className='p-4'>
                    {/* Smart Lists */}
                    <List title="Smart Lists" onItemClick={handleItemClick} items={mapToListItems(sidebarData.smartLists)} />
                    {/* Areas */}
                    <List title="Areas" onItemClick={handleItemClick} items={mapToListItems(sidebarData.areas)} />
                    {/* Projects */}
                    <List title="Projects" onItemClick={handleItemClick} items={mapToListItems(sidebarData.projects)} />
                    <div className='h-10'>&nbsp;</div>
                </div>
            </div>
            {/* Fixed button at bottom */}
            <div className='absolute bottom-0 left-0 right-0 pointer-events-none'>
                {/* Gradient fade to soften the edge */}
                <div className='h-12 backdrop:blur-sm bg-gradient-to-t from-background/50 to-transparent'></div>
                {/* Button container */}
                <div className='bg-background/50 backdrop-blur-sm p-4 pointer-events-auto'>
                    <button
                        ref={newListButtonRef}
                        onClick={handleNewListClick}
                        className='w-full flex items-center justify-center gap-2 px-4 py-2
                                   bg-accent text-background rounded-md hover:bg-accent/90
                                   transition-colors duration-200 font-medium'
                        aria-label="Create new list"
                    >
                        <Plus className='w-4 h-4' aria-hidden="true" />
                        <span>New List</span>
                    </button>
                </div>
            </div>

            {/* Modal for creating new list */}
            <Modal
                isOpen={isNewListModalOpen}
                onClose={handleModalClose}
                title="Create New List"
            >
                <NewListForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleModalClose}
                />
            </Modal>
        </aside>
    )
}