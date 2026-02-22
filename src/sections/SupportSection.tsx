import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mail, Phone, Send, ChevronDown, ChevronUp, 
  Loader2, Bot, User, Sparkles,
  CheckCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupport } from '@/hooks/useSupport';
import { useAppStore } from '@/store/appStore';
import { ultraAudio } from '@/lib/audio';
import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const faqs = [
  {
    id: 1,
    question: 'Berapa lama waktu instalasi Wi-Fi?',
    answer: 'Waktu instalasi Wi-Fi biasanya memakan waktu 1-2 jam tergantung ukuran rumah dan kompleksitas jaringan. Tim kami akan memberikan estimasi waktu yang lebih akurat setelah survey lokasi.'
  },
  {
    id: 2,
    question: 'Apa yang termasuk dalam paket instalasi CCTV?',
    answer: 'Paket instalasi CCTV kami mencakup pemasangan kamera, setup DVR, konfigurasi aplikasi mobile, dan training dasar penggunaan. Garansi perangkat juga disertakan sesuai tier yang dipilih.'
  },
  {
    id: 3,
    question: 'Apakah ada garansi untuk layanan yang diberikan?',
    answer: 'Ya, semua layanan kami dilengkapi dengan garansi. Periode garansi bervariasi tergantung jenis layanan dan tier yang dipilih, mulai dari 1 tahun hingga 3 tahun.'
  },
  {
    id: 4,
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer: 'Anda dapat melacak status pesanan melalui menu Profil > Riwayat Pesanan. Status pesanan akan diupdate secara real-time dan Anda juga akan menerima notifikasi email untuk setiap perubahan status.'
  },
  {
    id: 5,
    question: 'Bisakah saya membatalkan atau mengubah pesanan?',
    answer: 'Pesanan dapat dibatalkan atau diubah selama status masih "pending". Setelah pembayaran dikonfirmasi, perubahan dapat dilakukan dengan menghubungi tim support kami.'
  },
  {
    id: 6,
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima pembayaran via QRIS (GoPay, OVO, DANA, LinkAja), Virtual Account (BNI, BRI, Permata, CIMB, Maybank), dan PayPal untuk pembayaran internasional.'
  }
];

