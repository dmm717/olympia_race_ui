"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Round1View() {
  const { socket, gameState, username, role } = useSocket();
  const rs = gameState?.roundState;
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoAnswer, setAutoAnswer] = useState("");

  useEffect(() => {
    if (!socket) return;
    const handleTick = (time: number) => setTimeLeft(time);
    socket.on('timer_tick', handleTick);
    return () => { socket.off('timer_tick', handleTick); };
  }, [socket]);

  if (!rs) return null;


  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Xoá lựa chọn khi đổi câu hỏi
  useEffect(() => {
    setSelectedOption(null);
  }, [rs?.questionIndex]);

  const handleAutoSubmit = (e?: React.FormEvent, directAnswer?: string) => {
    if (e) e.preventDefault();
    const finalAnswer = directAnswer || autoAnswer.trim();
    if (finalAnswer && !rs?.isPaused) {
      socket?.emit('user_auto_submit_r1', { answer: finalAnswer });
      if (!directAnswer) setAutoAnswer(""); // Xoá trắng ô nhập sau khi gửi
    }
  };

  const isBuzzed = rs?.buzzedPlayer === username;
  const someoneElseBuzzed = rs?.buzzedPlayer && rs.buzzedPlayer !== username;
  const isAutoMode = gameState?.gameMode === 'auto';

  const handleBuzz = () => {
    if (!rs?.bellLocked && !someoneElseBuzzed && !isBuzzed) {
      socket?.emit('ring_bell');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault(); // Tránh scroll trang
        handleBuzz();
      }
    };

    if (role === 'user' && !isAutoMode && rs?.part === 'common') {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rs?.bellLocked, someoneElseBuzzed, isBuzzed, role, isAutoMode, rs?.part]);

  if (!gameState || !rs) return null;

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="material-symbols-outlined text-[400px]">play_circle</span>
      </div>

      <h3 className="font-headline-xl text-4xl uppercase mb-8 z-10 text-primary">KHỞI ĐỘNG</h3>
      
      {/* Đồng hồ đếm ngược (nếu có) */}
      {timeLeft > 0 && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="text-7xl font-display-lg text-secondary mb-4 drop-shadow-[0_0_20px_rgba(233,193,118,0.5)] z-10"
        >
          {timeLeft}s
        </motion.div>
      )}

      {/* Tạm dừng cảnh báo */}
      {isAutoMode && rs.isPaused && (
        <div className="bg-error text-white font-bold px-6 py-2 rounded-full mb-4 animate-pulse">
          TRẬN ĐẤU ĐANG TẠM DỪNG
        </div>
      )}

      {/* Hiển thị câu hỏi (Cho cả Auto và Manual) */}
      {gameState.currentQuestion ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-4xl p-8 rounded-2xl border-2 border-primary/50 text-center mb-12 shadow-[0_0_30px_rgba(165,28,48,0.2)] flex flex-col items-center"
        >
          <span className="text-secondary font-label-caps mb-4 block">CÂU HỎI SỐ {(rs.questionIndex || 0) + 1}</span>
          <h2 className="text-3xl md:text-4xl font-headline-lg text-on-surface leading-relaxed">
            {gameState.currentQuestion.text}
          </h2>

          {/* Rendering Options (A, B, C, D) */}
          {gameState.currentQuestion.options && gameState.currentQuestion.options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
              {gameState.currentQuestion.options.map((opt: string, idx: number) => {
                const label = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (role === 'user') {
                        setSelectedOption(opt);
                        if (isAutoMode) {
                          handleAutoSubmit(undefined, opt);
                        }
                      }
                    }}
                    className={`relative p-4 rounded-xl border-2 text-left font-bold transition-all overflow-hidden group
                      ${isSelected 
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(165,28,48,0.3)]' 
                        : 'bg-surface-variant border-outline-variant text-on-surface hover:border-primary/50 hover:bg-surface-variant/80'
                      }
                      ${role !== 'user' ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
                        ${isSelected ? 'bg-primary text-on-primary' : 'bg-outline-variant text-on-surface-variant group-hover:bg-primary/50 group-hover:text-white'}
                      `}>
                        {label}
                      </span>
                      <span className="text-lg">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-50 mb-12 mt-12">
          <span className="material-symbols-outlined text-6xl mb-4 animate-spin">hourglass_empty</span>
          <span className="font-label-caps text-xl tracking-widest text-on-surface-variant">ĐANG CHỜ MC PHÁT CÂU HỎI...</span>
        </div>
      )}

      {/* Giao diện tương tác dựa trên chế độ */}
      {!isAutoMode ? (
        <>
          {rs.part === 'personal' ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className={`p-12 rounded-3xl border-4 flex flex-col items-center gap-4 ${rs.currentPlayerIndex === gameState.players.findIndex(p => p.username === username) ? 'bg-primary/20 border-primary shadow-[0_0_50px_rgba(165,28,48,0.3)]' : 'bg-surface border-outline-variant opacity-50'}`}
            >
              <span className="material-symbols-outlined text-6xl text-primary">person</span>
              <span className="font-headline-lg text-3xl">
                Lượt thi cá nhân của {gameState.players[rs.currentPlayerIndex]?.username}
              </span>
              {rs.currentPlayerIndex === gameState.players.findIndex(p => p.username === username) && (
                <span className="text-on-surface-variant font-label-caps mt-4 text-xl tracking-widest text-secondary animate-pulse">
                  HÃY LẮNG NGHE MC ĐỌC CÂU HỎI VÀ TRẢ LỜI!
                </span>
              )}
            </motion.div>
          ) : rs.part === 'common' ? (
            <>
              {/* Hiển thị ai đang giành quyền trả lời (Manual - Common) */}
              {rs.buzzedPlayer && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-headline-lg text-2xl z-10 mb-12 revolutionary-glow flex items-center gap-4 border border-primary/50"
                >
                  <span className="material-symbols-outlined animate-bounce">notifications_active</span>
                  {rs.buzzedPlayer} ĐANG TRẢ LỜI
                </motion.div>
              )}

              {/* Nút Chuông Khổng Lồ dành cho Thí Sinh (Manual - Common) */}
              {role === 'user' && (
                <motion.button
                  whileHover={!rs.bellLocked && !someoneElseBuzzed ? { scale: 1.05 } : {}}
                  whileTap={!rs.bellLocked && !someoneElseBuzzed ? { scale: 0.95 } : {}}
                  onClick={handleBuzz}
                  disabled={rs.bellLocked || !!someoneElseBuzzed}
                  className={`w-64 h-64 rounded-full flex flex-col items-center justify-center border-8 z-10 transition-all duration-300
                    ${isBuzzed 
                      ? 'bg-primary border-white shadow-[0_0_100px_rgba(255,179,179,0.8)] text-on-primary' 
                      : rs.bellLocked || someoneElseBuzzed
                        ? 'bg-surface-variant border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-br from-error to-primary-container border-error shadow-[0_0_40px_rgba(255,180,171,0.5)] text-white hover:shadow-[0_0_80px_rgba(255,180,171,0.8)] cursor-pointer'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-6xl mb-2">touch_app</span>
                  <span className="font-headline-lg text-2xl uppercase tracking-wider">
                    {rs.bellLocked ? 'ĐÃ KHÓA' : 'GIÀNH QUYỀN'}
                  </span>
                </motion.button>
              )}
            </>
          ) : null}
        </>
      ) : (
        /* Giao diện Ô Nhập Text (Auto Mode) */
        role === 'user' && (
          <form onSubmit={handleAutoSubmit} className="w-full max-w-2xl flex gap-4 z-10">
            <input
              type="text"
              value={autoAnswer}
              onChange={(e) => setAutoAnswer(e.target.value)}
              placeholder="Gõ đáp án của bạn vào đây..."
              disabled={rs.isPaused || !gameState.currentQuestion}
              className="flex-1 bg-surface-container border-2 border-outline-variant focus:border-secondary p-4 rounded-xl text-xl text-on-surface outline-none transition-colors disabled:opacity-50"
              autoFocus
            />
            <button 
              type="submit"
              disabled={rs.isPaused || !gameState.currentQuestion || !autoAnswer.trim()}
              className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-headline-lg text-xl hover:bg-secondary/90 transition-colors shadow-[0_0_20px_rgba(233,193,118,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              GỬI
            </button>
          </form>
        )
      )}
    </div>
  );
}
