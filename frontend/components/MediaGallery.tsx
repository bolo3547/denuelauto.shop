import Image from 'next/image';
"use client";
import { useState } from 'react';

export default function MediaGallery({images}:{images:any[]}){
  const [idx, setIdx] = useState(0);
  const main = images && images.length > 0 ? images[idx] : { url: '/placeholder.jpg' };
  return (
    <div>
      <div className="w-full h-96 relative rounded-2xl overflow-hidden">
        <Image src={main.url} alt="image" fill style={{objectFit:'cover'}} sizes="100vw" priority={true} />
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {images && images.map((it, i)=> (<div key={i} onClick={()=>setIdx(i)} className={`h-16 overflow-hidden rounded cursor-pointer ${i==idx? 'ring-2 ring-primary':''}`}>
          <img src={it.url} alt="thumb" className="w-full h-full object-cover" />
        </div>))}
      </div>
    </div>
  );
}
