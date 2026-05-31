'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface ReviewCardProps {
  id: string;
  title: string;
  onPlay: (id: string) => void;
}

function ReviewCard({ id, title, onPlay }: ReviewCardProps) {
  const maxres = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const hqdefault = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const [src, setSrc] = useState(maxres);

  return (
    <div
      onClick={() => onPlay(id)}
      className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        onError={() => setSrc(hqdefault)}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />

      {/* Centered Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform duration-300 ease-out group-hover:scale-110">
          <Play className="ml-0.5 h-5 w-5 fill-current text-black" />
        </div>
      </div>
    </div>
  );
}

const reviewVideos = [
  { id: 's9oBUHHB9W4', title: 'DJI Osmo Pocket 4' },
  { id: '1OOJxF77D30', title: 'Review Kính Công Nghệ' },
  { id: 'xmF2NtOAfKg', title: 'Tech Reviewer' },
  { id: 'U3uXNufioA8', title: 'Acer NitroSense' },
];

export function ReviewCorner() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <h2 className="mb-4 text-lg font-bold text-[#1b1c1c]">Góc review dành cho bạn</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {reviewVideos.map((video) => (
          <ReviewCard
            key={video.id}
            id={video.id}
            title={video.title}
            onPlay={setActiveVideoId}
          />
        ))}
      </div>

      {/* Video Modal Overlay */}
      {activeVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideoId(null)}
        >
          <div
            className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveVideoId(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>

            {/* YouTube Embed Player */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
