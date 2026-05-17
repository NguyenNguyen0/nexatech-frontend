'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqCategories = [
  { id: 'general', name: 'Chung' },
  { id: 'orders', name: 'Đơn hàng' },
  { id: 'shipping', name: 'Giao hàng' },
  { id: 'returns', name: 'Đổi trả' },
  { id: 'account', name: 'Tài khoản' },
];

const allFaqs = [
  {
    category: 'general',
    question: 'Nexatech là gì?',
    answer: 'Nexatech là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm công nghệ cao cấp, từ Laptop, Gaming PC đến phụ kiện hi-end.'
  },
  {
    category: 'orders',
    question: 'Làm sao để tôi hủy đơn hàng?',
    answer: 'Bạn có thể hủy đơn hàng trong vòng 30 phút kể từ khi đặt hàng bằng cách vào mục "Đơn hàng của tôi". Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.'
  },
  {
    category: 'shipping',
    question: 'Phí vận chuyển được tính như thế nào?',
    answer: 'NexaTech miễn phí vận chuyển cho đơn hàng từ 1.000.000đ. Với các đơn hàng dưới mức này, phí vận chuyển đồng giá 30.000đ toàn quốc.'
  },
  {
    category: 'returns',
    question: 'Tôi có được kiểm tra hàng trước khi thanh toán không?',
    answer: 'Có, NexaTech khuyến khích khách hàng đồng kiểm cùng nhân viên giao hàng để đảm bảo quyền lợi tốt nhất.'
  },
  {
    category: 'account',
    question: 'Làm thế nào để đổi mật khẩu?',
    answer: 'Bạn vào phần "Hồ sơ cá nhân", chọn "Đổi mật khẩu" và làm theo hướng dẫn.'
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      {/* Header section */}
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Giải đáp thắc mắc (FAQ)</h1>
          <p className="text-white/70 text-lg">Tìm kiếm câu trả lời nhanh nhất cho các câu hỏi thường gặp</p>
          
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Nhập từ khóa tìm kiếm..." 
              className="h-14 pl-12 pr-4 rounded-2xl border-none shadow-xl text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content section */}
      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          {/* Categories Filter */}
          <div className="flex items-center gap-2 p-6 border-b overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {faqCategories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="p-8 space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all ${
                    openFaq === idx ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'
                  }`}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-bold text-gray-900">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <HelpCircle className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy câu hỏi nào phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Support */}
        <div className="mt-12 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Vẫn còn thắc mắc?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/help">
              <Button className="rounded-full h-12 px-8 gap-2">
                <MessageSquare className="h-5 w-5" />
                Liên hệ hỗ trợ 24/7
              </Button>
            </Link>
            <Link href="/help/contact">
              <Button variant="outline" className="rounded-full h-12 px-8 gap-2">
                Gửi yêu cầu hỗ trợ
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
