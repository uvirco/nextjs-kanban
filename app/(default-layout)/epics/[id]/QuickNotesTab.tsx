"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

interface QuickNotesTabProps {
  epic: any;
  onSave: (data: any) => void;
}

interface QuickNote {
  id: string;
  title: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  type: string;
}

export default function QuickNotesTab({ epic, onSave }: QuickNotesTabProps) {
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing quick notes
  useEffect(() => {
    const loadQuickNotes = async () => {
      try {
        const response = await fetch(`/api/epics/${epic.id}/meeting-notes`);
        if (response.ok) {
          const notes = await response.json();
          const quickNotesOnly = notes.filter((note: any) => note.type === 'quick');
          setQuickNotes(quickNotesOnly);
        }
      } catch (error) {
        console.error("Failed to load quick notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuickNotes();
  }, [epic.id]);

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: QuickNote) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleSave = async (noteData: any) => {
    try {
      let response;
      if (editingNote) {
        // Update existing note
        response = await fetch(`/api/epics/${epic.id}/meeting-notes/${editingNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteData.title,
            notes: noteData.notes,
            type: "quick",
          }),
        });
      } else {
        // Create new note
        response = await fetch(`/api/epics/${epic.id}/meeting-notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteData.title,
            meeting_type: "other",
            meeting_date: new Date().toISOString(),
            notes: noteData.notes,
            type: "quick",
          }),
        });
      }

      if (response.ok) {
        const savedNote = await response.json();

        if (editingNote) {
          // Update the note in the list
          setQuickNotes(prev => prev.map(note =>
            note.id === editingNote.id ? savedNote : note
          ));
        } else {
          // Add new note to the list
          setQuickNotes(prev => [savedNote, ...prev]);
        }

        setIsCreating(false);
        setEditingNote(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to save quick note: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(`Error saving quick note: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this quick note?")) {
      return;
    }

    try {
      const response = await fetch(`/api/epics/${epic.id}/meeting-notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setQuickNotes(prev => prev.filter(note => note.id !== noteId));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete quick note: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Error deleting quick note: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold text-white">Quick Notes</h3>
        <div className="text-zinc-400">Loading quick notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Quick Notes</h3>
        {!isCreating && !editingNote && (
          <Button
            onClick={handleCreateNote}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <IconPlus size={16} className="mr-2" />
            Add Quick Note
          </Button>
        )}
      </div>

      {(isCreating || editingNote) && (
        <QuickNoteEditor
          note={editingNote}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {!isCreating && !editingNote && (
        <div className="space-y-4">
          {quickNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4">No quick notes yet</p>
              <Button
                onClick={handleCreateNote}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <IconPlus size={16} className="mr-2" />
                Create Your First Quick Note
              </Button>
            </div>
          ) : (
            quickNotes.map((note) => (
              <div key={note.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{note.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Created {new Date(note.created_at).toLocaleDateString()}
                      {note.updated_at !== note.created_at && (
                        <span> • Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditNote(note)}
                      size="sm"
                      variant="outline"
                      className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                    >
                      <IconEdit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(note.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-600 hover:bg-red-900"
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-zinc-300">
                  {note.notes ? (
                    <div dangerouslySetInnerHTML={{ __html: note.notes }} />
                  ) : (
                    <span className="text-zinc-500">No content</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for editing/creating notes
function QuickNoteEditor({ note, onSave, onCancel }: {
  note: QuickNote | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note?.title || "Quick Note");
  const [content, setContent] = useState(note?.notes || "");

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    onSave({ title: title.trim(), notes: content });
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter note title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Content
          </label>
          <RichTextEditor
            value={note?.notes || ""}
            onChange={setContent}
            placeholder="Add your quick notes, reminders, or action items..."
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Note
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// Rich text editor component with proper Quill initialization
function RichTextEditor({ value, onChange, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current || !editorRef.current) {
      return;
    }

    const initQuill = async () => {
      try {
        // Dynamically import Quill
        const QuillModule = await import('quill');
        const Quill = QuillModule.default || QuillModule;

        // Check again after async import
        if (isInitializedRef.current || !editorRef.current) {
          return;
        }

        // Clear any existing content to prevent double toolbar
        editorRef.current.innerHTML = '';

        // Initialize Quill
        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder || 'Add your quick notes, reminders, or action items...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          }
        });

        // Set initial content
        if (value) {
          quill.root.innerHTML = value;
        }

        // Listen for changes
        quill.on('text-change', () => {
          const html = quill.root.innerHTML;
          onChange(html);
        });

        quillInstanceRef.current = quill;
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to load Quill:', error);
      }
    };

    initQuill();

    return () => {
      // Clean up on unmount
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change');
        quillInstanceRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Only run once on mount

  // Update content when value prop changes
  useEffect(() => {
    if (quillInstanceRef.current && isInitializedRef.current && value !== undefined) {
      const currentHtml = quillInstanceRef.current.root.innerHTML;
      if (currentHtml !== value) {
        quillInstanceRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <>
      <style jsx global>{`
        .ql-container {
          background-color: #18181b !important;
          border-color: #3f3f46 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          color: #ffffff !important;
          min-height: 150px;
        }

        .ql-editor {
          color: #ffffff !important;
          min-height: 150px;
        }

        .ql-editor.ql-blank::before {
          color: #71717a !important;
          font-style: normal;
        }

        .ql-toolbar {
          background-color: #27272a !important;
          border-color: #3f3f46 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }

        .ql-stroke {
          stroke: #a1a1aa !important;
        }

        .ql-fill {
          fill: #a1a1aa !important;
        }

        .ql-picker-label {
          color: #a1a1aa !important;
        }

        .ql-picker-options {
          background-color: #27272a !important;
          border-color: #3f3f46 !important;
        }

        .ql-toolbar button:hover,
        .ql-toolbar button:focus,
        .ql-toolbar button.ql-active {
          color: #3b82f6 !important;
        }

        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button:focus .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }

        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button:focus .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
      `}</style>
      <div className="rounded-md overflow-hidden">
        <div ref={editorRef} className="min-h-[150px]" />
      </div>
    </>
  );
}