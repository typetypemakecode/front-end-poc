// src/types/notes.ts

/**
 * A section within a project/area for structured notes (goals, resources, etc.)
 */
export interface NoteSection {
  id: string;
  title: string;
  content: string; // Markdown for now, Block[] later
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * A timestamped journal entry for running logs
 */
export interface JournalEntry {
  id: string;
  content: string; // Markdown for now
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new section
 */
export interface CreateSectionInput {
  title: string;
  content?: string;
}

/**
 * Input for updating a section
 */
export interface UpdateSectionInput {
  title?: string;
  content?: string;
  order?: number;
}

/**
 * Input for creating a journal entry
 */
export interface CreateJournalEntryInput {
  content: string;
}

/**
 * Input for updating a journal entry
 */
export interface UpdateJournalEntryInput {
  content: string;
}
