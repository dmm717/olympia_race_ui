"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Round4View() {
  const { socket, gameState, username, role } = useSocket();
  const rs = gameState?.roundState;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleTick = (time: number) => setTimeLeft(time);
    socket.on('timer_tick', handleTick);
    return () => { socket.off('timer_tick', handleTick); };
  }, [socket]);

  const currentPlayer = gameState?.players?.[rs?.currentPlayerIndex || 0];
  const isMainPlayer = currentPlayer?.username === username;

  const handleToggleHopeStar = () => {
    socket?.emit('toggle_hope_star');
  };

  const handleSteal = () => {
    socket?.emit('ring_bell_steal');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        if (role === 'user' && !isMainPlayer && rs?.stealPhase && !rs?.bellLocked) {
          handleSteal();
        }
      }
    };

    if (role === 'user') {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role, isMainPlayer, rs?.stealPhase, rs?.bellLocked, socket]);

  if (!rs || !gameState) return null;

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full relative p-4">
      <h3 className="font-headline-xl text-3xl uppercase mb-4 z-10 text-primary">VỀ ĐÍCH</h3>
      
      {/* Thông tin phần thi */}
      <div className="bg-surface-container-low border border-outline-variant/30 px-8 py-4 rounded-xl flex items-center justify-center gap-8 z-10 mb-8 shadow-lg">
        <div className="text-center">
          <div className="text-xs font-label-caps text-on-surface-variant mb-1 tracking-widest">ĐANG THI</div>
          <div className="font-headline-lg text-xl text-secondary">{currentPlayer?.username || "---"}</div>
        </div>
        <div className="w-px h-10 bg-outline-variant/50"></div>
        <div className="text-center">
          <div className="text-xs font-label-caps text-on-surface-variant mb-1 tracking-widest">ĐIỂM CÂU HỎI</div>
          <div className="font-headline-lg text-2xl text-on-surface">{rs.currentQuestionValue}đ</div>
        </div>
      </div>

      {/* Timer chung */}
      {timeLeft > 0 && (
        <div className={`text-6xl font-display-lg mb-4 drop-shadow-md z-10 ${rs.stealPhase ? 'text-error animate-pulse' : 'text-primary'}`}>
          {timeLeft}s
        </div>
      )}

      {/* Hiệu ứng Ngôi sao hy vọng (Global) */}
      {rs.hopeStarActive && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20"
        >
          <span className="material-symbols-outlined text-[400px] text-secondary star-shine" data-weight="fill">grade</span>
        </motion.div>
      )}
      {rs.hopeStarActive && (
        <div className="z-10 bg-secondary text-on-secondary font-label-caps px-6 py-2 rounded-full mb-8 shadow-[0_0_15px_#e9c176] flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined" data-weight="fill">grade</span>
          ĐANG SỬ DỤNG NGÔI SAO HY VỌNG
        </div>
      )}

      {/* Hiển thị câu hỏi (nếu có) */}
      {gameState.currentQuestion && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-4xl p-6 rounded-2xl border border-primary/50 text-center mb-8 shadow-[0_0_20px_rgba(165,28,48,0.2)] flex flex-col items-center z-10"
        >
          <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
            {gameState.currentQuestion.text}
          </h2>

          {/* Rendering Options (A, B, C, D) */}
          {gameState.currentQuestion.options && gameState.currentQuestion.options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full">
              {gameState.currentQuestion.options.map((opt: string, idx: number) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div
                    key={idx}
                    className="relative p-3 rounded-xl border border-outline-variant text-left font-bold transition-all bg-surface-variant text-on-surface"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-outline-variant text-on-surface-variant">
                        {label}
                      </span>
                      <span className="text-lg">{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Giao diện User - Của người chơi chính */}
      {role === 'user' && isMainPlayer && !rs.stealPhase && (
        <div className="z-10 w-full max-w-sm flex flex-col items-center mt-12">
          {!rs.hopeStarActive && !rs.hopeStarUsed ? (
             <button
              onClick={handleToggleHopeStar}
              className="w-full bg-surface-container border border-secondary text-secondary py-6 rounded-2xl font-headline-lg text-xl uppercase hover:bg-secondary/10 transition-colors flex flex-col items-center gap-2 group"
             >
               <span className="material-symbols-outlined text-4xl group-hover:scale-125 transition-transform" data-weight="fill">star</span>
               CHỌN NGÔI SAO HY VỌNG
             </button>
          ) : rs.hopeStarActive ? (
            <div className="w-full bg-secondary/10 border border-secondary/50 text-secondary py-6 rounded-2xl font-headline-lg text-xl uppercase text-center opacity-50 cursor-not-allowed flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl" data-weight="fill">star</span>
              ĐANG DÙNG NGÔI SAO HY VỌNG
            </div>
          ) : (
            <div className="w-full bg-surface-variant/30 border border-outline-variant/50 text-on-surface-variant py-6 rounded-2xl font-headline-lg text-xl uppercase text-center opacity-50 cursor-not-allowed flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl" data-weight="fill">star_half</span>
              ĐÃ HẾT QUYỀN SỬ DỤNG
            </div>
          )}
        </div>
      )}

      {/* Giao diện User - Của kẻ cướp */}
      {role === 'user' && !isMainPlayer && rs.stealPhase && (
        <div className="z-10 w-full max-w-md flex flex-col items-center mt-8">
           <div className="text-sm font-label-caps text-error mb-4 tracking-[0.3em] animate-pulse">GIÀNH QUYỀN TRẢ LỜI</div>

           <button
              onClick={handleSteal}
              disabled={rs.bellLocked}
              className={`w-full py-8 rounded-full font-headline-lg text-3xl uppercase tracking-wider transition-all shadow-[0_10px_0_rgba(0,0,0,0.5)] border-4
                ${rs.bellLocked 
                  ? rs.buzzedPlayer === username 
                    ? 'bg-primary border-primary text-on-primary' // Mình cướp được
                    : 'bg-surface-variant border-surface-variant text-on-surface-variant opacity-50' // Người khác cướp
                  : 'bg-error border-error-container text-on-error hover:bg-error/90 active:translate-y-2 active:shadow-none' // Đang mở
                }
              `}
             >
               {rs.bellLocked 
                 ? rs.buzzedPlayer === username ? 'BẠN ĐÃ GIÀNH QUYỀN' : 'ĐÃ KHÓA'
                 : 'CƯỚP ĐIỂM'
               }
           </button>
        </div>
      )}

      {/* Nếu có người cướp */}
      {rs.buzzedPlayer && rs.stealPhase && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary/20 border-2 border-primary text-primary px-8 py-4 rounded-xl font-headline-lg text-xl z-20 mt-12 w-full max-w-xl text-center shadow-[0_0_30px_rgba(165,28,48,0.5)]"
        >
          {rs.buzzedPlayer} ĐANG TRẢ LỜI CƯỚP ĐIỂM!
        </motion.div>
      )}
    </div>
  );
}
