import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Send, ThumbsUp, MessageCircle, 
  MoreHorizontal, ChevronDown, X, Share2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useAppStore, type Review } from '@/store/appStore';
import { useProducts } from '@/hooks/useProducts';
import { ultraAudio } from '@/lib/audio';


const filterOptions = [
  { id: 'all', label: 'Semua', labelEn: 'All' },
  { id: '5', label: '5 Bintang', labelEn: '5 Stars' },
  { id: '4', label: '4 Bintang', labelEn: '4 Stars' },
  { id: '3', label: '3 Bintang', labelEn: '3 Stars' },
  { id: '2', label: '2 Bintang', labelEn: '2 Stars' },
  { id: '1', label: '1 Bintang', labelEn: '1 Star' },
  { id: 'with_photo', label: 'Dengan Foto', labelEn: 'With Photo' },
];

const sortOptions = [
  { id: 'newest', label: 'Terbaru', labelEn: 'Newest' },
  { id: 'highest', label: 'Rating Tertinggi', labelEn: 'Highest Rated' },
  { id: 'lowest', label: 'Rating Terendah', labelEn: 'Lowest Rated' },
  { id: 'helpful', label: 'Paling Membantu', labelEn: 'Most Helpful' },
];

export function ReviewsPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById, reviews, addReview, isDarkMode, profile, language, favorites, toggleFavorite } = useAppStore();
  const { products } = useProducts();
  
  const product = productId ? getProductById(productId) : undefined;
  const productReviews = productId ? reviews.filter(r => r.productId === productId) : [];

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!product && products.length > 0) {
      navigate('/');
    }
  }, [product, products, navigate]);

  // Calculate stats
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: productReviews.filter(r => r.rating === stars).length,
    percentage: productReviews.length > 0
      ? (productReviews.filter(r => r.rating === stars).length / productReviews.length) * 100
      : 0,
  }));

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = productReviews.filter(review => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'with_photo') return false; // No photo support yet
      return review.rating === parseInt(activeFilter);
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }

    return result;
  }, [productReviews, activeFilter, sortBy]);

  const t = useMemo(() => ({
    productReviews: language === 'id' ? 'Ulasan Produk' : 'Product Reviews',
    reviews: language === 'id' ? 'ulasan' : 'reviews',
    basedOn: language === 'id' ? 'Berdasarkan' : 'Based on',
    writeReview: language === 'id' ? 'Tulis Ulasan' : 'Write Review',
    helpful: language === 'id' ? 'Membantu' : 'Helpful',
    reply: language === 'id' ? 'Balas' : 'Reply',
    share: language === 'id' ? 'Bagikan' : 'Share',
    report: language === 'id' ? 'Laporkan' : 'Report',
    allReviews: language === 'id' ? 'Semua Ulasan' : 'All Reviews',
    noReviews: language === 'id' ? 'Belum ada ulasan' : 'No reviews yet',
    beFirst: language === 'id' ? 'Jadilah yang pertama!' : 'Be the first!',
    filter: language === 'id' ? 'Filter' : 'Filter',
    sort: language === 'id' ? 'Urutkan' : 'Sort',
    quality: language === 'id' ? 'Bagaimana kualitas produk?' : 'How is the product quality?',
    experience: language === 'id' ? 'Ceritakan pengalaman Anda' : 'Share your experience',
    submit: language === 'id' ? 'Kirim Ulasan' : 'Submit Review',
    submitting: language === 'id' ? 'Mengirim...' : 'Submitting...',
    excellent: language === 'id' ? 'Sangat Bagus!' : 'Excellent!',
    good: language === 'id' ? 'Bagus' : 'Good',
    average: language === 'id' ? 'Cukup' : 'Average',
    poor: language === 'id' ? 'Kurang' : 'Poor',
    terrible: language === 'id' ? 'Sangat Kurang' : 'Terrible',
  }), [language]);

  const handleSubmitReview = async () => {
    if (newComment.trim().length < 10) {
      ultraAudio.playError();
      return;
    }

    setIsSubmitting(true);
    ultraAudio.playClick();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const review: Review = {
      id: `review-${Date.now()}`,
      productId: productId!,
      userName: profile?.name || 'Anonymous',
      userAvatar: profile?.avatar,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    addReview(review);
    ultraAudio.playSuccess();
    ultraAudio.haptic('success');
    
    setNewComment('');
    setNewRating(5);
    setShowWriteReview(false);
    setIsSubmitting(false);
  };

  const handleLike = (reviewId: string) => {
    const newLiked = new Set(likedReviews);
    if (newLiked.has(reviewId)) {
      newLiked.delete(reviewId);
    } else {
      newLiked.add(reviewId);
    }
    setLikedReviews(newLiked);
    ultraAudio.playPop();
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return t.excellent;
    if (rating === 4) return t.good;
    if (rating === 3) return t.average;
    if (rating === 2) return t.poor;
    return t.terrible;
  };

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-gray-950/90 border-gray-800' 
          : 'bg-white/90 border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              ultraAudio.playClick();
              navigate(-1);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{t.productReviews}</h1>
            <p className="text-xs text-gray-500">{productReviews.length} {t.reviews}</p>
          </div>
        </div>
      </header>

      {/* Product Summary */}
      <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex gap-4">
          <img
            src={product.icon}
            alt={product.title}
            className="w-24 h-24 rounded-2xl object-cover shadow-lg"
          />
          <div className="flex-1">
            <h2 className={`font-semibold line-clamp-1 ${isDarkMode ? 'text-white' : ''}`}>
              {product.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold text-orange-500">{averageRating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t.basedOn} {productReviews.length} {t.reviews}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`p-2 rounded-full transition-colors ${
              favorites.includes(product.id) 
                ? 'text-red-500 bg-red-50' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Rating Distribution */}
        <div className="mt-4 space-y-1.5">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() => setActiveFilter(stars.toString())}
              className="w-full flex items-center gap-3 group"
            >
              <span className="text-sm w-3 font-medium">{stars}</span>
              <Star className="w-4 h-4 text-yellow-400" />
              <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500 group-hover:bg-yellow-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </button>
          ))}
        </div>

        {/* Write Review Button */}
        <Button
          className="w-full mt-4 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold shadow-lg"
          onClick={() => {
            ultraAudio.playClick();
            setShowWriteReview(true);
          }}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          {t.writeReview}
        </Button>
      </div>

      {/* Filter & Sort */}
      <div className={`sticky top-[60px] z-30 px-4 py-3 border-b backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-gray-950/90 border-gray-800' 
          : 'bg-white/90 border-gray-100'
      }`}>
        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className={`appearance-none px-4 py-2 pr-8 rounded-full text-sm font-medium border-2 transition-colors ${
                activeFilter !== 'all'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : isDarkMode 
                    ? 'border-gray-700 bg-gray-800 text-white'
                    : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {filterOptions.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {language === 'id' ? filter.label : filter.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`appearance-none px-4 py-2 pr-8 rounded-full text-sm font-medium border-2 transition-colors ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800 text-white'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {sortOptions.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {language === 'id' ? sort.label : sort.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-4 space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.noReviews}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {t.beFirst}
            </p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              isDarkMode={isDarkMode}
              language={language}
              onLike={() => handleLike(review.id)}
              isLiked={likedReviews.has(review.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowWriteReview(false)}
          />
          <div className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-auto animate-slide-up ${
            isDarkMode ? 'bg-gray-950' : 'bg-white'
          }`}>
            {/* Handle bar for mobile */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
                {t.writeReview}
              </h3>
              <button
                onClick={() => setShowWriteReview(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t.quality}
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setNewRating(star);
                      ultraAudio.playClick();
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className={`w-12 h-12 transition-all duration-300 ${
                        star <= (hoverRating || newRating)
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-orange-500 mt-2">
                {getRatingLabel(hoverRating || newRating)}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t.experience}
              </p>
              <Textarea
                placeholder={language === 'id' ? 'Bagikan pengalaman Anda menggunakan produk ini...' : 'Share your experience with this product...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={`min-h-[120px] rounded-xl text-base ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {newComment.length} / 500
              </p>
            </div>

            {/* Submit */}
            <Button
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-lg shadow-lg"
              onClick={handleSubmitReview}
              disabled={newComment.trim().length < 10 || isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t.submit}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Review Card Component
function ReviewCard({ 
  review, 
  isDarkMode,
  language,
  onLike,
  isLiked,
  style
}: { 
  review: Review; 
  isDarkMode: boolean;
  language: string;
  onLike: () => void;
  isLiked: boolean;
  style?: React.CSSProperties;
}) {
  const [showMore, setShowMore] = useState(false);
  const isLongText = review.comment.length > 150;

  return (
    <div 
      className={`p-4 rounded-2xl animate-fade-in ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}
      style={style}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          {review.userAvatar ? (
            <img src={review.userAvatar} alt={review.userName} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
              {review.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : ''}`}>
              {review.userName}
            </h4>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {showMore ? review.comment : isLongText ? review.comment.slice(0, 150) + '...' : review.comment}
      </p>
      {isLongText && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-orange-500 text-xs font-medium mt-1"
        >
          {showMore ? (language === 'id' ? 'Sembunyikan' : 'Show less') : (language === 'id' ? 'Selengkapnya' : 'Read more')}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{language === 'id' ? 'Membantu' : 'Helpful'} ({(review.likes || 0) + (isLiked ? 1 : 0)})</span>
        </button>
        <button className="text-sm text-gray-500">
          {language === 'id' ? 'Balas' : 'Reply'}
        </button>
        <button className="text-sm text-gray-500 ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
