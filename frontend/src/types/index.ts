export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  imageUrl: string;
  specs: Record<string, string>;
  featured: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatarUrl?: string | null;
}

