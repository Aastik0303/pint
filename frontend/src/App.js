import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  Leaf, ShoppingBag, Menu, X, Phone, Mail, MapPin, Instagram, Facebook, Twitter,
  Plus, Edit, Trash2, LogOut, Eye, Upload, Search, ChevronRight, Heart, Sparkles,
  Shield, Award, Star
} from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// API helper
const api = axios.create({
  baseURL: API_URL,
});

// Auth context
const AuthContext = React.createContext();

const useAuth = () => React.useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      await api.get('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(true);
    } catch {
      logout();
    }
  };

  const login = async (password) => {
    const formData = new FormData();
    formData.append('password', password);
    const response = await api.post('/api/admin/login', formData);
    const newToken = response.data.access_token;
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setIsAdmin(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl md:text-2xl font-semibold text-gray-900">GlowCare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              data-testid="nav-admin"
              className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            data-testid="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium ${
                      location.pathname === link.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block mx-4 mt-4 bg-primary-500 text-white px-6 py-3 rounded-full text-center font-medium"
                >
                  Admin Panel
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-semibold">GlowCare</span>
          </div>
          <p className="text-gray-400 max-w-md mb-6">
            Discover the perfect blend of nature and science. Our curated collection of beauty and healthcare products brings you closer to your natural glow.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-primary-400 transition-colors">Products</Link></li>
            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-500" />
              <span>7417845421</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-500" />
              <span>aastikmishra20@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} GlowCare. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Product Card Component
const ProductCard = ({ product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    data-testid={`product-card-${product.id}`}
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img
        src={product.product_image.startsWith('http') ? product.product_image : `${API_URL}${product.product_image}`}
        alt={product.product_name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1704662451911-198af41df592?w=400';
        }}
      />
      <div className="absolute top-3 left-3">
        <span className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">
          {product.category}
        </span>
      </div>
      <button 
        className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-50"
        aria-label="Add to favorites"
      >
        <Heart className="w-4 h-4 text-gray-600 hover:text-primary-500" />
      </button>
    </div>
    <div className="p-5">
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
        {product.product_name}
      </h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-primary-600">
          ₹{product.price.toLocaleString()}
        </span>
        <button 
          className="bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
          data-testid={`view-product-${product.id}`}
        >
          View Details
        </button>
      </div>
    </div>
  </motion.div>
);

// Home Page
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Skincare', 'Haircare', 'Makeup', 'Healthcare']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products', {
        params: { category: selectedCategory === 'All' ? '' : selectedCategory }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-50 via-white to-secondary-100/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-100/50 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Natural Beauty Essentials
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Reveal Your
              <span className="block text-primary-600">Natural Glow</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Scientifically formulated, naturally derived. Discover our curated collection of beauty and healthcare products designed to bring out your inner radiance.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                data-testid="explore-products-btn"
                className="bg-primary-500 text-white px-8 py-4 rounded-full font-medium hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                Explore Products
                <ChevronRight className="w-5 h-5" />
              </a>
              <Link
                to="/about"
                className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-full font-medium hover:bg-primary-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1679584352584-f07655bbadea?w=800"
                alt="Woman with natural beauty"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">100% Natural</p>
                  <p className="text-sm text-gray-500">Certified Ingredients</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: 'Natural Ingredients', desc: 'Carefully sourced botanical extracts' },
              { icon: Shield, title: 'Dermatologist Tested', desc: 'Safe for all skin types' },
              { icon: Award, title: 'Premium Quality', desc: 'Highest standards guaranteed' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated collection of beauty and healthcare essentials
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                data-testid={`category-${cat.toLowerCase()}`}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-400">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// About Page
const AboutPage = () => (
  <div className="min-h-screen pt-20">
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-primary-600 font-medium mb-4 block">About Us</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nurturing Beauty,<br />Naturally
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              At GlowCare, we believe that true beauty comes from within and is enhanced by the gifts of nature. Our journey began with a simple mission: to provide women with access to high-quality beauty and healthcare products that are both effective and gentle.
            </p>
            <p className="text-gray-600 mb-8">
              Every product in our collection is carefully curated, ensuring it meets our strict standards for quality, safety, and sustainability. We work directly with trusted suppliers who share our commitment to natural ingredients and ethical practices.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="font-serif text-3xl font-bold text-primary-600">500+</div>
                <div className="text-gray-500 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-primary-600">100%</div>
                <div className="text-gray-500 text-sm">Natural Products</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-primary-600">50+</div>
                <div className="text-gray-500 text-sm">Premium Products</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1649259088533-8a80c706fd3f?w=800"
                alt="Natural ingredients"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="font-serif text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Leaf, title: 'Natural First', desc: 'We prioritize natural, plant-based ingredients that work in harmony with your body.' },
            { icon: Shield, title: 'Safety Assured', desc: 'Every product undergoes rigorous testing to ensure it meets the highest safety standards.' },
            { icon: Heart, title: 'Customer Care', desc: "Your satisfaction and well-being are at the heart of everything we do." },
          ].map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// Contact Page
const ContactPage = () => (
  <div className="min-h-screen pt-20">
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-primary-600 font-medium mb-4 block">Contact Us</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600">
            Have questions about our products or need assistance? We're here to help!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <a href="tel:7417845421" className="text-primary-600 hover:underline text-lg" data-testid="contact-phone">
              7417845421
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <a href="mailto:aastikmishra20@gmail.com" className="text-primary-600 hover:underline" data-testid="contact-email">
              aastikmishra20@gmail.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600">India</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mt-16 bg-primary-600 rounded-3xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Beauty Journey?
          </h2>
          <p className="text-primary-100 mb-6">
            Browse our collection and discover products that bring out your natural glow.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full font-medium hover:bg-primary-50 transition-colors"
          >
            Explore Products
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

// Admin Login Page
const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative">
        <img
          src="https://images.unsplash.com/photo-1649259088533-8a80c706fd3f?w=800"
          alt="Natural beauty"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="font-serif text-2xl font-semibold">GlowCare</span>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">Admin Portal</h1>
          <p className="text-primary-100 text-lg">
            Manage your products, track inventory, and keep your store running smoothly.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-semibold text-gray-900">GlowCare</span>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-500 mb-8">Enter your password to access the dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  data-testid="admin-password-input"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="admin-login-btn"
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link to="/" className="text-primary-600 hover:underline text-sm">
                &larr; Back to Store
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    } else {
      fetchProducts();
    }
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    fetchProducts();
    handleFormClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">GlowCare Admin</h1>
                <p className="text-xs text-gray-500">Product Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View Store</span>
              </Link>
              <button
                onClick={handleLogout}
                data-testid="admin-logout-btn"
                className="text-gray-600 hover:text-red-600 flex items-center gap-1 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(products.map(p => p.category))].length}
                </p>
                <p className="text-sm text-gray-500">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Active</p>
                <p className="text-sm text-gray-500">Store Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <p className="text-sm text-gray-500">Manage your product inventory</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              data-testid="add-product-btn"
              className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6">Start by adding your first product</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-all"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50" data-testid={`product-row-${product.id}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={product.product_image.startsWith('http') ? product.product_image : `${API_URL}${product.product_image}`}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1704662451911-198af41df592?w=100';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.product_name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-medium text-gray-900">₹{product.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            data-testid={`edit-product-${product.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            data-testid={`delete-product-${product.id}`}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            product={editingProduct}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            token={token}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Form Modal
const ProductFormModal = ({ product, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'Skincare',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(product?.product_image || '');
  const [loading, setLoading] = useState(false);

  const categories = ['Skincare', 'Haircare', 'Makeup', 'Healthcare'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('product_name', formData.product_name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    
    if (image) {
      data.append('product_image', image);
    } else if (!product) {
      toast.error('Please select an image');
      setLoading(false);
      return;
    }

    try {
      if (product) {
        await api.put(`/api/admin/products/${product.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/api/admin/products', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image {!product && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview.startsWith('blob') || preview.startsWith('http') ? preview : `${API_URL}${preview}`}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview('');
                    }}
                    className="absolute top-0 right-1/2 translate-x-16 -translate-y-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    data-testid="product-image-input"
                  />
                </label>
              )}
              {!preview && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  data-testid="product-image-input"
                />
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g., Vitamin C Serum"
              required
              data-testid="product-name-input"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product..."
              required
              rows={3}
              data-testid="product-description-input"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="999"
                required
                min="0"
                step="0.01"
                data-testid="product-price-input"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                data-testid="product-category-select"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              data-testid="save-product-btn"
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  return isAdmin ? children : null;
};

// Main App
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HomePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <AboutPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <ContactPage />
                <Footer />
              </>
            }
          />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
