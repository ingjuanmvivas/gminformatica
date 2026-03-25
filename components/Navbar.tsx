import React, { useState } from 'react';
import { ShoppingCart, User, LogOut, Settings, Monitor } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ConfirmationModal } from './ConfirmationModal';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenLogin }) => {
  const { user, cart, logout, view, setView } = useStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => setView('STORE')}>
              <Monitor className="h-8 w-8 text-brand-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">GM <span className="text-brand-600">Informatica</span></span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {user?.isAdmin && (
                <button
                  onClick={() => setView(view === 'STORE' ? 'ADMIN' : 'STORE')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'ADMIN' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {view === 'STORE' ? 'Administrar' : 'Ver Tienda'}
                </button>
              )}

              <button
                onClick={onOpenCart}
                className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-2 border-l pl-4 ml-2 border-gray-300">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.isAdmin ? 'Admin' : 'Cliente'}</span>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Acceder
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ConfirmationModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Cerrar Sesión"
        message={`¿Estás seguro de que deseas salir, ${user?.name}?`}
        confirmText="Salir"
      />
    </>
  );
};