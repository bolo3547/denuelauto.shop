"use client";
import React, { useCallback, useEffect, useState } from 'react';
import useCompare from '@/hooks/useCompare';

export default function CompareButton({
  carId,
  slug = 'sample-dealer',
  onUpdate,
}: {
  carId?: string;
  slug?: string;
  onUpdate?: () => void;
}) {
  const tenantSlug = slug ?? 'global';
  const { isInCompare, addToCompare, removeFromCompare } = useCompare(tenantSlug);
  const [selected, setSelected] = useState(false);
  const isInCompareFn = useCallback(
    (id: string) => (typeof isInCompare === 'function' ? isInCompare(id) : false),
    [isInCompare]
  );

  useEffect(() => {
    setSelected(!!carId && isInCompareFn(carId));
  }, [carId, isInCompareFn]);

  function toggle() {
    if (!carId) return;
    if (isInCompareFn(carId)) {
      removeFromCompare?.(carId);
    } else {
      addToCompare?.(carId);
    }
    if (onUpdate) onUpdate();
  }

  return (
    <button
      onClick={toggle}
      aria-label={selected ? 'Remove from compare' : 'Add to compare'}
      className={`p-2 rounded ${selected ? 'bg-slate-700 text-white' : 'bg-gray-100'}`}
    >
      Compare
    </button>
  );
}
