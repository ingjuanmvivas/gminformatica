import React, { useState } from 'react';
import { X, UserCheck, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const { login } = useStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      login(email);
      setEmail('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Acceso a GM Informatica</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mb-4">
            <p className="font-semibold flex items-center gap-2">
              <UserCheck size={16} />
              Modo Demo
            </p>
            <p className="mt-1">
              Ingresa <strong>admin@tech.com</strong> para funciones de editor.
              <br />Cualquier otro email para vista de cliente.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors shadow-lg shadow-brand-500/30"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};