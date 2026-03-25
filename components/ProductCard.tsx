
import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Lock, ShoppingCart, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { user, addToCart, exchangeRate } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    
    // Reset state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Calculate ARS Price
  const priceInArs = product.price * exchangeRate;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full group">
      <div 
        className="relative h-48 w-full bg-gray-200 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <Eye className="h-3 w-3" /> Ver más
            </span>
        </div>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-brand-600 shadow-sm">
          {product.category}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 hover:text-brand-600 cursor-pointer transition-colors"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
          {product.description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          {user ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Precio</span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-brand-700">
                  $ {priceInArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center text-gray-400 bg-gray-50 px-2 py-2 rounded-lg border border-gray-200">
              <Lock className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="text-xs italic truncate">Precio oculto</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
                onClick={() => onViewDetails(product)}
                className="p-3 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-brand-600 transition-all shadow-sm"
                title="Ver Detalles"
            >
                <Eye className="h-5 w-5" />
            </button>
            
            {user && (
                <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`p-3 rounded-full text-white shadow-md transition-all duration-300 ${
                    isAdded 
                    ? 'bg-green-500 hover:bg-green-600 scale-110' 
                    : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/30 active:scale-95'
                }`}
                title={isAdded ? "Agregado" : "Agregar al carrito"}
                >
                {isAdded ? (
                    <Check className="h-5 w-5 animate-bounce" />
                ) : (
                    <ShoppingCart className="h-5 w-5" />
                )}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
