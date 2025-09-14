// Client-side utilities for notes operations

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tenantId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

// Get all notes with optional search
export async function getNotes(search?: string): Promise<Note[]> {
  const url = new URL('/api/notes', window.location.origin);
  if (search) {
    url.searchParams.set('search', search);
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const data = await response.json();
  return data.notes;
}

// Get a specific note by ID
export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }

  const data = await response.json();
  return data.note;
}

// Create a new note
export async function createNote(noteData: CreateNoteData): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create note');
  }

  const data = await response.json();
  return data.note;
}

// Update an existing note
export async function updateNote(id: string, noteData: UpdateNoteData): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update note');
  }

  const data = await response.json();
  return data.note;
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete note');
  }
}
