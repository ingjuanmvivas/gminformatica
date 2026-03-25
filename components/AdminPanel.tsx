
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, OrderStatus } from '../types';
import { Plus, Edit2, Trash2, Save, X, Package, Users, Shield, ShieldOff, UserPlus, ShoppingBag, Calendar, Mail, DollarSign, Image as ImageIcon, Link, Upload, BarChart3, Banknote, CreditCard, Settings, Download, FileJson, RefreshCcw, Check, Clock, Truck, AlertTriangle } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type AdminTab = 'PRODUCTS' | 'USERS' | 'ORDERS' | 'SETTINGS';
type ImageSource = 'URL' | 'UPLOAD';

interface SalesReportItem {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  totalRevenueUsd: number;
}

export const AdminPanel: React.FC = () => {
  const { 
    products, users, orders, exchangeRate,
    addProduct, updateProduct, deleteProduct, setExchangeRate, fetchBlueDollarRate,
    addUser, deleteUser, toggleUserAdmin,
    updateOrderStatus, removeOrderItem, updateOrderItemQuantity,
    exportDatabase, importDatabase
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('PRODUCTS');
  
  // Product State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>('URL');

  // User State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Report State
  const [showReport, setShowReport] = useState(false);

  // Exchange Rate State
  const [tempRate, setTempRate] = useState(exchangeRate.toString());
  const [isSyncingRate, setIsSyncingRate] = useState(false);

  // Order Item Deletion State
  const [itemToDelete, setItemToDelete] = useState<{orderId: string, itemId: string, productName: string} | null>(null);

  // --- Product Handlers ---
  const resetProductForm = () => {
    setEditingProduct(null);
    setImageSource('URL');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setImageSource(product.imageUrl.startsWith('data:') ? 'UPLOAD' : 'URL');
  };

  const handleCreateProduct = () => {
    setEditingProduct({
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      costPrice: 0,
      category: Category.COMPONENTS,
      description: '',
      imageUrl: 'https://picsum.photos/400/300',
    });
    setImageSource('URL');
  };

  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;
    
    const productToSave = {
        ...editingProduct,
        costPrice: editingProduct.costPrice || 0
    } as Product;

    const exists = products.find(p => p.id === productToSave.id);

    if (exists) {
      updateProduct(productToSave);
    } else {
      addProduct(productToSave);
    }
    resetProductForm();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Exchange Rate Handler ---
  const handleUpdateRate = () => {
    const rate = parseFloat(tempRate);
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate);
    }
  };

  const handleSyncRate = async () => {
    setIsSyncingRate(true);
    await fetchBlueDollarRate();
    setTimeout(() => {
        setIsSyncingRate(false);
    }, 500);
  };

  React.useEffect(() => {
    setTempRate(exchangeRate.toString());
  }, [exchangeRate]);

  // --- User Handlers ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserEmail && newUserName) {
      addUser({
        email: newUserEmail,
        name: newUserName,
        isAdmin: false
      });
      setNewUserEmail('');
      setNewUserName('');
    }
  };

  // --- Data Management Handlers ---
  const handleDownloadBackup = () => {
    const jsonString = exportDatabase();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gm_informatica_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const success = importDatabase(event.target.result as string);
          if (success) {
             e.target.value = "";
          }
        }
      };
    }
  };

  // --- Sales Report Logic ---
  const salesReport: SalesReportItem[] = useMemo(() => {
    const reportMap = new Map<string, SalesReportItem>();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (reportMap.has(item.id)) {
          const existing = reportMap.get(item.id)!;
          existing.quantitySold += item.quantity;
          existing.totalRevenueUsd += item.price * item.quantity;
        } else {
          reportMap.set(item.id, {
            productId: item.id,
            productName: item.name,
            category: item.category,
            quantitySold: item.quantity,
            totalRevenueUsd: item.price * item.quantity
          });
        }
      });
    });

    return Array.from(reportMap.values()).sort((a, b) => b.totalRevenueUsd - a.totalRevenueUsd);
  }, [orders]);

  const totalRevenue = salesReport.reduce((acc, item) => acc + item.totalRevenueUsd, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          
          {/* Exchange Rate Control */}
          <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <DollarSign className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-600 mr-2">Cotización (Blue):</span>
            <input 
              type="number" 
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-brand-500 focus:border-brand-500"
            />
            <button 
              onClick={handleUpdateRate}
              className="ml-2 text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded hover:bg-brand-100 font-medium"
              title="Establecer valor manual"
            >
              Fijar
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <button
              onClick={handleSyncRate}
              disabled={isSyncingRate}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Sincronizar con Dolar Blue hoy"
            >
                <RefreshCcw className={`h-4 w-4 ${isSyncingRate ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-100 p-1 rounded-lg inline-flex overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'PRODUCTS' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="h-4 w-4 mr-2" />
            Productos
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'USERS' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'ORDERS' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'SETTINGS' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </button>
        </div>
      </div>

      {activeTab === 'PRODUCTS' && (
        /* --- PRODUCT MANAGEMENT --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Products */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Inventario ({products.length})</h3>
              {!editingProduct && (
                <button onClick={handleCreateProduct} className="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center">
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </button>
              )}
            </div>
            <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {products.map((product) => {
                 const priceArs = product.price * exchangeRate;
                 const cost = product.costPrice || 0;
                 const margin = product.price - cost;
                 
                 return (
                    <li key={product.id} className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors group">
                      <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded object-cover bg-gray-100 border border-gray-200" />
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right mr-6">
                         <div className="text-sm font-bold text-gray-900">${priceArs.toLocaleString('es-AR')}</div>
                         <div className="text-xs text-gray-500 font-medium">USD {product.price.toFixed(2)}</div>
                         
                         {/* Admin Info: Cost & Margin */}
                         <div className="flex flex-col items-end mt-1 text-[10px] text-gray-400">
                            <span>Costo: ${cost.toFixed(2)}</span>
                            <span className={`${margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                               Margen: ${margin.toFixed(2)}
                            </span>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditProduct(product)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                 );
              })}
            </ul>
          </div>

          {/* Editor Form */}
          <div className="lg:col-span-1">
            {editingProduct ? (
              <div className="bg-white rounded-xl shadow-lg border border-brand-100 p-6 sticky top-24 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {products.find(p => p.id === editingProduct.id) ? 'Editar Producto' : 'Crear Producto'}
                  </h3>
                  <button onClick={resetProductForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Ej: Monitor 24''"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-xs">u$d</span>
                        </div>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={e => setEditingProduct(p => ({ ...p, price: parseFloat(e.target.value) }))}
                          className="w-full pl-8 px-2 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo (USD)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-xs">u$d</span>
                        </div>
                        <input
                          type="number"
                          value={editingProduct.costPrice || 0}
                          onChange={e => setEditingProduct(p => ({ ...p, costPrice: parseFloat(e.target.value) }))}
                          className="w-full pl-8 px-2 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2 flex justify-between items-center text-xs text-gray-500">
                     <span>Estimado en Pesos:</span>
                     <span className="font-bold">${((editingProduct.price || 0) * exchangeRate).toLocaleString('es-AR')}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value as Category }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    >
                      {Object.values(Category).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
                      placeholder="Escribe una descripción del producto..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
                    
                    <div className="flex gap-2 mb-2">
                       <button
                         type="button"
                         onClick={() => setImageSource('URL')}
                         className={`flex-1 flex items-center justify-center py-1 text-xs font-medium rounded-md border ${imageSource === 'URL' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-600'}`}
                       >
                         <Link className="h-3 w-3 mr-1" /> URL
                       </button>
                       <button
                         type="button"
                         onClick={() => setImageSource('UPLOAD')}
                         className={`flex-1 flex items-center justify-center py-1 text-xs font-medium rounded-md border ${imageSource === 'UPLOAD' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-600'}`}
                       >
                         <Upload className="h-3 w-3 mr-1" /> Subir
                       </button>
                    </div>

                    {imageSource === 'URL' ? (
                       <input
                         type="text"
                         value={editingProduct.imageUrl?.startsWith('data:') ? '' : editingProduct.imageUrl}
                         onChange={e => setEditingProduct(p => ({ ...p, imageUrl: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
                         placeholder="https://ejemplo.com/imagen.jpg"
                       />
                    ) : (
                       <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Click para seleccionar</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                      </label>
                    )}

                    <div className="mt-2 h-32 w-full bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                       {editingProduct.imageUrl ? (
                          <img src={editingProduct.imageUrl} alt="Preview" className="h-full w-full object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=Error+Imagen')}/>
                       ) : (
                          <span className="text-gray-400 text-xs">Vista previa</span>
                       )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveProduct}
                      className="w-full flex justify-center items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar Producto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <Edit2 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Selecciona un producto para editar</p>
                <p className="text-sm text-gray-400 mt-1">O crea uno nuevo con el botón "+ Agregar"</p>
                <button
                  onClick={handleCreateProduct}
                  className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  Crear Nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        /* --- USER MANAGEMENT --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-700">Usuarios Registrados ({users.length})</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.email} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Cliente
                      </span>
                    )}
                    
                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                       <button 
                        onClick={() => toggleUserAdmin(user.email)}
                        title={user.isAdmin ? "Quitar privilegios de Admin" : "Hacer Admin"}
                        className={`p-2 rounded-full transition-colors ${user.isAdmin ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-100 hover:text-purple-600'}`}
                      >
                        {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </button>
                      
                      <button 
                        onClick={() => deleteUser(user.email)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Add User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-600" />
                Registrar Usuario
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Usuario
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        /* --- ORDERS MANAGEMENT --- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Historial de Pedidos ({orders.length})</h3>
              <button 
                onClick={() => setShowReport(true)}
                className="text-sm bg-white text-brand-600 border border-brand-200 px-3 py-1.5 rounded-md font-medium hover:bg-brand-50 flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generar Reporte de Ventas
              </button>
           </div>
           {orders.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
               <p>No hay pedidos registrados.</p>
             </div>
           ) : (
             <ul className="divide-y divide-gray-200">
               {orders.map(order => {
                 const orderRate = order.exchangeRateSnapshot || exchangeRate;
                 const totalArs = order.totalUsd * orderRate;
                 
                 // Status Logic Helper
                 const getStatusColor = (status: string) => {
                   switch(status) {
                     case 'pendiente': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
                     case 'pagado': return 'text-blue-700 bg-blue-100 border-blue-200';
                     case 'enviado': return 'text-purple-700 bg-purple-100 border-purple-200';
                     case 'entregado': return 'text-green-700 bg-green-100 border-green-200';
                     case 'cancelado': return 'text-red-700 bg-red-100 border-red-200';
                     default: return 'text-gray-700 bg-gray-100 border-gray-200';
                   }
                 };

                 return (
                 <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                   <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full">
                          <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                             <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</span>
                             <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {order.userEmail}</span>
                          </div>
                          {/* Payment Method Badge */}
                          <div className="mt-2">
                            {order.paymentMethod === 'TRANSFERENCIA' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                <CreditCard className="w-3 h-3 mr-1" /> Transferencia
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <Banknote className="w-3 h-3 mr-1" /> Efectivo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 text-right flex flex-col items-end">
                        <div className="text-2xl font-bold text-brand-600">${totalArs.toLocaleString('es-AR')}</div>
                        <div className="text-xs text-gray-400 mb-2">USD {order.totalUsd.toFixed(2)} (Cotiz: {orderRate})</div>
                        
                        {/* Order Status Selector */}
                        <div className="flex items-center gap-2">
                           <select
                             value={order.status || 'pendiente'}
                             onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                             className={`text-xs font-medium px-3 py-1.5 rounded-full border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(order.status || 'pendiente')}`}
                           >
                             <option value="pendiente">⚠ Pendiente</option>
                             <option value="pagado">💵 Pagado</option>
                             <option value="enviado">🚚 Enviado</option>
                             <option value="entregado">✅ Entregado</option>
                             <option value="cancelado">❌ Cancelado</option>
                           </select>
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                     <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Detalle de productos</p>
                     <ul className="space-y-2">
                       {order.items.map((item, idx) => (
                         <li key={`${order.id}-${item.id}-${idx}`} className="flex justify-between items-center text-sm group/item">
                           <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1">
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-10 text-center text-gray-900 font-medium focus:outline-none text-xs py-1"
                                    value={item.quantity}
                                    onChange={(e) => updateOrderItemQuantity(order.id, item.id, parseInt(e.target.value) || 1)}
                                />
                                <span className="text-gray-400 text-xs pr-1">x</span>
                             </div>
                             <span className="text-gray-700">{item.name}</span>
                           </div>
                           <div className="flex items-center gap-4">
                             <span className="text-gray-900 font-medium">USD {(item.price * item.quantity).toFixed(2)}</span>
                             {/* Delete Item Button (Admin Feature) */}
                             <button
                               onClick={() => setItemToDelete({ orderId: order.id, itemId: item.id, productName: item.name })}
                               className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                               title="Eliminar item por falta de stock"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                         </li>
                       ))}
                     </ul>
                     {order.items.length === 0 && (
                       <div className="text-center py-2 text-red-500 text-sm italic">
                         ⚠ Pedido vacío
                       </div>
                     )}
                   </div>
                 </li>
                 );
               })}
             </ul>
           )}

           {/* Reports Modal */}
           {showReport && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-fade-in-up">
                 <div className="flex justify-between items-center p-6 border-b border-gray-200">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center">
                     <BarChart3 className="h-6 w-6 mr-2 text-brand-600" />
                     Reporte de Ventas por Producto
                   </h2>
                   <button 
                     onClick={() => setShowReport(false)}
                     className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1"
                   >
                     <X className="h-6 w-6" />
                   </button>
                 </div>
                 
                 <div className="p-6 overflow-y-auto">
                   {salesReport.length === 0 ? (
                     <div className="text-center text-gray-500 py-10">No hay ventas registradas para generar un reporte.</div>
                   ) : (
                     <>
                       <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                           <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Vendida</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Recaudado (USD)</th>
                           </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {salesReport.map((item) => (
                             <tr key={item.productId}>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantitySold}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-600 font-bold text-right">${item.totalRevenueUsd.toFixed(2)}</td>
                             </tr>
                           ))}
                         </tbody>
                         <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">TOTAL VENTAS</td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-brand-700">${totalRevenue.toFixed(2)}</td>
                            </tr>
                         </tfoot>
                       </table>
                     </>
                   )}
                 </div>
                 
                 <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
                   <button
                     onClick={() => setShowReport(false)}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                   >
                     Cerrar
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}
      
      {activeTab === 'SETTINGS' && (
        /* --- SYSTEM SETTINGS (BACKUP) --- */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600" />
              Gestión de Datos y Copias de Seguridad
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {/* EXPORT */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4 text-blue-800">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">Exportar Base de Datos</h3>
                </div>
                <p className="text-sm text-blue-700 mb-6 flex-grow">
                  Descarga un archivo con todos tus productos, usuarios, pedidos y configuración. 
                  Utiliza este archivo para trasladar tu tienda a otra computadora o como copia de seguridad.
                </p>
                <button 
                  onClick={handleDownloadBackup}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar Copia (.JSON)
                </button>
              </div>

              {/* IMPORT */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4 text-green-800">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FileJson className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg">Restaurar / Importar</h3>
                </div>
                <p className="text-sm text-green-700 mb-6 flex-grow">
                  Carga un archivo de copia de seguridad previamente descargado. 
                  <br />
                  <span className="font-bold text-xs uppercase text-red-500 block mt-2">
                    ⚠ Advertencia: Esto reemplazará los datos actuales.
                  </span>
                </p>
                <label className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Seleccionar Archivo
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleRestoreBackup} 
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
              <p>Versión del Sistema: 1.0.0 &bull; Almacenamiento Local Activo</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Order Item */}
      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
            if (itemToDelete) {
                removeOrderItem(itemToDelete.orderId, itemToDelete.itemId);
            }
        }}
        title="Eliminar Producto del Pedido"
        message={`¿Estás seguro de eliminar "${itemToDelete?.productName}" de este pedido? Se recalculará el monto total automáticamente.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};
