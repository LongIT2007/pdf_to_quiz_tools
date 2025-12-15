import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "Làm thế nào để chuyển PDF thành quiz?",
    answer: "Bạn chỉ cần upload file PDF lên website, chọn loại câu hỏi bạn muốn tạo (trắc nghiệm, tự luận, v.v.), và AI sẽ tự động phân tích PDF và tạo quiz cho bạn trong vài giây."
  },
  {
    question: "Có mất phí không?",
    answer: "Hoàn toàn miễn phí! Bạn có thể sử dụng tất cả các tính năng mà không cần trả phí."
  },
  {
    question: "Hỗ trợ những loại file nào?",
    answer: "Hiện tại chúng tôi hỗ trợ file PDF. Trong tương lai sẽ hỗ trợ thêm Word, PowerPoint và các định dạng khác."
  },
  {
    question: "Có thể tạo bao nhiêu loại câu hỏi?",
    answer: "Bạn có thể tạo nhiều loại câu hỏi khác nhau: trắc nghiệm (multiple choice), tự luận (essay), điền vào chỗ trống, và nhiều loại khác."
  },
  {
    question: "Kích thước file tối đa là bao nhiêu?",
    answer: "Kích thước file tối đa là 100MB. Nếu file của bạn lớn hơn, vui lòng chia nhỏ file hoặc nén file trước khi upload."
  },
  {
    question: "Quiz được lưu ở đâu?",
    answer: "Tất cả quiz của bạn được lưu trên cloud và bạn có thể truy cập bất cứ lúc nào từ bất kỳ thiết bị nào."
  },
  {
    question: "Có thể chỉnh sửa quiz sau khi tạo không?",
    answer: "Có! Bạn có thể chỉnh sửa quiz, thêm hoặc xóa câu hỏi, sửa đáp án bất cứ lúc nào."
  },
  {
    question: "Có thể chia sẻ quiz với người khác không?",
    answer: "Có, bạn có thể chia sẻ link quiz với bất kỳ ai. Họ có thể làm quiz mà không cần đăng nhập."
  }
];

export function FAQ() {
  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-muted/50">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Câu Hỏi Thường Gặp</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Tìm câu trả lời cho các câu hỏi phổ biến về PDF to Quiz Tools
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-sm sm:text-base px-2 sm:px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground px-2 sm:px-4 pb-3 sm:pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

