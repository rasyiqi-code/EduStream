/**
 * @file comments-section.tsx
 * @description Comments section with threading, voting, and moderation
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useComments } from '@/hooks/use-comments';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  Pin,
  Award,
  Edit2,
  Trash2,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Comment } from '@/lib/comment-types';

function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment & { id: string };
  onReply: (commentId: string) => void;
  onEdit: (comment: Comment & { id: string }) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, type: 'upvote' | 'downvote') => void;
  onPin?: (commentId: string, isPinned: boolean) => void;
  onMarkBest?: (commentId: string, isBestAnswer: boolean) => void;
  canModerate?: boolean;
  depth?: number;
}

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onVote,
  onPin,
  onMarkBest,
  canModerate = false,
  depth = 0,
}: CommentItemProps) {
  const { user } = useUser();
  const isOwner = user?.uid === comment.userId;

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-12 mt-4 border-l-2 pl-4")}>
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{comment.userName}</span>
          {comment.createdAt && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt.toDate())}
            </span>
          )}
          {comment.isEdited && (
            <Badge variant="outline" className="text-xs">
              Edited
            </Badge>
          )}
          {comment.isPinned && (
            <Badge variant="secondary" className="text-xs">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
          {comment.isBestAnswer && (
            <Badge className="text-xs bg-green-500">
              <Award className="h-3 w-3 mr-1" />
              Best Answer
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upvote */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onVote(comment.id, 'upvote')}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {comment.upvotes > 0 && comment.upvotes}
          </Button>

          {/* Downvote */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onVote(comment.id, 'downvote')}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {comment.downvotes > 0 && comment.downvotes}
          </Button>

          {/* Reply */}
          {depth === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </Button>
          )}

          {/* More options */}
          {(isOwner || canModerate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(comment)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {canModerate && (
                  <>
                    {isOwner && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => onPin?.(comment.id, !comment.isPinned)}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {comment.isPinned ? 'Unpin' : 'Pin Comment'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMarkBest?.(comment.id, !comment.isBestAnswer)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {comment.isBestAnswer ? 'Remove Best Answer' : 'Mark as Best'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentsSectionProps {
  videoId: string;
  canModerate?: boolean;
}

export function CommentsSection({ videoId, canModerate = false }: CommentsSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    voteComment,
    pinComment,
    markBestAnswer,
  } = useComments(videoId);

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<(Comment & { id: string }) | null>(null);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Organize comments into threads
  const { topLevelComments, replies } = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parentId);
    const repliesMap = new Map<string, (Comment & { id: string })[]>();

    comments.forEach((comment) => {
      if (comment.parentId) {
        const existing = repliesMap.get(comment.parentId) || [];
        repliesMap.set(comment.parentId, [...existing, comment]);
      }
    });

    // Sort: pinned first, then best answer, then by votes
    topLevel.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isBestAnswer !== b.isBestAnswer) return a.isBestAnswer ? -1 : 1;
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    });

    return { topLevelComments: topLevel, replies: repliesMap };
  }, [comments]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(newCommentText);
      setNewCommentText('');
      toast({
        title: 'Comment Posted',
        description: 'Your comment has been added.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post comment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    setIsSubmitting(true);
    try {
      await addComment(replyText, replyingTo);
      setReplyText('');
      setReplyingTo(null);
      toast({
        title: 'Reply Posted',
        description: 'Your reply has been added.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post reply.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editText.trim() || !editingComment) return;

    setIsSubmitting(true);
    try {
      await updateComment(editingComment.id, editText);
      setEditingComment(null);
      setEditText('');
      toast({
        title: 'Comment Updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update comment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: 'Comment Deleted',
        description: 'Comment has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete comment.',
      });
    }
  };

  const handleVote = async (commentId: string, type: 'upvote' | 'downvote') => {
    try {
      await voteComment(commentId, type);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to vote.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Diskusi ({comments.length})
        </CardTitle>
        <CardDescription>
          Tanya jawab dan diskusi tentang video ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Tulis komentar..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <CommentsSkeleton />
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada komentar</p>
            <p className="text-sm mt-1">Jadilah yang pertama berkomentar!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Edit Mode */}
                {editingComment?.id === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateComment} disabled={isSubmitting}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CommentItem
                      comment={comment}
                      onReply={setReplyingTo}
                      onEdit={(c) => {
                        setEditingComment(c);
                        setEditText(c.content);
                      }}
                      onDelete={handleDelete}
                      onVote={handleVote}
                      onPin={pinComment}
                      onMarkBest={markBestAnswer}
                      canModerate={canModerate}
                      depth={0}
                    />

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="ml-12 space-y-3">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user?.displayName || user?.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[60px]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={handleReply} disabled={isSubmitting}>
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {replies.get(comment.id)?.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onReply={() => {}}
                        onEdit={(c) => {
                          setEditingComment(c);
                          setEditText(c.content);
                        }}
                        onDelete={handleDelete}
                        onVote={handleVote}
                        canModerate={canModerate}
                        depth={1}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