const categories = [
  { id: 'technical', label: 'Masalah Teknis', labelEn: 'Technical Issue' },
  { id: 'billing', label: 'Pertanyaan Billing', labelEn: 'Billing Question' },
  { id: 'installation', label: 'Dukungan Instalasi', labelEn: 'Installation Support' },
  { id: 'order', label: 'Status Pesanan', labelEn: 'Order Status' },
  { id: 'other', label: 'Lainnya', labelEn: 'Other' }
];

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export function SupportSection() {
  const { submitTicket, isSubmitting } = useSupport();
  const { isDarkMode, language, profile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket' | 'faq'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      text: language === 'id' 
        ? 'Halo! Saya adalah AI Assistant Digital Store. Ada yang bisa saya bantu tentang produk atau layanan kami?' 
        : 'Hello! I am Digital Store AI Assistant. How can I help you with our products or services?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Ticket states
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    email: profile?.email || '',
    description: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const t = useMemo(() => ({
    helpCenter: language === 'id' ? 'Pusat Bantuan' : 'Help Center',
    helpDesc: language === 'id' ? 'Kami siap membantu Anda 24/7' : 'We are ready to help you 24/7',
    liveChat: language === 'id' ? 'Live Chat AI' : 'AI Live Chat',
    liveChatDesc: language === 'id' ? 'Jawaban instan 24/7' : 'Instant answers 24/7',
    email: language === 'id' ? 'Email Tiket' : 'Email Ticket',
    emailDesc: language === 'id' ? 'Respon 2-4 jam' : '2-4 hours response',
    phone: language === 'id' ? 'Telepon' : 'Phone',
    phoneDesc: language === 'id' ? '24 jam' : '24 hours',
    faq: language === 'id' ? 'Pertanyaan Umum' : 'FAQ',
    typeMessage: language === 'id' ? 'Ketik pesan Anda...' : 'Type your message...',
    send: language === 'id' ? 'Kirim' : 'Send',
    createTicket: language === 'id' ? 'Buat Tiket' : 'Create Ticket',
    subject: language === 'id' ? 'Subjek' : 'Subject',
    category: language === 'id' ? 'Kategori' : 'Category',
    description: language === 'id' ? 'Deskripsi' : 'Description',
    sending: language === 'id' ? 'Mengirim...' : 'Sending...',
    submit: language === 'id' ? 'Kirim Tiket' : 'Submit Ticket',
    ticketSuccess: language === 'id' 
      ? 'Tiket berhasil dikirim! Tim kami akan menghubungi Anda segera.' 
      : 'Ticket submitted successfully! Our team will contact you soon.',
    online: language === 'id' ? 'Online' : 'Online',
    aiPowered: language === 'id' ? 'Powered by AI' : 'Powered by AI',
  }), [language]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    ultraAudio.playSend();

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    setChatMessages(prev => [...prev, { 
      id: typingId, 
      text: '', 
      isUser: false, 
      timestamp: new Date(),
      isTyping: true 
    }]);

    try {
      if (OPENAI_API_KEY) {
        // Call OpenAI API
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful customer service assistant for Digital Store, an e-commerce platform selling digital services like WiFi installation, CCTV, code debugging, photo/video editing, and VPS hosting. Be friendly, professional, and helpful. Respond in ${language === 'id' ? 'Indonesian' : 'English'}. Keep responses concise (max 3 sentences).`
              },
              ...chatMessages.filter(m => !m.isTyping).map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.text
              })),
              { role: 'user', content: userMessage.text }
            ],
            max_tokens: 150,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const botResponse = response.data.choices[0].message.content;
        
        // Remove typing indicator and add response
        setChatMessages(prev => prev.filter(m => m.id !== typingId).concat({
          id: Date.now().toString(),
          text: botResponse,
          isUser: false,
          timestamp: new Date()
        }));
        ultraAudio.playNotification();
      } else {
        // Fallback response if no API key
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChatMessages(prev => prev.filter(m => m.id !== typingId).concat({
          id: Date.now().toString(),
          text: language === 'id'
            ? 'Maaf, saat ini layanan chat AI sedang dalam pengembangan. Silakan hubungi kami via email atau telepon untuk bantuan lebih lanjut.'
            : 'Sorry, our AI chat service is currently under development. Please contact us via email or phone for further assistance.',
          isUser: false,
          timestamp: new Date()
        }));
      }
    } catch (error) {
      // Remove typing indicator
      setChatMessages(prev => prev.filter(m => m.id !== typingId));
      
      // Error response
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: language === 'id'
          ? 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami via email.'
          : 'Sorry, an error occurred. Please try again or contact us via email.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) return;

    try {
      await submitTicket({
        subject: ticketForm.subject,
        category: ticketForm.category,
        email: ticketForm.email || 'guest@digitalstore.com',
        description: ticketForm.description
      });
      
      setTicketSubmitted(true);
      ultraAudio.playSuccess();
      
      setTimeout(() => {
        setTicketSubmitted(false);
        setTicketForm({ subject: '', category: '', email: '', description: '' });
        setActiveTab('chat');
      }, 3000);
    } catch (error) {
      ultraAudio.playError();
    }
  };

  return (
    <div className={`min-h-screen pb-24 px-4 pt-4 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : ''}`}>{t.helpCenter}</h1>
        <p className="text-gray-500">{t.helpDesc}</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => {
            setActiveTab('chat');
            ultraAudio.playClick();
          }}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 active:scale-95 ${
            activeTab === 'chat' 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-105' 
              : 'bg-blue-50 dark:bg-blue-900/20'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            activeTab === 'chat' ? 'bg-white/20' : 'bg-blue-500'
          }`}>
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className={`text-sm font-semibold ${activeTab === 'chat' ? '' : 'text-blue-700 dark:text-blue-400'}`}>
            {t.liveChat}
          </span>
          <span className={`text-xs ${activeTab === 'chat' ? 'text-blue-100' : 'text-blue-600'}`}>
            {t.liveChatDesc}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ticket');
            ultraAudio.playClick();
          }}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 active:scale-95 ${
            activeTab === 'ticket' 
              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105' 
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            activeTab === 'ticket' ? 'bg-white/20' : 'bg-orange-500'
          }`}>
            <Mail className="h-6 w-6 text-white" />
          </div>
          <span className={`text-sm font-semibold ${activeTab === 'ticket' ? '' : 'text-orange-700 dark:text-orange-400'}`}>
            {t.email}
          </span>
          <span className={`text-xs ${activeTab === 'ticket' ? 'text-orange-100' : 'text-orange-600'}`}>
            {t.emailDesc}
          </span>
        </button>

        <a
          href="tel:+6281234567890"
          className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all active:scale-95"
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{t.phone}</span>
          <span className="text-xs text-green-600">{t.phoneDesc}</span>
        </a>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* AI Chat */}
        {activeTab === 'chat' && (
          <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>{t.liveChat}</h3>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {t.online}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t.aiPowered}
                </Badge>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.isUser 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none' 
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.isTyping ? (
                        <div className="flex gap-1 items-center h-5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.isUser && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    placeholder={t.typeMessage}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    className={`flex-1 rounded-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100'}`}
                    disabled={isChatLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                  >
                    {isChatLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ticket Form */}
        {activeTab === 'ticket' && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              {ticketSubmitted ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">{t.ticketSuccess}</h3>
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full"
                    onClick={() => setActiveTab('chat')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'id' ? 'Kembali ke Chat' : 'Back to Chat'}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <Label className={isDarkMode ? 'text-white' : ''}>{t.subject}</Label>
                    <Input
                      placeholder={language === 'id' ? 'Ringkasan masalah Anda' : 'Summary of your issue'}
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                      required
                    />
                  </div>

                  <div>
                    <Label className={isDarkMode ? 'text-white' : ''}>{t.category}</Label>
                    <Select
                      value={ticketForm.category}
                      onValueChange={(value) => setTicketForm({...ticketForm, category: value})}
                    >
                      <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                        <SelectValue placeholder={language === 'id' ? 'Pilih kategori' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {language === 'id' ? cat.label : cat.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isDarkMode ? 'text-white' : ''}>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@anda.com"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                    />
                  </div>

                  <div>
                    <Label className={isDarkMode ? 'text-white' : ''}>{t.description}</Label>
                    <Textarea
                      placeholder={language === 'id' ? 'Jelaskan masalah Anda secara detail...' : 'Describe your issue in detail...'}
                      rows={4}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-xl h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t.submit}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-6">
        <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>{t.faq}</h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <Card 
              key={faq.id} 
              className={`overflow-hidden transition-all duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
              }`}
            >
              <button
                onClick={() => {
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                  ultraAudio.playClick();
                }}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className={`font-medium text-sm pr-4 ${isDarkMode ? 'text-white' : ''}`}>
                  {faq.question}
                </span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFaq === faq.id ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <div className="px-4 pb-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
