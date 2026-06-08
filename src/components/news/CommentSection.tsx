'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from '@/lib/utils';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number | null;
  user: { name: string | null; avatar: string | null } | null;
  replies: Comment[];
}

export default function CommentSection({ newsId }: { newsId: number }) {
  const { data: session } = useSession();
  const t = useTranslations('comments');
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?newsId=${newsId}`);
    if (res.ok) {
      const data = await res.json();
      setCommentList(data);
    }
  }, [newsId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, content }),
    });
    setLoading(false);

    if (res.ok) {
      setContent('');
      fetchComments();
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || replyTo === null) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, content: replyContent, parentId: replyTo }),
    });
    setLoading(false);

    if (res.ok) {
      setReplyContent('');
      setReplyTo(null);
      fetchComments();
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
      <h3 className="text-xl font-bold text-white mb-6">{t('title')}</h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={session ? t('placeholder.write') : t('placeholder.login')}
          disabled={!session || loading}
          className="bg-[#0a0a0f] border-[#1e1e2e] text-white mb-3"
          rows={3}
        />
        <Button type="submit" disabled={!session || loading || !content.trim()}>
          {t('postComment')}
        </Button>
      </form>

      <div className="space-y-6">
        {commentList.map((comment) => (
          <div key={comment.id} className="bg-[#13131f] border border-[#1e1e2e] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#e31937] flex items-center justify-center text-white text-xs font-bold">
                {comment.user?.name?.[0] || 'A'}
              </div>
              <span className="text-sm font-medium text-white">{comment.user?.name || t('anonymous')}</span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-3">{comment.content}</p>
            {session && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs text-blue-400 hover:underline"
              >
                {replyTo === comment.id ? t('cancel') : t('reply')}
              </button>
            )}

            {replyTo === comment.id && (
              <form onSubmit={handleReply} className="mt-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={t('replyPlaceholder')}
                  className="bg-[#0a0a0f] border-[#1e1e2e] text-white mb-2"
                  rows={2}
                />
                <Button size="sm" disabled={loading || !replyContent.trim()}>
                  {t('reply')}
                </Button>
              </form>
            )}

            {comment.replies?.length > 0 && (
              <div className="mt-4 pl-4 border-l border-[#1e1e2e] space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                        {reply.user?.name?.[0] || 'A'}
                      </div>
                      <span className="text-sm font-medium text-white">{reply.user?.name || t('anonymous')}</span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(reply.createdAt))}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
