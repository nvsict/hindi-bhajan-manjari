"use client";

import { useState } from 'react';
import { FaLink, FaCheck } from 'react-icons/fa';

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Generate the full URL dynamically based on the current domain
    const fullUrl = `${window.location.origin}/bhajan/${slug}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 active:scale-95 ${
        copied 
          ? 'bg-green-500 text-white shadow-[0_4px_15px_rgba(34,197,94,0.4)]' 
          : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white hover:shadow-[0_4px_15px_rgba(147,51,234,0.3)]'
      }`}
      title={copied ? "Link Copied!" : "Copy Bhajan Link"}
    >
      {copied ? <FaCheck size={16} /> : <FaLink size={16} />}
    </button>
  );
}