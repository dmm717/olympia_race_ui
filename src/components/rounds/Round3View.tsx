"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Round3View() {
  const { socket, gameState, role } = useSocket();
  const rs = gameState?.roundState;
  const [timeLeft, setTimeLeft] = useState(0);
  const [myAnswer, setMyAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handleTick = (time: number) => setTimeLeft(time);
    const handleAck = () => setHasSubmitted(true);
    
    socket.on('timer_tick', handleTick);
    socket.on('submission_accepted', handleAck);
    return () => { 
      socket.off('timer_tick', handleTick); 
      socket.off('submission_accepted', handleAck); 
    };
  }, [socket]);

  // Khi bắt đầu câu mới (submissions trống hoặc bell mở khóa), reset form
  useEffect(() => {
    if (rs && !rs.bellLocked && rs.submissions?.length === 0) {
      const t = setTimeout(() => {
        setMyAnswer("");
        setHasSubmitted(false);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [rs]);

  if (!rs) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (myAnswer.trim() && !hasSubmitted) {
      socket?.emit('submit_answer', { answer: myAnswer.trim() });
    }
  };

  const isLocked = rs.bellLocked;

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full relative p-4">
      <h3 className="font-headline-xl text-3xl uppercase mb-8 z-10 text-primary">TĂNG TỐC</h3>
      
      {/* Đồng hồ */}
      <div className="flex flex-col items-center mb-12 z-10">
        <div className="text-sm font-label-caps text-on-surface-variant mb-2 tracking-[0.3em]">THỜI GIAN CÒN LẠI</div>
        <motion.div 
          animate={{ scale: timeLeft <= 5 && timeLeft > 0 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`text-[120px] leading-none font-display-lg ${timeLeft <= 5 ? 'text-error drop-shadow-[0_0_20px_rgba(255,180,171,0.8)]' : 'text-secondary drop-shadow-[0_0_15px_rgba(233,193,118,0.3)]'}`}
        >
          {timeLeft}
        </motion.div>
      </div>

      {/* Giao diện User */}
      {role === 'user' && (
        <div className="w-full max-w-xl z-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={myAnswer}
              onChange={(e) => setMyAnswer(e.target.value)}
              disabled={isLocked || hasSubmitted}
              placeholder={isLocked ? "HẾT THỜI GIAN NHẬP" : "Nhập đáp án của bạn..."}
              className="w-full glass-card text-center text-3xl py-6 rounded-2xl border border-primary/30 focus:border-primary focus:shadow-[0_0_20px_rgba(165,28,48,0.3)] outline-none text-on-surface uppercase font-bold disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLocked || hasSubmitted || !myAnswer.trim()}
              className="bg-primary-container text-on-primary-container py-4 rounded-xl font-headline-lg text-xl tracking-wider hover:bg-primary-container/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed border-b-4 border-primary-fixed-dim active:border-b-0 active:translate-y-1"
            >
              {hasSubmitted ? "ĐÃ NỘP BÀI" : "CHỐT ĐÁP ÁN"}
            </button>
          </form>
        </div>
      )}

      {/* Giao diện Admin: Hiển thị kết quả của Thí sinh (Ẩn với User) */}
      {role === 'admin' && (
        <div className="w-full max-w-3xl z-10 mt-8">
          <h4 className="font-label-caps text-on-surface-variant mb-4 border-b border-outline-variant/30 pb-2">KẾT QUẢ TRẢ LỜI CỦA THÍ SINH (ADMIN ONLY)</h4>
          <div className="grid grid-cols-2 gap-4">
            {gameState.players.map((p: { username: string }) => {
              const sub = rs.submissions?.find((s: { username: string, answer: string, timeMs: number }) => s.username === p.username);
              return (
                <div key={p.username} className="glass-card p-4 rounded-lg flex flex-col items-center">
                  <span className="font-label-caps text-sm text-secondary mb-2">{p.username}</span>
                  {sub ? (
                    <>
                      <span className="font-headline-lg text-xl text-on-surface uppercase text-center break-words w-full">{sub.answer}</span>
                      <span className="text-xs text-on-surface-variant mt-2 font-mono">{(sub.timeMs / 1000).toFixed(2)}s</span>
                    </>
                  ) : (
                    <span className="italic text-on-surface-variant/50 text-sm mt-2">Chưa nộp bài</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
