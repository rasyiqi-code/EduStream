/**
 * @file notes-panel.tsx
 * @description Notes panel for watch page sidebar
 */

'use client';

import React, { useState } from 'react';
import { useNotes } from '@/hooks/use-notes';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Star, 
  Clock, 
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface NotesPanelProps {
  videoId: string;
  courseId?: string;
  currentTime?: number; // Current video position
}

export function NotesPanel({ videoId, courseId, currentTime }: NotesPanelProps) {
  const { notes, isLoading, createNote, updateNote, deleteNote, toggleHighlight } = useNotes({ videoId });
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Note content cannot be empty',
      });
      return;
    }

    try {
      await createNote({
        videoId,
        courseId,
        content: newNoteContent,
        timestamp: currentTime,
      });

      toast({
        title: 'Note Created',
        description: 'Your note has been saved.',
      });

      setNewNoteContent('');
      setIsAdding(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create note.',
      });
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    try {
      await updateNote(noteId, { content: editNoteContent });
      toast({
        title: 'Note Updated',
        description: 'Your changes have been saved.',
      });
      setEditingId(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update note.',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast({
        title: 'Note Deleted',
        description: 'Note has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete note.',
      });
    }
  };

  const formatTimestamp = (seconds?: number) => {
    if (seconds === undefined) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Notes</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-xs">
          {notes.length} note{notes.length !== 1 && 's'} for this video
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {/* New Note Form */}
        {isAdding && (
          <div className="p-4 border-b space-y-3">
            <RichTextEditor
              content={newNoteContent}
              onChange={setNewNoteContent}
              placeholder="Write your note..."
              className="min-h-[120px]"
            />
            {currentTime !== undefined && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(currentTime)}
              </Badge>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateNote} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <ScrollArea className="h-[calc(100%-80px)]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <p>No notes yet</p>
              <p className="text-xs mt-1">Click + to add your first note</p>
            </div>
          ) : (
            <div className="divide-y">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'p-4 hover:bg-accent/50 transition-colors',
                    note.isHighlighted && 'bg-yellow-500/10 border-l-4 border-yellow-500'
                  )}
                >
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <RichTextEditor
                        content={editNoteContent}
                        onChange={setEditNoteContent}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNote(note.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          {note.timestamp !== undefined && (
                            <Badge variant="outline" className="text-xs mb-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(note.timestamp)}
                            </Badge>
                          )}
                          <div
                            className="prose prose-sm max-w-none text-sm"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(note.id);
                                setEditNoteContent(note.content);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleHighlight(note.id)}
                            >
                              <Star
                                className={cn(
                                  'h-4 w-4 mr-2',
                                  note.isHighlighted && 'fill-current text-yellow-500'
                                )}
                              />
                              {note.isHighlighted ? 'Unhighlight' : 'Highlight'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {note.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatRelativeTime(note.createdAt.toDate())}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

