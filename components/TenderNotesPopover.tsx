'use client';
import React, { useState } from 'react';
import { StickyNote, X, Save } from 'lucide-react';

interface TenderNotesPopoverProps {
  tenderId: string;
  initialNotes: string;
  onSave: (tenderId: string, notes: string) => void;
}

export function TenderNotesPopover({ tenderId, initialNotes, onSave }: TenderNotesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1 rounded hover:bg-gray-700 transition-colors"
        title="Add notes"
      >
        <StickyNote className={`w-3.5 h-3.5 ${initialNotes ? 'text-amber-400' : 'text-gray-500'}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-6 z-50 w-64 bg-gray-900 
                        border border-gray-700 rounded-xl shadow-2xl p-3"
             onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-300">Tender Notes</span>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
            </button>
          </div>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-lg 
                       p-2 text-xs text-white resize-none focus:outline-none 
                       focus:border-emerald-500"
            rows={4}
            placeholder="Add your notes here — client instructions, requirements, team assignments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onSave(tenderId, notes); setIsOpen(false); }}
            className="mt-2 w-full bg-emerald-700 hover:bg-emerald-600 
                       text-white text-xs font-semibold py-1.5 rounded-lg 
                       flex items-center justify-center gap-1 transition-colors"
          >
            <Save className="w-3 h-3" /> Save Notes
          </button>
        </div>
      )}
    </div>
  );
}
