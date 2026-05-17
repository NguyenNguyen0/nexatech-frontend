'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  CreditCard, 
  RefreshCcw, 
  User, 
  ChevronRight, 
  MessageSquare, 
  Mail, 
  Phone,
  ChevronDown,
  HelpCircle,
  Truck,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const helpCategories = [
  {
    icon: <Package className="h-6 w-6 text-primary" />,
    title: 'Đơn hàng & Giao hàng',
    description: 'Theo dõi đơn hàng, thời gian vận chuyển và phí giao hàng.',
    href: '/policy/shipping'
  },
  {
    icon: <RefreshCcw className="h-6 w-6 text-primary" />,
    title: 'Trả hàng & Hoàn tiền',
    description: 'Quy trình đổi trả sản phẩm và chính sách hoàn tiền.',
    href: '/policy/returns'
  },
  {
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    title: 'Thanh toán',
    description: 'Các phương thức thanh toán và xử lý lỗi giao dịch.',
    href: '/help/faq'
  },
  {
    icon: <User className="h-6 w-6 text-primary" />,
    title: 'Tài khoản & Bảo mật',
    description: 'Quản lý thông tin cá nhân và bảo mật tài khoản.',
    href: '/help/faq'
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: 'Chính sách bảo hành',
    description: 'Thông tin bảo hành chính hãng và hỗ trợ kỹ thuật.',
    href: '/policy/warranty'
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: 'Khuyến mãi & Voucher',
    description: 'Cách sử dụng mã giảm giá và chương trình khách hàng thân thiết.',
    href: '/help/faq'
  }
];

const faqs = [
  {
    question: 'Làm thế nào để tôi theo dõi đơn hàng của mình?',
    answer: 'Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản, chọn "Đơn hàng của tôi" và nhấn vào "Theo dõi" bên cạnh đơn hàng tương ứng. Một email xác nhận kèm mã vận đơn cũng đã được gửi cho bạn khi hàng được xuất kho.'
  },
  {
    question: 'NexaTech có giao hàng hỏa tốc không?',
    answer: 'Có, chúng tôi cung cấp dịch vụ NexaExpress giao hàng trong vòng 2 giờ đối với các khu vực nội thành Hà Nội và TP. Hồ Chí Minh cho các sản phẩm có biểu tượng hỏa tốc.'
  },
  {
    question: 'Tôi có thể đổi trả hàng trong bao lâu?',
    answer: 'NexaTech áp dụng chính sách đổi trả trong vòng 15 ngày kể từ ngày nhận hàng đối với các lỗi từ nhà sản xuất hoặc sản phẩm không đúng mô tả. Sản phẩm cần còn nguyên tem mác và hộp.'
  },
  {
    question: 'Làm sao để liên hệ bảo hành sản phẩm?',
    answer: 'Tất cả sản phẩm công nghệ tại NexaTech đều được bảo hành điện tử. Bạn chỉ cần mang sản phẩm kèm số điện thoại mua hàng đến bất kỳ trung tâm bảo hành ủy quyền nào hoặc liên hệ hotline 1900-XXXX để được hỗ trợ lấy hàng tại nhà.'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 px-4 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Trung tâm hỗ trợ NexaTech
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm kiếm câu hỏi hoặc chọn danh mục bên dưới.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-primary transition-colors z-20">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Nhập vấn đề bạn cần giúp đỡ (ví dụ: đổi trả hàng, theo dõi đơn hàng...)"
              className="h-14 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg rounded-2xl backdrop-blur-md focus:bg-white focus:text-gray-900 focus:ring-4 focus:ring-white/20 transition-all border-none shadow-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((cat, idx) => (
            <Link href={cat.href} key={idx}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-none rounded-2xl overflow-hidden active:scale-[0.98] h-full">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {cat.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                      {cat.title}
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              Câu hỏi thường gặp
            </div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Những vấn đề khách hàng thường quan tâm
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Chúng tôi đã tổng hợp những câu hỏi phổ biến nhất để giúp bạn tìm thấy câu trả lời nhanh chóng.
            </p>
            <Link href="/help/faq">
              <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white h-12 px-8 font-semibold">
                Xem tất cả FAQ
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  openFaq === idx ? 'border-primary bg-white shadow-md' : 'border-gray-200 bg-white/50 hover:bg-white'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <div 
                  className={`px-6 transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'pb-6 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600 text-sm leading-relaxed border-t pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <section className="mt-20 p-8 md:p-12 rounded-[2rem] bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Vẫn chưa tìm được câu trả lời?</h2>
              <p className="text-gray-400">
                Đừng lo lắng, đội ngũ chăm sóc khách hàng của NexaTech luôn sẵn sàng 24/7 để hỗ trợ bạn qua nhiều kênh liên lạc khác nhau.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Hotline</p>
                    <p className="font-semibold">1900 1234 (Miễn phí)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="font-semibold">support@nexatech.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h4 className="font-bold">Chat trực tuyến</h4>
                  <p className="text-xs text-gray-400">Phản hồi trung bình: 30 giây</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Trao đổi trực tiếp với nhân viên tư vấn để được giải quyết vấn đề ngay lập tức.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold">
                Bắt đầu trò chuyện
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
