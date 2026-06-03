"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";

export default function Round2View() {
  const { socket, gameState, username, role } = useSocket();
  const rs = gameState?.roundState;

  if (!rs) return null;

  const handleBuzzObstacle = () => {
    socket?.emit('ring_bell_obstacle');
  };

  const isEliminated = rs.eliminatedPlayers?.includes(username);

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full relative p-4">
      <h3 className="font-headline-xl text-3xl uppercase mb-8 z-10 text-primary">VƯỢT CHƯỚNG NGẠI VẬT</h3>
      
      {/* Cảnh báo có người bấm chướng ngại vật */}
      {rs.obstacleBuzzedPlayer && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-error text-on-error px-8 py-4 rounded-xl font-headline-lg text-xl z-20 mb-8 w-full max-w-2xl text-center shadow-[0_0_30px_rgba(255,180,171,0.5)] border-2 border-white"
        >
          <span className="material-symbols-outlined animate-ping mr-3">warning</span>
          TÍN HIỆU TỪ: {rs.obstacleBuzzedPlayer}
        </motion.div>
      )}

      {/* Ma trận hàng ngang */}
      <div className="w-full max-w-2xl flex flex-col gap-4 z-10 flex-1">
        {[1, 2, 3, 4].map((row) => {
          const isOpened = rs.openedRows?.includes(row);
          return (
            <motion.div 
              key={row}
              layout
              className={`h-16 flex items-center px-6 border border-outline-variant/50 rounded-lg transition-all duration-500
                ${isOpened ? 'bg-secondary/20 border-secondary/50 shadow-[0_0_15px_rgba(233,193,118,0.2)]' : 'glass-card'}`}
            >
              <div className="w-10 font-headline-lg text-xl text-on-surface-variant">
                #{row}
              </div>
              <div className="flex-1 flex justify-center">
                {isOpened ? (
                  <span className="text-secondary font-label-caps text-lg tracking-widest">ĐÃ MỞ HÀNG NGANG</span>
                ) : (
                  <span className="text-on-surface-variant/30 font-label-caps">ĐANG ẨN</span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Chướng ngại vật (Từ khóa trung tâm) */}
        <motion.div 
          layout
          className="mt-4 h-24 flex items-center justify-center px-6 bg-surface-container-highest border-2 border-primary/30 rounded-lg shadow-[0_0_20px_rgba(165,28,48,0.2)]"
        >
           <span className="text-primary font-headline-lg text-2xl tracking-[0.2em] uppercase">CHƯỚNG NGẠI VẬT</span>
        </motion.div>
      </div>

      {/* Nút bấm chuông chướng ngại vật (Góc dưới cùng) */}
      {role === 'user' && !rs.obstacleBuzzedPlayer && (
        <div className="mt-8 z-10 w-full max-w-2xl">
          {isEliminated ? (
            <div className="w-full bg-surface-variant text-on-surface-variant py-4 text-center rounded-xl font-label-caps">
              BẠN ĐÃ BỊ LOẠI KHỎI VÒNG NÀY
            </div>
          ) : (
            <button
              onClick={handleBuzzObstacle}
              className="w-full bg-error text-on-error py-4 rounded-xl font-headline-lg text-xl tracking-wider hover:bg-error/90 hover:scale-[1.02] transition-all duration-200 shadow-[0_10px_20px_rgba(255,180,171,0.2)] border-b-4 border-error-container active:scale-95 active:border-b-0"
            >
              <span className="material-symbols-outlined mr-2 align-bottom">gavel</span>
              TRẢ LỜI CHƯỚNG NGẠI VẬT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
