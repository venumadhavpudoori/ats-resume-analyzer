import React from 'react';

interface KeywordTagProps {
  text: string;
  type: 'matched' | 'missing';
}

export default function KeywordTag({ text, type }: KeywordTagProps) {
  const styles = {
    matched: 'bg-green-100 text-green-700 border-green-200',
    missing: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[type]} transition-all hover:scale-105`}>
      {type === 'matched' ? '✓ ' : '✕ '} {text}
    </span>
  );
}
