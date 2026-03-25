
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, ViewState, Order, Notification, PaymentMethod, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS } from '../constants';

interface StoreContextType {
  products: Product[];
  users: User[];
  cart: CartItem[];
  orders: Order[];
  user: User | null;
  view: ViewState;
  exchangeRate: number;
  notifications: Notification[];
  setView: (view: ViewState) => void;
  setExchangeRate: (rate: number) => void;
  fetchBlueDollarRate: () => Promise<void>;
  login: (email: string) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: PaymentMethod) => Promise<boolean>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addUser: (user: User) => void;
  deleteUser: (email: string) => void;
  toggleUserAdmin: (email: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrderItem: (orderId: string, itemId: string) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, newQuantity: number) => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  exportDatabase: () => string;
  importDatabase: (jsonString: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- INITIALIZATION ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('techstore_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('techstore_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('techstore_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    const saved = localStorage.getItem('techstore_exchange_rate');
    return saved ? parseFloat(saved) : 1200;
  });

  // Initialize User - Check local storage for active session
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('techstore_active_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Helper to get cart key
  const getCartKey = (u: User | null) => u ? `techstore_cart_${u.email}` : 'techstore_cart_guest';

  // Initialize Cart - Load based on initial user state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const initialUser = localStorage.getItem('techstore_active_user');
    const u = initialUser ? JSON.parse(initialUser) : null;
    const key = getCartKey(u);
    const savedCart = localStorage.getItem(key);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [view, setView] = useState<ViewState>('STORE');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('techstore_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('techstore_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('techstore_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('techstore_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  // Save cart whenever it changes, to the current user's key
  useEffect(() => {
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user]);

  // Save active user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('techstore_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('techstore_active_user');
    }
  }, [user]);

  // --- AUTO FETCH DOLLAR ON MOUNT ---
  useEffect(() => {
    fetchBlueDollarRate(true);
  }, []);

  // --- NOTIFICATIONS ---
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- DATA PORTABILITY ---
  const exportDatabase = () => {
    const data = {
      products,
      users,
      orders,
      exchangeRate,
      version: 1,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabase = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !data.users) {
        throw new Error("Formato de archivo inválido");
      }
      setProducts(data.products);
      setUsers(data.users);
      setOrders(data.orders || []);
      setExchangeRateState(data.exchangeRate || 1200);
      addNotification('success', 'Base de datos restaurada correctamente');
      return true;
    } catch (error) {
      console.error("Import error:", error);
      addNotification('error', 'Error al importar el archivo. Verifique el formato.');
      return false;
    }
  };

  // --- AUTH ---
  const login = (email: string) => {
    const existingUser = users.find(u => u.email === email);
    let loggedUser = existingUser;

    if (!loggedUser) {
      const newUser: User = {
        email,
        name: email.split('@')[0],
        isAdmin: false
      };
      setUsers(prev => [...prev, newUser]);
      loggedUser = newUser;
      addNotification('success', 'Cuenta creada exitosamente');
    } else {
      addNotification('success', `Bienvenido de nuevo, ${loggedUser.name}`);
    }

    setUser(loggedUser);
    if (loggedUser.isAdmin) setView('ADMIN');

    // Load USER cart
    const userCartKey = getCartKey(loggedUser);
    const savedUserCart = localStorage.getItem(userCartKey);
    if (savedUserCart) {
      setCart(JSON.parse(savedUserCart));
    } else {
      setCart([]); // Start fresh if no previous cart
    }
  };

  const logout = () => {
    // When logging out, we are switching to 'guest'
    // The current cart is already saved by the useEffect [cart, user]
    
    setUser(null);
    setView('STORE');
    
    // Load GUEST cart
    const guestCartKey = getCartKey(null);
    const savedGuestCart = localStorage.getItem(guestCartKey);
    setCart(savedGuestCart ? JSON.parse(savedGuestCart) : []);
    
    addNotification('info', 'Sesión cerrada');
  };

  // --- CART ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        addNotification('info', 'Cantidad actualizada en el carrito');
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      addNotification('success', 'Producto agregado al carrito');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const checkout = async (paymentMethod: PaymentMethod): Promise<boolean> => {
    if (!user || cart.length === 0) return false;

    const totalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder: Order = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      userEmail: user.email,
      userName: user.name,
      items: [...cart],
      totalUsd: totalUsd,
      exchangeRateSnapshot: exchangeRate,
      paymentMethod: paymentMethod,
      status: 'pendiente'
    };

    setOrders(prev => [newOrder, ...prev]);

    console.group('📧 ENVIANDO EMAIL A: gemeinformatica@gmail.com');
    console.log(`ASUNTO: Nuevo Pedido #${newOrder.id.slice(0,6)}`);
    console.log(`CLIENTE: ${user.name}`);
    console.log(`METODO PAGO: ${paymentMethod}`);
    console.log(`TOTAL USD: $${totalUsd.toFixed(2)}`);
    console.log(`COTIZACIÓN: $${exchangeRate}`);
    console.log(`TOTAL ARS: $${(totalUsd * exchangeRate).toFixed(2)}`);
    console.groupEnd();

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    clearCart(); // This triggers useEffect, clearing the localStorage for this user
    addNotification('success', `¡Pedido realizado! Se envió confirmación al administrador.`);
    return true;
  };

  // --- ADMIN: PRODUCTS ---
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
    addNotification('success', 'Producto creado correctamente');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addNotification('success', 'Producto actualizado');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addNotification('info', 'Producto eliminado');
  };

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
    addNotification('info', `Cotización actualizada a $${rate}`);
  };

  const fetchBlueDollarRate = async (silent = false): Promise<void> => {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const sellPrice = data.venta;

      if (sellPrice && !isNaN(sellPrice)) {
        setExchangeRateState(sellPrice);
        if (!silent) {
            addNotification('success', `Dólar Blue sincronizado: $${sellPrice}`);
        } else {
            console.log(`Dólar Blue actualizado al iniciar: $${sellPrice}`);
        }
      }
    } catch (error) {
      console.error("Error fetching dollar rate:", error);
      if (!silent) {
        addNotification('error', 'No se pudo obtener la cotización automáticamente.');
      }
    }
  };

  // --- ADMIN: ORDERS ---
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    addNotification('success', `Estado del pedido actualizado a: ${status}`);
  };

  const removeOrderItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newItems = order.items.filter(item => item.id !== itemId);
        const newTotalUsd = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          ...order,
          items: newItems,
          totalUsd: newTotalUsd
        };
      }
      return order;
    }));
    addNotification('info', 'Item eliminado y total recalculado');
  };

  const updateOrderItemQuantity = (orderId: string, itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newItems = order.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        const newTotalUsd = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
          ...order,
          items: newItems,
          totalUsd: newTotalUsd
        };
      }
      return order;
    }));
  };

  // --- ADMIN: USERS ---
  const addUser = (newUser: User) => {
    if (users.some(u => u.email === newUser.email)) {
      addNotification('error', 'El usuario ya existe');
      return;
    }
    setUsers(prev => [...prev, newUser]);
    addNotification('success', 'Usuario registrado');
  };

  const deleteUser = (email: string) => {
    setUsers(prev => prev.filter(u => u.email !== email));
    addNotification('info', 'Usuario eliminado');
  };

  const toggleUserAdmin = (email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email === email) {
        const updated = { ...u, isAdmin: !u.isAdmin };
        if (user && user.email === email) setUser(updated);
        return updated;
      }
      return u;
    }));
  };

  return (
    <StoreContext.Provider value={{
      products, users, cart, orders, user, view, exchangeRate, notifications,
      setView, setExchangeRate, fetchBlueDollarRate,
      login, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, checkout,
      addProduct, updateProduct, deleteProduct,
      addUser, deleteUser, toggleUserAdmin,
      updateOrderStatus, removeOrderItem, updateOrderItemQuantity,
      addNotification, removeNotification,
      exportDatabase, importDatabase
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
