
import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, Banknote, CreditCard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, checkout, user, exchangeRate } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  
  const totalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalArs = totalUsd * exchangeRate;
  
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const success = await checkout(paymentMethod);
    setIsCheckingOut(false);
    
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out h-full bg-white shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-brand-600" /> Tu Carrito
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <ShoppingBag className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Tu carrito está vacío</p>
                <p className="text-sm mt-2">¡Explora nuestro catálogo y encuentra lo mejor en tecnología!</p>
                <button 
                  onClick={onClose}
                  className="mt-6 px-6 py-2 bg-brand-100 text-brand-700 rounded-full font-medium hover:bg-brand-200 transition-colors"
                >
                  Volver a la tienda
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.map((item) => {
                    const itemTotalArs = item.price * item.quantity * exchangeRate;
                    return (
                      <li key={item.id} className="flex py-2">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="line-clamp-1">{item.name}</h3>
                              <p className="ml-4">${itemTotalArs.toLocaleString('es-AR')}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                            <p className="text-xs text-gray-400">Unitario USD: ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm mt-2">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-gray-600 hover:bg-gray-100 hover:text-brand-600 transition-colors rounded-l-md"
                                disabled={item.quantity <= 1 && false} 
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-3 py-1 text-gray-900 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-gray-600 hover:bg-gray-100 hover:text-brand-600 transition-colors rounded-r-md"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
               {/* Payment Method Selection */}
               <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Método de Pago</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('EFECTIVO')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                      paymentMethod === 'EFECTIVO' 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Banknote className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Efectivo</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('TRANSFERENCIA')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                      paymentMethod === 'TRANSFERENCIA' 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Transferencia</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                <p>Total (Pesos)</p>
                <p>${totalArs.toLocaleString('es-AR')}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <p>Ref. Dólares</p>
                <p>u$d {totalUsd.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 mb-6">
                Cotización aplicada: ${exchangeRate}/USD.
              </p>
              
              {!user ? (
                 <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-amber-800 text-sm text-center">
                   Debes iniciar sesión para finalizar la compra.
                 </div>
              ) : null}

              <div className="grid gap-3">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !user}
                  className="flex items-center justify-center rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
                <button
                  onClick={clearCart}
                  disabled={isCheckingOut}
                  className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
