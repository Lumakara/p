import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Menu,
  AlertCircle,
  DollarSign,
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Bell,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useAppStore } from '@/store/appStore';
import type { Product, Order, SupportTicket } from '@/types';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Admin credentials
const ADMIN_EMAIL = 'admin@lumakara.com';
const ADMIN_PASSWORD = 'admin123';



function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);


  // Check if already logged in
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession === 'true') {
      setIsLoggedIn(true);
    }
    const savedTheme = localStorage.getItem('admin_dark_mode');
    if (savedTheme === 'true') setIsDarkMode(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      localStorage.setItem('admin_session', 'true');
      setIsLoggedIn(true);
      toast.success('Login berhasil! Selamat datang di Admin Dashboard');
    } else {
      setLoginError('Email atau password salah');
      toast.error('Login gagal! Periksa kredensial Anda');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
    toast.success('Logout berhasil');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('admin_dark_mode', (!isDarkMode).toString());
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20" />
        <Card className="w-full max-w-md relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@lumakara.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                Login
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Default: admin@lumakara.com / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className={`min-h-screen ${bgClass} flex`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 ${sidebarBg} border-r flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-lg ${textClass}`}>Lumakara</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : `hover:bg-gray-100 dark:hover:bg-gray-700 ${subTextClass}`
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${subTextClass}`}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`sticky top-0 z-30 ${sidebarBg} border-b px-4 py-3 flex items-center justify-between`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className={`hidden sm:block text-sm font-medium ${textClass}`}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <DashboardContent isDarkMode={isDarkMode} />}
          {activeTab === 'products' && <ProductsContent isDarkMode={isDarkMode} />}
          {activeTab === 'orders' && <OrdersContent isDarkMode={isDarkMode} />}
          {activeTab === 'settings' && <SettingsContent isDarkMode={isDarkMode} />}
        </div>
      </main>
    </div>
  );
}

