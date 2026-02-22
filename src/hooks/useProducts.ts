import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import type { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: 'wifi-install',
    title: 'WiFi & Network Installation',
    description: 'Professional WiFi network setup and optimization service for homes and offices.',
    fullDescription: 'Get a professional WiFi network setup that covers your entire space with strong signal. We optimize placement for maximum coverage and configure security settings to protect your network.',
    icon: '/images/products/wifi.svg',
    category: 'networking',
    rating: 4.9,
    reviews: 128,
    tiers: [
      { name: 'Basic', price: 350000, features: ['Up to 100 Mbps', 'Single Floor Coverage', 'Basic Security Setup', '1 Month Support'] },
      { name: 'Standard', price: 500000, features: ['Up to 300 Mbps', 'Multi-Floor Coverage', 'Advanced Security', '3 Months Support', 'Guest Network'] },
      { name: 'Premium', price: 750000, features: ['Up to 1 Gbps', 'Whole Building Coverage', 'Enterprise Security', '6 Months Support', 'Guest Network', 'Parental Controls'] },
    ],
    features: ['Professional Installation', 'Coverage Optimization', 'Security Configuration', 'Device Connection Support'],
  },
  {
    id: 'cctv-setup',
    title: 'CCTV Installation Service',
    description: 'Complete CCTV system installation with remote monitoring setup.',
    fullDescription: 'Professional CCTV installation service with high-quality cameras, remote viewing setup, and motion detection configuration. Keep your property secure 24/7.',
    icon: '/images/products/cctv.svg',
    category: 'security',
    rating: 4.8,
    reviews: 95,
    tiers: [
      { name: '2 Cameras', price: 1200000, features: ['2 HD Cameras', 'DVR/NVR Included', '50m Cable', 'Basic App Setup', '1 Month Warranty'] },
      { name: '4 Cameras', price: 2200000, features: ['4 HD Cameras', 'DVR/NVR Included', '100m Cable', 'Advanced App Setup', '3 Months Warranty', 'Cloud Storage Setup'] },
      { name: '8 Cameras', price: 4000000, features: ['8 HD Cameras', 'DVR/NVR Included', '200m Cable', 'Advanced App Setup', '6 Months Warranty', 'Cloud Storage', 'Night Vision'] },
    ],
    features: ['HD Quality Recording', 'Remote Mobile Access', 'Motion Detection Alerts', 'Night Vision Capable'],
  },
  {
    id: 'code-repair',
    title: 'Code Repair & Debug',
    description: 'Expert debugging and code repair service for any programming language.',
    fullDescription: 'Stuck with a bug? Our experienced developers can help fix errors in any programming language including JavaScript, Python, Java, C++, and more.',
    icon: '/images/products/code.svg',
    category: 'development',
    rating: 5.0,
    reviews: 210,
    tiers: [
      { name: 'Small Fix', price: 150000, features: ['1-3 Bugs Fixed', '48 Hour Delivery', 'Basic Documentation', '1 Revision'] },
      { name: 'Medium Fix', price: 350000, features: ['4-8 Bugs Fixed', '72 Hour Delivery', 'Detailed Documentation', '3 Revisions', 'Code Review'] },
      { name: 'Complex Fix', price: 700000, features: ['9-15 Bugs Fixed', '5 Day Delivery', 'Complete Documentation', 'Unlimited Revisions', 'Code Review', 'Optimization'] },
    ],
    features: ['Any Programming Language', 'Bug Documentation', 'Code Optimization', 'Performance Testing'],
  },
  {
    id: 'media-editing',
    title: 'Photo & Video Editing',
    description: 'Professional photo retouching and video editing services.',
    fullDescription: 'Transform your photos and videos with professional editing. From color correction to complex compositing, we deliver stunning results.',
    icon: '/images/products/media.svg',
    category: 'media',
    rating: 4.7,
    reviews: 156,
    tiers: [
      { name: 'Photo', price: 50000, features: ['Up to 10 Photos', 'Color Correction', 'Basic Retouching', '48 Hour Delivery'] },
      { name: 'Video', price: 250000, features: ['Up to 5 Minutes', 'Color Grading', 'Audio Sync', 'Transitions', '3 Day Delivery'] },
      { name: 'Pro Package', price: 500000, features: ['20 Photos + 10 Min Video', 'Advanced Retouching', 'Motion Graphics', 'Sound Design', '5 Day Delivery'] },
    ],
    features: ['Adobe Creative Suite', '4K Resolution Support', 'Revision Included', 'Source Files Included'],
  },
  {
    id: 'vps-hosting',
    title: 'VPS Hosting Setup',
    description: 'Virtual Private Server setup and configuration service.',
    fullDescription: 'Get your VPS server configured professionally with security hardening, software installation, and monitoring setup.',
    icon: '/images/products/server.svg',
    category: 'hosting',
    rating: 4.9,
    reviews: 89,
    tiers: [
      { name: 'Basic', price: 200000, features: ['OS Installation', 'Basic Security', 'Web Server Setup', 'Email Configuration', '1 Month Support'] },
      { name: 'Business', price: 450000, features: ['OS Installation', 'Advanced Security', 'Web + DB Server', 'SSL Setup', 'Backup Configuration', '3 Months Support'] },
      { name: 'Enterprise', price: 800000, features: ['Custom OS', 'Enterprise Security', 'Full Stack Setup', 'Load Balancer', 'Monitoring', '6 Months Support'] },
    ],
    features: ['Linux/Windows Support', 'Security Hardening', 'Performance Optimization', '24/7 Monitoring'],
  },
  {
    id: 'web-dev',
    title: 'Website Development',
    description: 'Custom website development from landing pages to full web apps.',
    fullDescription: 'Professional website development services. We create responsive, fast, and SEO-friendly websites tailored to your needs.',
    icon: '/images/products/web.svg',
    category: 'development',
    rating: 4.8,
    reviews: 145,
    tiers: [
      { name: 'Landing Page', price: 1200000, features: ['1 Page Design', 'Mobile Responsive', 'Basic SEO', 'Contact Form', '1 Week Delivery'] },
      { name: 'Business', price: 3500000, features: ['Up to 5 Pages', 'CMS Integration', 'Advanced SEO', 'Analytics Setup', '3 Weeks Delivery', '2 Revisions'] },
      { name: 'E-Commerce', price: 8000000, features: ['Unlimited Products', 'Payment Gateway', 'Admin Dashboard', 'User Accounts', '6 Weeks Delivery', 'Unlimited Revisions'] },
    ],
    features: ['React/Next.js/Vue', 'Mobile Responsive', 'SEO Optimized', 'Fast Loading Speed'],
  },
];

export const useProducts = () => {
  const { products, setProducts } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Check localStorage first
      const stored = localStorage.getItem('digital-store-products');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      } else {
        // Use mock data
        setProducts(mockProducts);
        localStorage.setItem('digital-store-products', JSON.stringify(mockProducts));
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        rating: 0,
        reviews: 0,
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('digital-store-products', JSON.stringify(updatedProducts));
      return newProduct;
    } catch (err) {
      throw new Error('Failed to create product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProducts = products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem('digital-store-products', JSON.stringify(updatedProducts));
      return updatedProducts.find((p) => p.id === id);
    } catch (err) {
      throw new Error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('digital-store-products', JSON.stringify(updatedProducts));
    } catch (err) {
      throw new Error('Failed to delete product');
    }
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category);
  };

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
  };
};
