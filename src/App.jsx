import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import { catalog as defaultCatalog, tickerDataTemplate } from './data/catalog';

function App() {
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [userFavorites, setUserFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zentryFavorites')) || [];
    } catch {
      return [];
    }
  });

  const [activeModalId, setActiveModalId] = useState(null);

  useEffect(() => {
    localStorage.setItem('zentryFavorites', JSON.stringify(userFavorites));
  }, [userFavorites]);

  useEffect(() => {
    if (isMatrixMode) {
      document.body.classList.add('matrix-mode');
    } else {
      document.body.classList.remove('matrix-mode');
    }
  }, [isMatrixMode]);

  const toggleFavorite = (id) => {
    setUserFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSurpriseMe = () => {
    const allItems = defaultCatalog.flatMap(section => 
        section.subsections.flatMap(sub => sub.items)
    );
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    if(randomItem) {
        if(randomItem.id === "mc_modpack_01") {
            setIsMatrixMode(!isMatrixMode); // Easter egg
        } else {
            setActiveModalId(randomItem.id);
        }
    }
  };

  // Flatten the catalog for the grid component to make it easier to search
  const allItemsList = defaultCatalog.flatMap(section => 
    section.subsections.flatMap(sub => 
      sub.items.map(item => ({
        ...item,
        categoryString: `${section.id} ${sub.title}`.toLowerCase(),
        searchString: `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase()
      }))
    )
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onSurpriseMe={handleSurpriseMe} />
      
      {/* Ticker */}
      <div className="ticker-wrap hidden sm:block">
        <div className="ticker">
          <span className="mr-16">{tickerDataTemplate.join(" • ")}</span>
          <span className="mr-16">{tickerDataTemplate.join(" • ")}</span>
        </div>
      </div>

      <Hero onSurpriseMe={handleSurpriseMe} />
      
      <Catalog 
        allItemsList={allItemsList} 
        userFavorites={userFavorites} 
        onToggleFavorite={toggleFavorite}
        onOpenModal={(id) => setActiveModalId(id)}
      />
      
      <Footer />

      <ProductModal 
        isOpen={!!activeModalId} 
        productId={activeModalId} 
        catalog={defaultCatalog} 
        userFavorites={userFavorites}
        onToggleFavorite={toggleFavorite}
        onClose={() => setActiveModalId(null)} 
      />
    </div>
  );
}

export default App;
