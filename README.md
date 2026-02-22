# 🛍️ Digital Store - E-Commerce Web Application

A modern, ultra-responsive e-commerce web application built with React, TypeScript, and Tailwind CSS. Features AI-powered customer support, multiple payment methods, and iOS-style animations.

![Digital Store Banner](public/images/banners/hero-1.jpg)

## ✨ Features

### 🎨 User Experience
- **Welcome Screen** - iOS-style loading animation with logo and progress bar
- **Promo Modal** - 3-slide promotional carousel after loading
- **Ultra Animations** - Smooth iOS-style transitions and effects
- **Dark Mode** - Full dark mode support
- **Multi-language** - English & Indonesia (Bilingual)
- **Theme Colors** - 4 theme options (Default, Ocean, Sunset, Forest)

### 🛒 Shopping Features
- **Product Catalog** - Browse products by category
- **Product Details** - Tiered pricing, reviews, specifications
- **Shopping Cart** - Select items, quantity control, favorites
- **Checkout** - Multiple payment methods
- **Order History** - Track your orders

### 💳 Payment Integration (Pakasir)
- **QRIS** - Scan with GoPay, OVO, DANA, LinkAja
- **Virtual Account** - BNI, BRI, Permata, CIMB Niaga, Maybank
- **PayPal** - International payments
- **Payment Status** - Real-time tracking

### 🤖 AI Customer Support
- **AI Chatbot** - 24/7 instant responses using OpenAI GPT
- **Ticket System** - Submit support tickets
- **FAQ Section** - Common questions & answers
- **Telegram Notifications** - Get notified on new tickets/orders

### 🔊 Audio Experience
- **Sound Effects** - 20+ iOS-style sounds (click, success, error, etc.)
- **Background Music** - Ambient music while browsing
- **Haptic Feedback** - Vibration on mobile interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd digital-store
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to `http://localhost:3000`

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (for AI Chatbot)
VITE_OPENAI_API_KEY=sk-your-key

# Pakasir Payment Gateway
VITE_PAKASIR_SLUG=your-store
VITE_PAKASIR_API_KEY=your-api-key

# Telegram Bot (for notifications)
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_CHAT_ID=your-chat-id
```

### Setting Up Services

#### 1. Supabase (Database)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy Project URL and Anon Key to `.env`
4. Run SQL migrations (see `/supabase/migrations`)

#### 2. OpenAI (AI Chatbot)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to `.env` file

#### 3. Pakasir (Payment Gateway)
1. Go to [pakasir.com](https://pakasir.com)
2. Register and create a project
3. Copy Project Slug and API Key
4. Add to `.env` file
5. Configure webhook URL in Pakasir dashboard

#### 4. Telegram Bot (Notifications)
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create new bot and get token
3. Message [@userinfobot](https://t.me/userinfobot) to get your Chat ID
4. Add to `.env` file

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | 2 columns products, bottom nav |
| Tablet (640-1024px) | 3 columns products |
| Desktop (>1024px) | 4 columns products |

## 🎨 Customization

### Adding Products
Edit `src/hooks/useProducts.ts` to modify product data:

```typescript
const mockProducts: Product[] = [
  {
    id: 'your-product',
    title: 'Product Name',
    category: 'installation', // installation | creative | technical
    base_price: 100000,
    discount_price: 89000,
    // ... more fields
  }
];
```

### Changing Theme Colors
Edit `src/sections/ProfileSection.tsx`:

```typescript
const themeOptions = [
  { id: 'default', gradient: 'from-orange-500 to-red-500' },
  { id: 'ocean', gradient: 'from-blue-500 to-cyan-500' },
  // Add your theme
];
```

### Adding Sound Effects
Edit `src/lib/audio.ts`:

```typescript
private readonly SOUND_URLS = {
  yourSound: 'https://assets.mixkit.co/...',
};
```

## 📂 Project Structure

```
src/
├── components/          # UI Components
│   ├── ui/             # shadcn/ui components
│   ├── BottomNav.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── WelcomeScreen.tsx
│   └── PromoModal.tsx
├── sections/           # Page sections
│   ├── HomeSection.tsx
│   ├── CartSection.tsx
│   ├── CheckoutSection.tsx
│   ├── SupportSection.tsx
│   └── ProfileSection.tsx
├── pages/              # Standalone pages
│   └── ReviewsPage.tsx
├── hooks/              # Custom React hooks
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── usePayment.ts
│   └── useSupport.ts
├── lib/                # Utilities & integrations
│   ├── supabase.ts
│   ├── pakasir.ts
│   ├── telegram.ts
│   ├── emailjs.ts
│   └── audio.ts
├── store/              # Zustand state management
│   └── appStore.ts
└── App.tsx            # Main app component
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong API keys and rotate regularly
- Enable Row Level Security (RLS) in Supabase
- Validate all user inputs
- Use HTTPS in production

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- UI Components: [shadcn/ui](https://ui.shadcn.com)
- Icons: [Lucide](https://lucide.dev)
- Animations: [Tailwind CSS](https://tailwindcss.com)
- Sound Effects: [Mixkit](https://mixkit.co)
- Payment Gateway: [Pakasir](https://pakasir.com)

---

Made with ❤️ in Indonesia
