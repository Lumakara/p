# My App - E-Commerce Platform

A modern, feature-rich e-commerce platform built with React 19, TypeScript, and Tailwind CSS. Designed for seamless shopping experience with payment integration, support system, and real-time notifications.

## 🎯 Features

- **Product Catalog**: Browse products with categories, ratings, and reviews
- **Shopping Cart**: Add/remove items, manage quantities with tier selection
- **Payment Integration**: 
  - Pakasir payment gateway (QRIS, Bank Transfer, E-Wallets)
  - Multiple payment methods (OVO, GoPay, Dana, LinkAja, etc.)
  - Real-time payment status updates
- **User Support**: 
  - Support ticket system with categorization
  - Email notifications via EmailJS
  - Telegram notifications for admin
- **User Reviews**: Rate and review products with user avatars
- **Dark Mode**: Full dark/light theme support with multiple color schemes
- **Multi-language**: Indonesian and English support
- **Background Music**: Optional audio effects and background music
- **Responsive Design**: Mobile-first design with bottom navigation
- **Admin Panel**: Separate admin interface for management

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **React Router v7** - Navigation
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component library
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend & Services
- **Supabase** - Backend as a Service (PostgreSQL database)
- **Firebase** - Authentication & real-time updates
- **EmailJS** - Email notifications
- **Telegram Bot API** - Admin notifications
- **Pakasir** - Payment gateway integration
- **Axios** - HTTP client

### UI Components & Libraries
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Date-fns** - Date utilities
- **Recharts** - Charts and visualizations
- **Embla Carousel** - Carousel component
- **Next Themes** - Theme management

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   - `VITE_OPENAI_API_KEY` - OpenAI API key (optional)
   - `VITE_PAKASIR_SLUG` & `VITE_PAKASIR_API_KEY` - Pakasir payment gateway
   - `VITE_TELEGRAM_BOT_TOKEN` & `VITE_TELEGRAM_CHAT_ID` - Telegram notifications
   - `VITE_EMAILJS_*` - EmailJS configuration
   - `VITE_GA_TRACKING_ID` - Google Analytics (optional)

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI component wrappers
│   ├── Header.tsx      # Top navigation
│   ├── BottomNav.tsx   # Mobile bottom navigation
│   ├── Sidebar.tsx     # Side menu
│   ├── ProductReviews.tsx
│   ├── PromoModal.tsx  # Promotional banners
│   └── WelcomeScreen.tsx
├── sections/           # Feature sections
│   ├── HomeSection.tsx
│   ├── CartSection.tsx
│   ├── CheckoutSection.tsx
│   ├── SupportSection.tsx
│   └── ProfileSection.tsx
├── pages/              # Full pages
│   └── ReviewsPage.tsx
├── hooks/              # Custom React hooks
│   ├── useCart.ts
│   ├── usePayment.ts
│   ├── useProducts.ts
│   ├── useSupport.ts
│   └── use-mobile.ts
├── lib/                # Utility functions
│   ├── supabase.ts    # Supabase client
│   ├── database.ts    # Database queries
│   ├── pakasir.ts     # Payment gateway integration
│   ├── emailjs.ts     # Email service
│   ├── telegram.ts    # Telegram notifications
│   ├── audio.ts       # Audio effects
│   └── utils.ts       # Helper functions
├── store/              # Zustand state management
│   └── appStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── AdminApp.tsx        # Admin interface
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🔑 Key Components

### App Store (Zustand)
Global state management for:
- Products catalog
- Shopping cart
- User profile
- Theme & language settings
- Notifications
- Loading states

### Product Management
- Product listing with filters
- Tier-based pricing system
- Stock management
- Review system
- Rating aggregation

### Payment Flow
1. Add products to cart
2. Select tier and quantity
3. Proceed to checkout
4. Choose payment method (Pakasir integration)
5. Complete payment
6. Get payment confirmation & order details

### Support System
- Create support tickets by category
- Track ticket status
- Receive email confirmations
- Admin notifications via Telegram

## 🎨 Themes & Customization

### Available Themes
- **Default** - Orange & Red
- **Ocean** - Sky Blue & Cyan
- **Sunset** - Orange & Pink
- **Forest** - Green & Yellow

### Dark Mode
Full dark mode support with smooth transitions:
- `isDarkMode` toggle in app store
- CSS class-based theming
- Automatic system preference detection (via Next Themes)

