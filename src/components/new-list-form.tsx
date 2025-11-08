/**
 * NewListForm Component
 *
 * This component is modal-agnostic and can work with any modal library.
 * It handles the form logic for creating new Areas or Projects.
 */

import { Circle, Folder, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface NewListFormProps {
  onSubmit: (type: 'area' | 'project', title: string, description: string, dueDate?: string) => void;
  onCancel: () => void;
}

export default function NewListForm({ onSubmit, onCancel }: NewListFormProps) {
  const [selectedType, setSelectedType] = useState<'area' | 'project' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && title.trim()) {
      // Format date to ISO string (YYYY-MM-DD) if selected
      const formattedDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined;
      onSubmit(selectedType, title.trim(), description.trim(), formattedDate);
      // Reset form
      setSelectedType(null);
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setShowCalendar(false);
    }
  };

  // If no type selected, show type selection
  if (!selectedType) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          Choose what type of list to create:
        </p>

        {/* Area Option */}
        <button
          onClick={() => setSelectedType('area')}
          className="w-full flex items-center gap-3 p-4 rounded-md border border-border hover:bg-accent/10 transition-colors text-left"
        >
          <Circle className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="font-medium">New Area</div>
            <div className="text-sm text-muted-foreground">
              A collection of tasks with no due date
            </div>
          </div>
        </button>

        {/* Project Option */}
        <button
          onClick={() => setSelectedType('project')}
          className="w-full flex items-center gap-3 p-4 rounded-md border border-border hover:bg-accent/10 transition-colors text-left"
        >
          <Folder className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="font-medium">New Project</div>
            <div className="text-sm text-muted-foreground">
              A collection of tasks with a due date
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Show title input form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="list-title" className="block text-sm font-medium mb-2">
          {selectedType === 'area' ? 'Area' : 'Project'} Name
        </label>
        <input
          id="list-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setShowCalendar(false)}
          placeholder={`Enter ${selectedType} name...`}
          autoFocus
          className="w-full px-3 py-2 bg-background border border-border rounded-md
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <label htmlFor="list-description" className="block text-sm font-medium mb-2">
          {selectedType === 'area' ? 'Area' : 'Project'} Description (optional)
        </label>
        <textarea
          id="list-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => setShowCalendar(false)}
          placeholder={`Enter ${selectedType} description...`}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-md
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     placeholder:text-muted-foreground resize-none"
        />
      </div>
      {selectedType === 'project' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Due Date (optional)
          </label>
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            onFocus={() => setShowCalendar(true)}
            tabIndex={0}
            role="button"
            aria-label="Select due date"
            className="w-full flex items-center gap-2 p-3 border border-border rounded-md bg-background hover:bg-accent/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="text-sm flex-1">
              {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
            </span>
            {dueDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDueDate(undefined);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {showCalendar && (
            <div className="mt-2 h-[350px] overflow-hidden flex justify-center">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setShowCalendar(false);
                }}
                className="rounded-md border border-border"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => {
            setSelectedType(null);
            setTitle('');
            setDescription('');
            setDueDate(undefined);
            setShowCalendar(false);
          }}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-border rounded-md
                     hover:bg-accent/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 text-sm bg-accent text-background rounded-md
                     hover:bg-accent/90 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </form>
  );
}