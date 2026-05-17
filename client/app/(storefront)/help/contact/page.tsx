'use client';

import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <section className="bg-primary pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Liên hệ với NexaTech</h1>
          <p className="text-white/70 text-lg">Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl space-y-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hotline</p>
                    <p className="font-bold text-gray-900">1900 1234 (Free)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="font-bold text-gray-900">support@nexatech.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trụ sở</p>
                    <p className="font-bold text-gray-900">Lô E2a-7, Đường D1, TP. Thủ Đức, TP. HCM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Giờ làm việc</p>
                    <p className="font-bold text-gray-900">08:00 - 21:00 (Tất cả các ngày)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Gửi lời nhắn cho chúng tôi</h2>
                <p className="text-gray-500">Chúng tôi sẽ phản hồi lại bạn trong vòng 24 giờ làm việc.</p>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                  <Input placeholder="Nguyễn Văn A" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <Input type="email" placeholder="example@gmail.com" className="h-12 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Chủ đề</label>
                  <Input placeholder="Vấn đề bạn cần hỗ trợ" className="h-12 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nội dung</label>
                  <textarea
                    className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="Nhập nội dung chi tiết tại đây..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full h-14 rounded-xl text-lg font-bold gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Gửi yêu cầu ngay
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
