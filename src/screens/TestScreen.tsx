import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Search, FileText, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TestScreenProps {
  onBack: () => void;
}

export const TestScreen: React.FC<TestScreenProps> = ({ onBack }) => {
  const [tests] = useState([
    { id: '1', title: 'Kiểm tra Điều lệnh Đội ngũ', time: '45 phút', questions: 30, status: 'Mới' },
    { id: '2', title: 'Nhận diện các thế lực thù địch', time: '30 phút', questions: 20, status: 'Đã làm' },
    { id: '3', title: 'Kỹ thuật tác chiến điện tử cơ bản', time: '60 phút', questions: 40, status: 'Mới' },
  ]);

  const [activeTest, setActiveTest] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const mockQuestions = [
    { q: 'Động tác chào khi đội mũ quân phục được thực hiện như thế nào?', options: ['Tay phải đưa lên, ngón tay trỏ chạm vành mũ', 'Tay trái đưa lên, ngón tay trỏ chạm vành mũ', 'Cả hai tay đưa lên', 'Không cần đội mũ'] },
    { q: 'Khi đi đều, bước chân trái rơi vào nhịp nào?', options: ['Nhịp 1', 'Nhịp 2', 'Nhịp 3', 'Nhịp 4'] },
    { q: 'Khoảng cách giữa các hàng trong đội hình tiểu đội hàng dọc là bao nhiêu?', options: ['1 mét', '0.75 mét', '1.2 mét', '0.5 mét'] },
  ];

  const handleFinish = () => {
    setIsFinished(true);
    setTimeout(() => {
      setActiveTest(null);
      setIsFinished(false);
      setCurrentQuestion(0);
      setAnswers({});
    }, 3000);
  };

  if (activeTest) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="bg-army-green p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest">{activeTest.title}</h2>
            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">44:59</div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
              className="h-full bg-white"
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold opacity-70">
            <span>Câu {currentQuestion + 1} / {mockQuestions.length}</span>
            <span>Tiến độ: {Math.round(((currentQuestion + 1) / mockQuestions.length) * 100)}%</span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isFinished ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-xl font-black text-army-gray mb-2">HOÀN THÀNH BÀI THI</h2>
              <p className="text-sm text-gray-500 mb-6">Kết quả của bạn: <b>28/30</b> câu đúng (9.3 điểm)</p>
              <div className="w-full bg-gray-50 p-4 rounded-2xl text-xs text-gray-400 font-bold uppercase">Đang lưu kết quả...</div>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-army-gray leading-tight">
                {mockQuestions[currentQuestion].q}
              </h3>
              
              <div className="space-y-3">
                {mockQuestions[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQuestion]: idx })}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all border-2 ${
                      answers[currentQuestion] === idx 
                        ? 'border-army-green bg-army-green/5 text-army-green shadow-sm' 
                        : 'border-gray-100 bg-white text-army-gray'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                        answers[currentQuestion] === idx ? 'border-army-green bg-army-green text-white' : 'border-gray-200 text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isFinished && (
          <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
            <button 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="flex-1 py-4 rounded-2xl font-black text-xs text-gray-400 bg-gray-50 disabled:opacity-30"
            >
              QUAY LẠI
            </button>
            {currentQuestion === mockQuestions.length - 1 ? (
              <button 
                onClick={handleFinish}
                className="flex-[2] py-4 rounded-2xl font-black text-xs text-white bg-army-green shadow-lg"
              >
                NỘP BÀI
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="flex-[2] py-4 rounded-2xl font-black text-xs text-white bg-army-green shadow-lg"
              >
                TIẾP THEO
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-army-gray">Kiểm tra & Đánh giá</h1>
        </div>
        <button className="p-2 text-army-green bg-army-green/10 rounded-xl">
          <Plus size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm bài kiểm tra..."
            className="w-full bg-white border-none rounded-2xl pl-10 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Bài kiểm tra hiện có</h3>
          {tests.map(test => (
            <div 
              key={test.id} 
              onClick={() => setActiveTest(test)}
              className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-army-gray leading-tight">{test.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Clock size={10} />
                    <span>{test.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <FileText size={10} />
                    <span>{test.questions} câu</span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                test.status === 'Mới' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {test.status}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Section */}
        <div className="bg-army-green/5 p-6 rounded-3xl border border-army-green/10">
          <h4 className="text-xs font-black text-army-green uppercase tracking-widest mb-2">Đề xuất cho bạn</h4>
          <p className="text-xs text-army-gray/70 leading-relaxed mb-4">
            Hệ thống gợi ý bạn nên ôn tập lại phần <b>"An ninh mạng cơ bản"</b> trước khi thực hiện bài kiểm tra tuần tới.
          </p>
          <button className="w-full bg-army-green text-white text-xs font-black py-3 rounded-xl shadow-md">
            ÔN TẬP NGAY
          </button>
        </div>
      </div>
    </div>
  );
};
