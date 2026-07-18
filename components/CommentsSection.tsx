"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { FaUserCircle, FaPaperPlane } from 'react-icons/fa';

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function CommentsSection({ bhajanSlug }: { bhajanSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when the component loads
  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('bhajan_slug', bhajanSlug)
        .order('created_at', { ascending: false }); // Newest comments first
      
      if (data) setComments(data);
    };

    fetchComments();
  }, [bhajanSlug]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('comments')
      .insert([
        { 
          bhajan_slug: bhajanSlug, 
          user_name: newName.trim(), 
          content: newComment.trim() 
        }
      ])
      .select()
      .single();

    if (!error && data) {
      // Add the new comment to the top of the list instantly (Optimistic UI)
      setComments([data, ...comments]);
      setNewName('');
      setNewComment('');
    }

    setIsSubmitting(false);
  };

  // Format the date to look nice (e.g., "Oct 12, 2025")
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="mt-12 pt-8 border-t border-orange-100">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
        Community Comments ({comments.length})
      </h3>

      {/* 🌟 The Comment Form */}
      <form onSubmit={handleSubmit} className="bg-orange-50/50 p-5 md:p-6 rounded-2xl border border-orange-100 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Mohit Tarkar"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Message</label>
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or feelings..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
            <FaPaperPlane size={14} />
          </button>
        </div>
      </form>

      {/* 🌟 The Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
            Be the first to share your devotion here.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="shrink-0 text-gray-300 mt-1">
                <FaUserCircle size={36} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{comment.user_name}</h4>
                  <span className="text-xs text-gray-500 font-medium">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}