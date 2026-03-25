import React from 'react';
import { X, ShoppingCart, Check, DollarSign } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { user, addToCart, exchangeRate } = useStore();
  const [isAdded, setIsAdded] = React.useState(false);

  if (!product) return null;

  const priceInArs = product.price * exchangeRate;

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative animate-scale-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8 relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="max-h-[400px] w-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="mb-1">
             <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 mb-4">
              {product.category}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h2>
          
          <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
            <p className="text-base leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-auto">
            {user ? (
              <div className="flex flex-col mb-6">
                <span className="text-sm text-gray-500">Precio Final</span>
                <div className="flex items-baseline gap-3">
                   <span className="text-4xl font-bold text-brand-700">
                    $ {priceInArs.toLocaleString('es-AR')}
                  </span>
                  <span className="text-lg text-gray-400 font-medium">
                    (u$d {product.price.toFixed(2)})
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Incluye IVA y garantías oficiales.</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center border border-gray-200">
                <p className="text-gray-600 italic flex items-center justify-center gap-2">
                  <DollarSign className="h-4 w-4" /> Inicia sesión para ver el precio
                </p>
              </div>
            )}

            <div className="flex gap-4">
               {user && (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isAdded 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/30'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-5 w-5" /> Agregado
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" /> Agregar al Carrito
                      </>
                    )}
                  </button>
               )}
               {!user && (
                 <button 
                   className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                   disabled
                 >
                   Disponible
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};