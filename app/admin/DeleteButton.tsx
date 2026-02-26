"use client";

import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { deleteBhajanAction } from './actions'; // <-- Import the secure server action

export default function DeleteButton({ slug, title }: { slug: string, title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Ask for confirmation
    const isConfirmed = window.confirm(`⚠️ Are you sure you want to delete "${title}"?\n\nThis cannot be undone!`);
    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      // 2. Call the secure server action
      await deleteBhajanAction(slug);
    } catch (error: any) {
      alert(`Error deleting: ${error.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
        isDeleting 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
      }`}
      title="Delete Bhajan"
    >
      <FaTrash className={isDeleting ? 'animate-pulse' : ''} />
    </button>
  );
}