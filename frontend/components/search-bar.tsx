import React from 'react';

export default function SearchBar({ onSearch }: { onSearch?: (q:string) => void }){
  return (
    <div className="flex items-center gap-2">
      <input aria-label="Search" placeholder="Search make, model or stock (e.g., Harrier or D1234)" className="flex-1 p-3 rounded-2xl border" />
      <button className="px-4 py-2 rounded-2xl bg-primary text-white">Search</button>
    </div>
  );
}
