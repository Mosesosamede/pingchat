import React, { useState } from 'react';
import { STICKER_PACKS, GIF_COLLECTION, StickerItem, GifItem } from '../../data/stickersAndGifs';
import { Search, Sparkles, Image as ImageIcon, Heart, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface StickerGifDrawerProps {
  onSelectSticker: (sticker: StickerItem) => void;
  onSelectGif: (gif: GifItem) => void;
  onClose: () => void;
}

export const StickerGifDrawer: React.FC<StickerGifDrawerProps> = ({
  onSelectSticker,
  onSelectGif,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'gifs'>('stickers');
  const [gifSearch, setGifSearch] = useState('');
  const [selectedStickerCategory, setSelectedStickerCategory] = useState(STICKER_PACKS[0].category);

  const filteredGifs = GIF_COLLECTION.filter(gif =>
    gif.title.toLowerCase().includes(gifSearch.toLowerCase()) ||
    gif.category.toLowerCase().includes(gifSearch.toLowerCase())
  );

  const activeStickerPack = STICKER_PACKS.find(p => p.category === selectedStickerCategory) || STICKER_PACKS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-16 left-2 right-2 md:left-4 md:right-auto md:w-96 p-4 bg-slate-900/95 border border-pink-500/40 rounded-3xl shadow-2xl backdrop-blur-xl z-30 text-white overflow-hidden"
    >
      {/* Top Tabs */}
      <div className="flex items-center gap-2 mb-3 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'stickers'
              ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Stickers</span>
        </button>
        <button
          onClick={() => setActiveTab('gifs')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'gifs'
              ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-300" />
          <span>GIFs</span>
        </button>
      </div>

      {/* TAB 1: STICKERS */}
      {activeTab === 'stickers' && (
        <div className="space-y-3">
          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STICKER_PACKS.map(pack => (
              <button
                key={pack.category}
                onClick={() => setSelectedStickerCategory(pack.category)}
                className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedStickerCategory === pack.category
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>{pack.icon}</span>
                <span>{pack.category}</span>
              </button>
            ))}
          </div>

          {/* Sticker Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {activeStickerPack.stickers.map(stk => (
              <button
                key={stk.id}
                onClick={() => {
                  onSelectSticker(stk);
                  onClose();
                }}
                className={`p-3 rounded-2xl bg-gradient-to-br ${stk.gradient} hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-pink-500/30 flex flex-col items-center justify-center gap-1`}
              >
                <span className="text-3xl">{stk.emoji}</span>
                <span className="text-[10px] font-bold text-white tracking-tight drop-shadow-sm truncate w-full text-center">
                  {stk.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GIFS */}
      {activeTab === 'gifs' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={gifSearch}
              onChange={(e) => setGifSearch(e.target.value)}
              placeholder="Search GIFs or reactions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* GIF Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredGifs.map(gif => (
              <button
                key={gif.id}
                onClick={() => {
                  onSelectGif(gif);
                  onClose();
                }}
                className="group relative h-24 rounded-2xl overflow-hidden border border-slate-700 hover:border-pink-500 transition-all hover:scale-[1.02] active:scale-95"
              >
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] font-medium text-white truncate">
                    {gif.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
