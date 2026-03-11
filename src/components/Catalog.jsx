import React, { useState, useMemo, useEffect } from 'react';
import { CaretDown, CaretUp, Ghost, SquaresFour, List as ListIcon, Heart, MagnifyingGlass, Fire } from '@phosphor-icons/react';
import ProductCard from './ProductCard';

const Catalog = ({ allItemsList, userFavorites, onToggleFavorite, onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('popular');
  const [currentLayout, setCurrentLayout] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (subId) => {
    setCollapsedSections(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  const filteredItems = useMemo(() => {
    let result = allItemsList;

    if (activeCategory === 'favorites') {
      result = result.filter(item => userFavorites.includes(item.id));
    } else if (activeCategory !== 'all') {
      result = result.filter(item => item.categoryString.includes(activeCategory));
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => item.searchString.includes(term));
    }

    return result;
  }, [allItemsList, activeCategory, searchTerm, userFavorites]);

  const sortedItems = useMemo(() => {
    let sorted = [...filteredItems];
    if (sortType === 'popular') sorted.sort((a, b) => b.downloads - a.downloads);
    else if (sortType === 'newest') sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sortType === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [filteredItems, sortType]);

  const groupedAndSorted = useMemo(() => {
    const grouped = { minecraft: [], roblox: [], scripts: [] };
    
    sortedItems.forEach(item => {
      if (item.categoryString.includes('minecraft')) grouped.minecraft.push(item);
      else if (item.categoryString.includes('roblox') && item.type !== 'Script') grouped.roblox.push(item);
      else if (item.type === 'Script') grouped.scripts.push(item);
    });

    return [
      { id: 'minecraft', title: 'Minecraft Mods & Clients', items: grouped.minecraft },
      { id: 'roblox', title: 'Roblox Exploits & Tools', items: grouped.roblox },
      { id: 'scripts', title: 'Script Hubs', items: grouped.scripts },
    ].filter(g => g.items.length > 0);
  }, [sortedItems]);

  const trendingTags = useMemo(() => {
    const counts = {};
    allItemsList.forEach(i => i.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  }, [allItemsList]);

  return (
    <div id="products" className="bg-slate-900 py-16 flex-grow min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search & Toolbar */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none">
                <MagnifyingGlass className="text-slate-500 group-focus-within:text-blue-500 transition-colors text-lg" weight="bold" />
              </div>
              <input 
                type="text" 
                placeholder="Filter by name, tag, or description..." 
                className="block w-full pl-11 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-xl leading-5 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-lg shadow-black/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center hidden md:flex"><span className="text-xs text-slate-600 border border-slate-800 rounded px-1.5 py-0.5">/ to search</span></div>
              
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-3 items-center ml-2">
                 <span className="font-semibold text-orange-400 flex items-center gap-1"><Fire weight="fill" /> Trending:</span>
                 {trendingTags.map((t, i) => (
                   <React.Fragment key={t}>
                     <span 
                        onClick={() => setSearchTerm(t)} 
                        className="cursor-pointer hover:text-blue-400 transition underline decoration-transparent hover:decoration-blue-400">
                        #{t}
                     </span>
                     {i < trendingTags.length -1 && <span className="text-slate-700 px-0.5">&bull;</span>}
                   </React.Fragment>
                 ))}
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <div className="relative h-14">
                <select 
                  value={sortType} 
                  onChange={e => setSortType(e.target.value)}
                  className="appearance-none h-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer shadow-lg shadow-black/20"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500"><CaretDown weight="bold" /></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex shadow-lg shadow-black/20 h-14">
                <button onClick={() => setCurrentLayout('grid')} className={`p-2 rounded-lg transition-colors ${currentLayout === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}><SquaresFour text-lg weight="bold" /></button>
                <button onClick={() => setCurrentLayout('list')} className={`p-2 rounded-lg transition-colors ${currentLayout === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}><ListIcon text-lg weight="bold" /></button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['all', 'favorites', 'minecraft', 'roblox', 'scripts'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-pill px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'} ${cat === 'favorites' ? 'text-pink-400' : ''}`}
              >
                {cat === 'favorites' && <Heart weight="fill" className="mr-1" />}
                <span className="capitalize">{cat}</span>
              </button>
            ))}
          </div>
          
          {sortedItems.length === 0 && (
            <div className="text-center mt-8 p-8 border border-dashed border-slate-800 rounded-xl">
              <Ghost className="text-4xl text-slate-600 mb-2 mx-auto" weight="duotone" />
              <p className="text-slate-500">No items found matching your filter.</p>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        <div id="catalog-container" className={currentLayout === 'list' ? 'layout-list' : ''}>
          {groupedAndSorted.map(group => {
            const isCollapsed = collapsedSections[group.id];
            return (
              <div key={group.id} className="mb-16 subsection-wrapper">
                <div className="flex items-center justify-between mb-8 pl-4 border-l-4 border-blue-500 cursor-pointer group select-none" onClick={() => toggleSection(group.id)}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-200 tracking-tight group-hover:text-blue-400 transition">{group.title}</h3>
                    <span className="bg-slate-800 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">{group.items.length}</span>
                  </div>
                  {isCollapsed ? 
                    <CaretDown className="text-slate-500 group-hover:text-blue-400 transition transform duration-300 pointer-events-none" weight="bold" /> :
                    <CaretUp className="text-slate-500 group-hover:text-blue-400 transition transform duration-300 pointer-events-none" weight="bold" />
                  }
                </div>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-wrapper">
                    {group.items.map(item => (
                      <ProductCard 
                        key={item.id} 
                        product={item} 
                        isFavorite={userFavorites.includes(item.id)}
                        onToggleFavorite={onToggleFavorite}
                        onOpenModal={onOpenModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Catalog;
