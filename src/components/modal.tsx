/**
 * Modal Component using Headless UI
 *
 * This file contains ALL Headless UI dependencies.
 * To remove Headless UI from the project:
 * 1. Delete this file
 * 2. Run: npm uninstall @headlessui/react
 * 3. Replace usage in sidebar.tsx with your preferred modal solution
 */

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Reusable Modal component with Tailwind styling
 * Fully accessible with keyboard navigation and focus management
 */
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-card border border-border rounded-lg shadow-glow-emerald p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-medium text-card-foreground">
              {title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-card-foreground">
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}