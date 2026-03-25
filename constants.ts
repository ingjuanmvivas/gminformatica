
import { Product, Category, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'GeForce RTX 4070 Ti',
    price: 899.99,
    costPrice: 720.00,
    category: Category.COMPONENTS,
    description: 'Tarjeta gráfica de alto rendimiento para gaming 4K y renderizado 3D. Arquitectura Ada Lovelace con DLSS 3.0.',
    imageUrl: 'https://picsum.photos/400/300?random=1',
  },
  {
    id: '2',
    name: 'Teclado Mecánico RGB Pro',
    price: 129.50,
    costPrice: 85.00,
    category: Category.PERIPHERALS,
    description: 'Switches azules táctiles, iluminación RGB por tecla personalizable y chasis de aluminio aeronáutico.',
    imageUrl: 'https://picsum.photos/400/300?random=2',
  },
  {
    id: '3',
    name: 'UltraBook X1 Carbon',
    price: 1450.00,
    costPrice: 1100.00,
    category: Category.LAPTOPS,
    description: 'Potencia en movimiento. Procesador i7 de última generación, 32GB RAM y 1TB SSD en un cuerpo ultra ligero.',
    imageUrl: 'https://picsum.photos/400/300?random=3',
  },
  {
    id: '4',
    name: 'SSD NVMe 2TB Gen4',
    price: 180.00,
    costPrice: 135.00,
    category: Category.STORAGE,
    description: 'Velocidades de lectura de hasta 7000MB/s. Ideal para expandir el almacenamiento de tu PS5 o PC Gamer.',
    imageUrl: 'https://picsum.photos/400/300?random=4',
  },
];

export const INITIAL_USERS: User[] = [
  {
    email: 'admin@tech.com',
    name: 'Administrador',
    isAdmin: true,
  },
  {
    email: 'cliente@tech.com',
    name: 'Cliente Demo',
    isAdmin: false,
  }
];
