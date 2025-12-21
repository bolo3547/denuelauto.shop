"use client";
import React from 'react';
import Link from 'next/link';

type Item = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Item[] }){
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((it, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className={`flex items-center ${last ? 'text-gray-800 font-semibold' : ''}`} aria-current={last ? 'page' : undefined}>
              {!last && it.href ? (
                <Link href={it.href} className="hover:underline">{it.label}</Link>
              ) : (
                <span>{it.label}</span>
              )}
              {!last && <span className="mx-2">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
