import React from 'react';

type Make = { name: string; count: number };
type BfType = { type: string; count: number };

interface Props {
  bfMakes: Make[];
  bfPriceRanges: string[];
  bfTypes: BfType[];
  filterMake: string | null;
  filterType: string | null;
  setFilterMake: (s: string | null) => void;
  setFilterType: (s: string | null) => void;
  setFilterMinPriceUsd: (n: number | null) => void;
  setFilterMaxPriceUsd: (n: number | null) => void;
  setPage: (n: number) => void;
  keyword: string;
  setKeyword: (s: string) => void;
  showPriceInJpy: boolean;
  setShowPriceInJpy: (b: boolean) => void;
}

const PublicLeftSidebar: React.FC<Props> = ({ bfMakes, bfPriceRanges, bfTypes, filterMake, filterType, setFilterMake, setFilterType, setFilterMinPriceUsd, setFilterMaxPriceUsd, setPage, keyword, setKeyword, showPriceInJpy, setShowPriceInJpy }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Filters</h4>
        <button onClick={() => {
          setFilterMake(null);
          setFilterType(null);
          setFilterMinPriceUsd(null);
          setFilterMaxPriceUsd(null);
          setKeyword('');
          setPage(1);
        }} className="text-xs text-blue-600 hover:underline">Clear</button>
      </div>
      <div className="bg-white p-4 rounded border">
        <label htmlFor="keyword-input" className="text-sm font-semibold block mb-2">By Keyword</label>
        <div className="mt-2 flex">
          <input id="keyword-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} type="text" placeholder="Search for Used Car" className="w-full px-3 py-2 border rounded-l" />
          <button onClick={() => setPage(1)} className="px-3 py-2 bg-blue-600 text-white rounded-r">Search</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <p className="text-sm font-semibold mb-3">Shop By Make</p>
        <ul className="text-sm space-y-2 max-h-60 overflow-auto">
          {bfMakes.length === 0 ? (
            <li className="text-sm text-gray-500">No makes available</li>
          ) : (
            bfMakes.map((m: Make) => {
              const name = m.name;
              const count = m.count;
              return (
                <li key={name || Math.random()} className="flex justify-between">
                  <button onClick={() => { setFilterMake(name); setPage(1); }} className={`text-left ${filterMake === name ? 'text-blue-600 font-semibold' : 'hover:text-blue-700'}`}>{name}</button>
                  <span className="text-gray-400">({Number(count).toLocaleString()})</span>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="bg-white p-4 rounded border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold mb-3">Shop By Price</div>
          <div className="flex items-center gap-2">
            <label htmlFor="show-jpy" className="text-xs text-gray-600">Show JPY</label>
            <input id="show-jpy" type="checkbox" checked={showPriceInJpy} onChange={(e) => setShowPriceInJpy(e.target.checked)} className="w-4 h-4" />
          </div>
        </div>
        <ul className="text-sm space-y-2">
          {bfPriceRanges.map((r) => (
            <li key={r}><button onClick={() => {
              let min: number | null = null;
              let max: number | null = null;
              if (r.startsWith('Under')) { max = Number(r.replace(/[$,A-Za-z\s]/g, '')) || 500; }
              else if (r.startsWith('Over')) { min = Number(r.replace(/[$,A-Za-z\s]/g, '')) || 4000; }
              else {
                const parts = r.replace(/[$]/g, '').split('-').map(s => s.replace(/[,\s]/g, ''));
                if (parts.length === 2) { min = Number(parts[0]) || null; max = Number(parts[1]) || null; }
              }
              setFilterMinPriceUsd(min);
              setFilterMaxPriceUsd(max);
              setPage(1);
            }} className={`hover:text-blue-700`}>{r}</button></li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded border">
        <p className="text-sm font-semibold mb-3">Shop By Type</p>
        <ul className="text-sm space-y-2">
          {bfTypes.length === 0 ? (
            <li className="text-sm text-gray-500">No types available</li>
          ) : (
            bfTypes.map((t: BfType) => {
              const typeName = t.type;
              const count = t.count;
              return (
                <li key={typeName || Math.random()} className="flex justify-between">
                  <button onClick={() => { setFilterType(typeName); setPage(1); }} className={`hover:text-blue-700 ${filterType === typeName ? 'text-blue-600 font-semibold' : ''}`}>{typeName}</button>
                  <span className="text-gray-400">({Number(count).toLocaleString()})</span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default PublicLeftSidebar;