// Dashboard Content
function DashboardContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { products } = useProducts();
  const { orders, tickets } = useAppStore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalTickets: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    newTickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [orders, tickets, products]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter((o: Order) => o.status === 'pending').length;
      const completedOrders = orders.filter((o: Order) => o.status === 'completed').length;
      const todayOrders = orders.filter((o: Order) => {
        const orderDate = new Date(o.createdAt || o.created_at || '');
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length;
      const newTickets = tickets.filter((t: SupportTicket) => t.status === 'open').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalTickets: tickets.length,
        pendingOrders,
        completedOrders,
        todayOrders,
        newTickets,
      });

      setRecentOrders(orders.slice(0, 5));

      // Generate chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const chartData = last7Days.map(date => {
        const dayOrders = orders.filter((o: Order) => {
          const orderDate = new Date(o.createdAt || o.created_at || '');
          return orderDate.toDateString() === date.toDateString();
        });
        return {
          name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum: number, o: Order) => sum + (o.total || 0), 0),
        };
      });
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+12%' },
    { title: 'Total Pesanan', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-cyan-500', change: '+5%' },
    { title: 'Produk', value: stats.totalProducts.toString(), icon: Package, color: 'from-purple-500 to-violet-500', change: '0%' },
    { title: 'Tiket Baru', value: stats.newTickets.toString(), icon: AlertCircle, color: 'from-orange-500 to-red-500', change: stats.newTickets > 0 ? '!' : '' },
  ];

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>Dashboard</h1>
          <p className={subTextClass}>Selamat datang kembali, Admin!</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${bgCard} overflow-hidden`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className={`text-2xl font-bold ${textClass}`}>{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${subTextClass}`}>{stat.title}</p>
                {stat.change && stat.change !== '0%' && (
                  <span className={`text-xs ${stat.change.includes('+') ? 'text-green-500' : stat.change === '!' ? 'text-red-500' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Grafik Pesanan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className={bgCard}>
        <CardHeader>
          <CardTitle className={textClass}>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>ID</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Customer</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Total</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Status</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-3 px-4 ${textClass}`}>#{order.id.slice(0, 8)}</td>
                    <td className={`py-3 px-4 ${textClass}`}>{order.customerName}</td>
                    <td className={`py-3 px-4 ${textClass}`}>Rp {(order.total || 0).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4">
                      <Badge className={
                        order.status === 'completed' ? 'bg-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'paid' ? 'bg-blue-500' :
                        'bg-red-500'
                      }>
                        {order.status}
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 ${subTextClass}`}>
                      {new Date(order.createdAt || order.created_at || '').toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Products Content
function ProductsContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    base_price: '',
    discount_price: '',
    stock: '',
    category: '',
  });

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      base_price: '',
      discount_price: '',
      stock: '',
      category: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      base_price: product.base_price?.toString() || '',
      discount_price: product.discount_price?.toString() || '',
      stock: product.stock?.toString() || '',
      category: product.category || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        icon: '/images/products/default.svg',
        category: formData.category,
        rating: 0,
        reviews: 0,
        tiers: [{
          name: 'Standard',
          price: parseInt(formData.base_price) || 0,
          features: []
        }],
        features: [],
        base_price: parseInt(formData.base_price) || 0,
        discount_price: parseInt(formData.discount_price) || 0,
        stock: parseInt(formData.stock) || 0,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Produk berhasil diupdate');
      } else {
        await createProduct(productData);
        toast.success('Produk berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
        toast.success('Produk berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus produk');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>Kelola Produk</h1>
          <p className={subTextClass}>Kelola semua produk digital Anda</p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-10 ${bgCard}`}
        />
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={bgCard}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={product.icon || product.image || '/images/products/default.svg'} 
                  alt={product.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${textClass}`}>{product.title}</h3>
                  <p className={`text-sm truncate ${subTextClass}`}>{product.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-green-500 font-bold">
                          Rp {product.discount_price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-400 line-through text-sm">
                          Rp {product.base_price?.toLocaleString('id-ID')}
                        </span>
                      </>
                    ) : (
                      <span className="text-green-500 font-bold">
                        Rp {product.tiers[0]?.price.toLocaleString('id-ID') || 0}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{product.category}</Badge>
                    <span className={`text-xs ${subTextClass}`}>
                      Stock: {product.stock !== undefined ? product.stock : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={bgCard}>
          <DialogHeader>
            <DialogTitle className={textClass}>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className={textClass}>Nama Produk</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan nama produk"
                className={bgCard}
              />
            </div>
            <div>
              <Label className={textClass}>Deskripsi</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi"
                className={bgCard}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={textClass}>Harga</Label>
                <Input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  placeholder="Harga"
                  className={bgCard}
                />
              </div>
              <div>
                <Label className={textClass}>Harga Diskon</Label>
                <Input
                  type="number"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  placeholder="Opsional"
                  className={bgCard}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={textClass}>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="Jumlah stock"
                  className={bgCard}
                />
              </div>
              <div>
                <Label className={textClass}>Kategori</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Kategori"
                  className={bgCard}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
              {editingProduct ? 'Update Produk' : 'Simpan Produk'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Orders Content
function OrdersContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { orders, updateOrderStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const filteredOrders = orders.filter((o: Order) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Status pesanan diupdate ke ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${textClass}`}>Kelola Pesanan</h1>
        <p className={subTextClass}>Kelola semua pesanan pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${bgCard}`}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`w-full sm:w-40 ${bgCard}`}>
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className={bgCard}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>ID Pesanan</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Customer</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Total</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Status</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Tanggal</th>
                  <th className={`text-left py-3 px-4 ${subTextClass}`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: Order) => (
                  <tr key={order.id} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-3 px-4 ${textClass}`}>#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div className={textClass}>{order.customerName}</div>
                      <div className={`text-sm ${subTextClass}`}>{order.customerEmail}</div>
                    </td>
                    <td className={`py-3 px-4 ${textClass}`}>
                      Rp {(order.total || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        order.status === 'completed' ? 'bg-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'paid' ? 'bg-blue-500' :
                        order.status === 'processing' ? 'bg-purple-500' :
                        'bg-red-500'
                      }>
                        {order.status}
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 ${subTextClass}`}>
                      {new Date(order.createdAt || order.created_at || '').toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Content
function SettingsContent({ isDarkMode }: { isDarkMode: boolean }) {
  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${textClass}`}>Pengaturan</h1>
        <p className={subTextClass}>Konfigurasi aplikasi admin</p>
      </div>

      <div className="grid gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={textClass}>Nama Toko</Label>
              <Input defaultValue="Lumakara Digital Store" className={bgCard} />
            </div>
            <div>
              <Label className={textClass}>Email</Label>
              <Input defaultValue="support@lumakara.com" className={bgCard} />
            </div>
            <div>
              <Label className={textClass}>Telepon</Label>
              <Input defaultValue="+62 812-3456-7890" className={bgCard} />
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${textClass}`}>Notifikasi Email</p>
                <p className={`text-sm ${subTextClass}`}>Terima notifikasi pesanan baru via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${textClass}`}>Notifikasi WhatsApp</p>
                <p className={`text-sm ${subTextClass}`}>Terima notifikasi pesanan baru via WhatsApp</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminApp;
