'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Grid, 
  List, 
  Crown, 
  User, 
  LogOut, 
  Edit, 
  Trash2,
  Calendar,
  Loader2,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Note, getNotes, deleteNote, createNote, updateNote } from '../../../lib/notes';
// import NoteModal from '../../components/NoteModal'; // Removed - using inline modal

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    subscriptionPlan: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data and notes on component mount
  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        // Fetch current user
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          window.location.href = '/login';
          return;
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch notes
        const notesData = await getNotes();
        setNotes(notesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, []);

  // Search notes (client-side filtering for now)
  const filteredNotes = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = () => {
    if (user?.tenant.subscriptionPlan === 'free' && notes.length >= 3) {
      toast.error('Free plan limit reached! Upgrade to Pro for unlimited notes.');
      return;
    }
    setShowCreateModal(true);
  };

  const handleUpgrade = async () => {
    if (user?.role !== 'admin') {
      toast.error('Only admins can upgrade the subscription.');
      return;
    }

    try {
      const response = await fetch(`/api/tenants/acme/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upgrade failed');
      }

      const result = await response.json();
      toast.success('Successfully upgraded to Pro plan!');
      
      // Refresh user data to update subscription status
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade subscription');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      await deleteNote(noteId);
      // Refresh notes from server to ensure consistency
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleSaveNote = (savedNote: Note) => {
    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note => note.id === savedNote.id ? savedNote : note));
    } else {
      // Add new note
      setNotes([savedNote, ...notes]);
    }
    setShowCreateModal(false);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowCreateModal(false);
  };

  const handleInviteUser = async (inviteData: { email: string; name: string; role: string }) => {
    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite user');
      }

      const result = await response.json();
      toast.success(`User ${inviteData.email} invited successfully! Default password: password`);
      setShowInviteModal(false);
      
    } catch (error) {
      console.error('Invite user error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to invite user');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">NotesApp</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm text-gray-600">{user.tenant.name}</span>
              <div className={`w-2 h-2 rounded-full ${
                user.tenant.subscriptionPlan === 'pro' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Actions */}
            {user.role === 'admin' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </button>
            )}

            {/* Subscription Status */}
            <div className="hidden md:flex items-center gap-2">
              {user.tenant.subscriptionPlan === 'free' && user.role === 'admin' && (
                <button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </button>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.tenant.subscriptionPlan === 'pro' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.tenant.subscriptionPlan === 'pro' ? 'Pro' : 'Free'} Plan
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Admin' : 'Member'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            My Notes
          </motion.h1>
          <p className="text-gray-600">
            {user.tenant.subscriptionPlan === 'free' 
              ? `${notes.length}/3 notes used • Upgrade to Pro Max for unlimited notes`
              : 'Unlimited notes available'
            }
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create Note Button */}
          <button
            onClick={handleCreateNote}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {/* Notes Grid/List */}
        {filteredNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateNote}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Note
              </button>
            )}
          </motion.div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'p-6' : 'p-6'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  {note.updatedAt !== note.createdAt && (
                    <span>• Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* User Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border-4 border-green-500">
            <div className="flex items-center justify-between p-6 border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
              <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite New User
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-red-500 hover:text-red-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const email = formData.get('email') as string;
              const name = formData.get('name') as string;
              const role = formData.get('role') as string;
              
              if (!email || !name || !role) {
                toast.error('Please fill in all fields');
                return;
              }

              handleInviteUser({ email, name, role });
            }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The invited user will receive the default password: <code className="bg-blue-200 px-1 rounded">password</code>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WORKING MODAL - FORCE CACHE REFRESH */}
      {(showCreateModal || editingNote) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border-4 border-blue-500 flex flex-col">
            {/* NEW HEADER */}
            <div className="flex items-center justify-between p-8 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-blue-900">
                ✨ NEW MODAL ✨ {editingNote ? 'EDIT YOUR NOTE' : 'CREATE NEW NOTE'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNote(null);
                }}
                className="text-red-500 hover:text-red-700 text-3xl font-bold"
              >
                ❌
              </button>
            </div>

            {/* FORM CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const title = formData.get('title') as string;
                const content = formData.get('content') as string;
                
                if (!title || !content) {
                  toast.error('Please fill in all fields');
                  return;
                }

                // Handle save
                if (editingNote) {
                  // Update note
                  updateNote(editingNote.id, { title, content }).then((updatedNote) => {
                    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
                    setShowCreateModal(false);
                    setEditingNote(null);
                    toast.success('Note updated successfully');
                  }).catch((error) => {
                    toast.error('Failed to update note');
                  });
                } else {
                  // Create note
                  createNote({ title, content }).then((newNote) => {
                    setNotes([newNote, ...notes]);
                    setShowCreateModal(false);
                    setEditingNote(null);
                    toast.success('Note created successfully');
                  }).catch((error) => {
                    toast.error('Failed to create note');
                  });
                }
              }}>
                {/* TITLE INPUT */}
                <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                  <label htmlFor="title" className="block text-lg font-bold text-blue-800 mb-3">
                    📝 NOTE TITLE
                  </label>
                  <input
                    name="title"
                    type="text"
                    id="title"
                    defaultValue={editingNote?.title || ''}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Enter your note title..."
                    required
                  />
                </div>

                {/* CONTENT TEXTAREA */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <label htmlFor="content" className="block text-lg font-bold text-green-800 mb-3">
                    📄 NOTE CONTENT
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    rows={10}
                    defaultValue={editingNote?.content || ''}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-base"
                    placeholder="Write your note content here..."
                    required
                  />
                </div>

                {/* ACTIONS - FIXED AT BOTTOM */}
                <div className="sticky bottom-0 bg-white p-6 border-t-2 border-gray-200 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingNote(null);
                    }}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium flex items-center gap-2"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
