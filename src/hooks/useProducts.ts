import { useState, useMemo, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  emoji: string;
  category: 'produce' | 'meat';
  price: number | null;
  unit: string;
  description: string;
  image: string;
  note?: string;
  harvestDate?: string;
  weight?: string;
  inStock: boolean;
  tags: string[];
}

export interface ProductFilter {
  category: 'all' | 'produce' | 'meat';
  search: string;
  inStock: boolean;
  priceRange: [number, number] | null;
}

export const useProducts = () => {
  const [filter, setFilter] = useState<ProductFilter>({
    category: 'all',
    search: '',
    inStock: true,
    priceRange: null
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mock product data - in real app this would come from API
  const allProducts: Product[] = [
    {
      id: 'rape',
      name: 'Rape',
      emoji: '??',
      category: 'produce',
      price: 5,
      unit: 'bundle',
      description: 'Fresh, tender rape leaves perfect for traditional Zambian dishes. Grown organically in Chisamba.',
      image: '/api/placeholder/300/200',
      harvestDate: '2024-04-05',
      weight: '~500g per bundle',
      inStock: true,
      tags: ['leafy greens', 'traditional', 'organic']
    },
    {
      id: 'chibwabwa',
      name: 'Chibwabwa',
      emoji: '??',
      category: 'produce',
      price: 5,
      unit: 'bundle',
      description: 'Pumpkin leaves, a Zambian delicacy rich in nutrients and perfect for ndiwo.',
      image: '/api/placeholder/300/200',
      harvestDate: '2024-04-05',
      weight: '~400g per bundle',
      inStock: true,
      tags: ['leafy greens', 'traditional', 'nutritious']
    },
    {
      id: 'pork-chops',
      name: 'Pork Chops',
      emoji: '??',
      category: 'meat',
      price: 110,
      unit: 'kg',
      description: 'Premium quality pork chops from our responsibly raised pigs. Perfect for grilling and frying.',
      image: '/api/placeholder/300/200',
      weight: 'Available in various sizes',
      inStock: true,
      tags: ['pork', 'premium', 'grilling']
    },
    {
      id: 'village-chicken',
      name: 'Village Chicken',
      emoji: '??',
      category: 'meat',
      price: 150,
      unit: 'whole',
      description: 'Traditional village-raised chickens with authentic flavor and texture. Free-range and organic.',
      image: '/api/placeholder/300/200',
      weight: '~1.5kg per chicken',
      inStock: true,
      tags: ['chicken', 'traditional', 'free-range']
    },
    {
      id: 'tomatoes',
      name: 'Tomatoes',
      emoji: '??',
      category: 'produce',
      price: null,
      unit: 'kg',
      description: 'Fresh, ripe tomatoes grown in our greenhouses. Perfect for salads and cooking.',
      image: '/api/placeholder/300/200',
      harvestDate: '2024-04-06',
      note: 'Market price',
      weight: 'Sold by the kilogram',
      inStock: true,
      tags: ['vegetables', 'fresh', 'versatile']
    }
  ];

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Category filter
      if (filter.category !== 'all' && product.category !== filter.category) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Stock filter
      if (filter.inStock && !product.inStock) {
        return false;
      }

      // Price range filter
      if (filter.priceRange && product.price) {
        const [min, max] = filter.priceRange;
        return product.price >= min && product.price <= max;
      }

      return true;
    });
  }, [allProducts, filter]);

  const updateFilter = useCallback((updates: Partial<ProductFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      category: 'all',
      search: '',
      inStock: true,
      priceRange: null
    });
  }, []);

  const getProductById = useCallback((id: string) => {
    return allProducts.find(p => p.id === id) || null;
  }, [allProducts]);

  const getProductsByCategory = useCallback((category: 'produce' | 'meat') => {
    return allProducts.filter(p => p.category === category);
  }, [allProducts]);

  return {
    products: filteredProducts,
    allProducts,
    filter,
    updateFilter,
    clearFilter,
    selectedProduct,
    setSelectedProduct,
    getProductById,
    getProductsByCategory
  };
};
