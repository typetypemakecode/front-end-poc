/**
 * NewListForm Component
 *
 * This component is modal-agnostic and can work with any modal library.
 * It handles the form logic for creating new Areas or Projects.
 */

import { Circle, Folder } from 'lucide-react';
import { useState } from 'react';

interface NewListFormProps {
  onSubmit: (type: 'area' | 'project', title: string) => void;
  onCancel: () => void;
}

export default function NewListForm({ onSubmit, onCancel }: NewListFormProps) {
  const [selectedType, setSelectedType] = useState<'area' | 'project' | null>(null);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && title.trim()) {
      onSubmit(selectedType, title.trim());
      // Reset form
      setSelectedType(null);
      setTitle('');
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
          placeholder={`Enter ${selectedType} name...`}
          autoFocus
          className="w-full px-3 py-2 bg-background border border-border rounded-md
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     placeholder:text-muted-foreground"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => {
            setSelectedType(null);
            setTitle('');
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