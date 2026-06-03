import { useState, useEffect, useMemo, useCallback } from 'react';
import { DataService, Product, Category } from '@/lib/data-service';

// Helper to generate slug from product name
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          DataService.getProducts(),
          DataService.getCategories()
        ]);
        
        // Successfully loaded products and categories
        
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group products by category
  const vegetables = useMemo(() => 
    products.filter(p => p.category?.slug === 'fresh-vegetables'),
    [products]
  );

  const meat = useMemo(() =>
    products.filter(p => p.category?.slug === 'meat-poultry'),
    [products]
  );

  const allItems = useMemo(() => [...vegetables, ...meat], [vegetables, meat]);

  const getProductById = useCallback((id: string) => {
    return allItems.find(p => p.id === id) || null;
  }, [allItems]);

  const getProductBySlug = useCallback((slug: string) => {
    return allItems.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug) || null;
  }, [allItems]);

  return {
    products,
    categories,
    vegetables,
    meat,
    allItems,
    loading,
    error,
    getProductById,
    getProductBySlug,
    generateSlug
  };
};
