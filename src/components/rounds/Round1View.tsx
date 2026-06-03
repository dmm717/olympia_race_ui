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

  const handleBuzz = () => {
    socket?.emit('ring_bell');
  };

  const handleAutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (autoAnswer.trim() && !rs.isPaused) {
      socket?.emit('user_auto_submit_r1', { answer: autoAnswer.trim() });
      setAutoAnswer(""); // Xoá trắng ô nhập sau khi gửi
    }
  };

  const isBuzzed = rs.buzzedPlayer === username;
  const someoneElseBuzzed = rs.buzzedPlayer && rs.buzzedPlayer !== username;
  const isAutoMode = gameState.gameMode === 'auto';

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

      {/* Hiển thị câu hỏi (Chỉ Auto Mode) */}
      {isAutoMode && gameState.currentQuestion && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-4xl p-8 rounded-2xl border-2 border-primary/50 text-center mb-12 shadow-[0_0_30px_rgba(165,28,48,0.2)]"
        >
          <span className="text-secondary font-label-caps mb-4 block">CÂU HỎI SỐ {(rs.questionIndex || 0) + 1}</span>
          <h2 className="text-3xl md:text-4xl font-headline-lg text-on-surface leading-relaxed">
            {gameState.currentQuestion.text}
          </h2>
        </motion.div>
      )}

      {/* Giao diện tương tác dựa trên chế độ */}
      {!isAutoMode ? (
        <>
          {/* Hiển thị ai đang giành quyền trả lời (Manual) */}
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

          {/* Nút Chuông Khổng Lồ dành cho Thí Sinh (Manual) */}
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
      ) : (
        /* Giao diện Ô Nhập Text (Auto Mode) */
        role === 'user' && gameState.currentQuestion && (
          <form onSubmit={handleAutoSubmit} className="w-full max-w-2xl flex gap-4 z-10">
            <input
              type="text"
              value={autoAnswer}
              onChange={(e) => setAutoAnswer(e.target.value)}
              placeholder="Gõ đáp án của bạn vào đây..."
              disabled={rs.isPaused}
              className="flex-1 bg-surface-container border-2 border-outline-variant focus:border-secondary p-4 rounded-xl text-xl text-on-surface outline-none transition-colors disabled:opacity-50"
              autoFocus
            />
            <button 
              type="submit"
              disabled={rs.isPaused || !autoAnswer.trim()}
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