### Language Support
- Indonesian (ID)
- English (EN)

## 🔐 Environment Variables

```env
# OpenAI (for AI features)
VITE_OPENAI_API_KEY=your_key_here

# Pakasir Payment Gateway
VITE_PAKASIR_SLUG=your-project-slug
VITE_PAKASIR_API_KEY=your_api_key

# Telegram (Admin notifications)
VITE_TELEGRAM_BOT_TOKEN=your_token
VITE_TELEGRAM_CHAT_ID=your_chat_id

# EmailJS (Email notifications)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Google Analytics
VITE_GA_TRACKING_ID=your_tracking_id
```

**Note:** All `VITE_` prefixed variables are exposed to the client. Do NOT store sensitive backend secrets here.

## 🔄 API Integration

### Supabase
- User authentication
- Product data storage
- Order management
- Review system
- Support tickets

### Pakasir Payment Gateway
Supported payment methods:
- QRIS
- Bank Virtual Accounts (BNI, BRI, BCA, Mandiri, etc.)
- E-Wallets (OVO, GoPay, Dana, LinkAja, ShopeePay)
- PayPal

### EmailJS
- Welcome emails
- Order confirmations
- Support ticket responses
- Payment receipts

### Telegram Bot
- Admin notifications for new orders
- Payment confirmations
- Support ticket alerts

## 📱 Mobile Experience

- **Bottom Navigation**: Quick access to main sections on mobile
- **Responsive Layout**: Adapts to all screen sizes
- **Touch Optimized**: Large tap targets and swipe gestures
- **Mobile-First CSS**: Tailored for mobile-first approach

## 🎵 Audio System

Optional background music and sound effects:
- Click feedback
- Background ambient music
- Mute/unmute toggle in settings
- Audio context initialization

## 📦 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment Options
- **Vercel** (Recommended for Vite)
- **Netlify**
- **AWS Amplify**
- **GitHub Pages** (with adjustments)

**Build Output:** `dist/` folder contains optimized production build

## 🧪 Code Quality

### Linting
```bash
npm run lint
```

Uses ESLint with:
- React Refresh plugin
- React Hooks rules
- TypeScript support

### Type Checking
```bash
npx tsc --noEmit
```

Full TypeScript type safety with strict mode enabled.

## 📝 Key Features Explained

### Shopping Cart
- Add/remove products
- Select product tier
- Adjust quantities
- Persistent storage with Zustand
- Real-time price calculation

### Checkout Process
- Review items before payment
- Apply discount codes
- Select shipping method
- Choose payment gateway
- Secure payment processing

### Support Tickets
- Create support requests
- Categorize issues (Technical, Billing, etc.)
- Track ticket status
- Receive email notifications
- Admin Telegram notifications

### Product Reviews
- Rate products (1-5 stars)
- Write detailed reviews
- View user avatars
- See aggregated ratings
- Sorted by newest/most helpful

## 🛡️ Security Best Practices

1. **Environment Variables**: Sensitive data in `.env` (not committed)
2. **Supabase RLS**: Row-level security policies enabled
3. **Form Validation**: Zod schema validation
4. **XSS Protection**: React's built-in XSS protection
5. **HTTPS**: All external APIs use HTTPS
6. **CORS**: Configured for authorized domains

## 📚 Documentation

- **Type Definitions**: See `src/types/index.ts` for all interfaces
- **Component Props**: JSDoc comments on reusable components
- **API Hooks**: Custom hooks in `src/hooks/`
- **Utilities**: Helper functions in `src/lib/`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Payment Gateway Issues
- Verify Pakasir credentials in `.env`
- Check API key permissions
- Ensure callback URLs are configured in Pakasir dashboard

### Email Not Sending
- Verify EmailJS credentials
- Check email templates exist
- Test with EmailJS dashboard first

### Supabase Connection Issues
- Check internet connection
- Verify Supabase URL and API key
- Check database permissions

## 📄 License

Private project - All rights reserved.

## 👥 Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce
4. Attach screenshots if applicable

## 🚀 Future Roadmap

- [ ] Advanced product filtering
- [ ] Wishlist functionality
- [ ] Order history & tracking
- [ ] Customer dashboard
- [ ] Admin analytics
- [ ] Inventory management
- [ ] Multiple seller support
- [ ] API documentation

---

**Built with ❤️ for seamless e-commerce experiences**
