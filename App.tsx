
import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { AdminPanel } from './components/AdminPanel';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Category, Product } from './types';
import { Filter, X, CheckCircle, AlertCircle, Info, Search } from 'lucide-react';

// --- Notification Component ---
const ToastContainer = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className={`pointer-events-auto flex items-center p-4 rounded-lg shadow-lg min-w-[300px] animate-fade-in-up bg-white border-l-4 ${
            n.type === 'success' ? 'border-green-500' : 
            n.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}
        >
          <div className="flex-shrink-0 mr-3">
            {n.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {n.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            {n.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          <div className="flex-1 text-sm font-medium text-gray-900">{n.message}</div>
          <button 
            onClick={() => removeNotification(n.id)}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

interface StoreContentProps {
  onViewProduct: (product: Product) => void;
}

const StoreContent: React.FC<StoreContentProps> = ({ onViewProduct }) => {
  const { products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                          p.description.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section - Banner Image */}
      <div className="mb-12 rounded-3xl overflow-hidden shadow-xl bg-gray-900">
        <img 
          src="/banner.png"
          onError={(e) => {
            // Fallback visual por si la imagen no existe
            e.currentTarget.src = "https://placehold.co/1200x400/1e3a8a/ffffff?text=GM+Informatica";
            e.currentTarget.onerror = null; 
          }}
          alt="GM Informatica Banner" 
          className="w-full h-auto object-cover min-h-[200px]"
        />
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-gray-200">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex items-center text-gray-500 mr-2 flex-shrink-0">
              <Filter className="h-5 w-5 mr-2" />
              <span className="font-medium hidden sm:inline">Categorías:</span>
          </div>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'ALL' 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todo
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
            <p className="text-gray-500 text-sm mt-2">
              Intenta ajustar tu búsqueda o cambia los filtros de categoría.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="mt-4 text-brand-600 font-medium hover:text-brand-800"
            >
              Ver todos los productos
            </button>
        </div>
      )}
    </div>
  );
};

const MainLayout = () => {
  const { view } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenLogin={() => setIsLoginOpen(true)} 
      />
      
      <ToastContainer />

      <main className="flex-grow">
        {view === 'ADMIN' ? (
          <AdminPanel /> 
        ) : (
          <StoreContent onViewProduct={setViewingProduct} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">&copy; 2024 GM Informatica. Todos los derechos reservados.</p>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
};

export default App;
