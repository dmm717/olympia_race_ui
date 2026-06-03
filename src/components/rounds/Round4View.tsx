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

  if (!rs || !gameState) return null;

  const currentPlayer = gameState.players[rs.currentPlayerIndex];
  const isMainPlayer = currentPlayer?.username === username;

  const handleToggleHopeStar = () => {
    socket?.emit('toggle_hope_star');
  };

  const handleSteal = () => {
    socket?.emit('ring_bell_steal');
  };

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

      {/* Giao diện User - Của người chơi chính */}
      {role === 'user' && isMainPlayer && !rs.stealPhase && (
        <div className="z-10 w-full max-w-sm flex flex-col items-center mt-12">
          {!rs.hopeStarActive ? (
             <button
              onClick={handleToggleHopeStar}
              className="w-full bg-surface-container border border-secondary text-secondary py-6 rounded-2xl font-headline-lg text-xl uppercase hover:bg-secondary/10 transition-colors flex flex-col items-center gap-2 group"
             >
               <span className="material-symbols-outlined text-4xl group-hover:scale-125 transition-transform" data-weight="fill">star</span>
               CHỌN NGÔI SAO HY VỌNG
             </button>
          ) : (
            <div className="w-full bg-secondary/10 border border-secondary/50 text-secondary py-6 rounded-2xl font-headline-lg text-xl uppercase text-center opacity-50 cursor-not-allowed">
              ĐÃ CHỌN NGÔI SAO HY VỌNG
            </div>
          )}
        </div>
      )}

      {/* Giao diện User - Của kẻ cướp */}
      {role === 'user' && !isMainPlayer && rs.stealPhase && (
        <div className="z-10 w-full max-w-md flex flex-col items-center mt-8">
           <div className="text-sm font-label-caps text-error mb-4 tracking-[0.3em] animate-pulse">GIÀNH QUYỀN TRẢ LỜI</div>
           
           <div className="text-7xl font-display-lg text-error mb-8 drop-shadow-[0_0_15px_rgba(255,180,171,0.5)]">
             {timeLeft}s
           </div>

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
