"use client";

import { useSocket } from "./SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import Round1View from "./rounds/Round1View";
import Round2View from "./rounds/Round2View";
import Round3View from "./rounds/Round3View";
import Round4View from "./rounds/Round4View";
import AdminControls from "./AdminControls";

const ROUND_NAMES = [
  "SẢNH CHỜ",
  "KHỞI ĐỘNG",
  "VƯỢT CHƯỚNG NGẠI VẬT",
  "TĂNG TỐC",
  "VỀ ĐÍCH"
];

export default function GameArena() {
  const { gameState, role } = useSocket();

  if (!gameState) return <div className="min-h-screen flex items-center justify-center text-white">Đang tải dữ liệu...</div>;

  const currentRound = gameState.round;
  const isPaused = gameState.status === 'paused';

  return (
    <div className="min-h-[125vh] bg-background text-on-background flex flex-col relative overflow-hidden">
      {/* Background Particles/Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary blur-[150px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface-container/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">token</span>
          <h2 className="font-headline-lg text-2xl uppercase tracking-widest text-primary">
            {ROUND_NAMES[currentRound] || "DIALECTIC SUMMIT"}
          </h2>
        </div>
        {isPaused && (
          <div className="bg-error/20 text-error px-4 py-1 rounded-full font-label-caps animate-pulse border border-error/50">
            TRẬN ĐẤU ĐANG TẠM DỪNG
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden z-10 ${role === 'admin' ? 'gap-4 p-4 bg-background' : ''}`}>
        
        {/* Left Sidebar: Scoreboard */}
        <aside className={`w-full lg:w-80 overflow-y-auto p-6 bg-surface/50 ${role === 'admin' ? 'rounded-2xl border border-outline-variant/30 shadow-lg' : 'border-b lg:border-b-0 lg:border-r border-outline-variant/30'}`}>
          <div className="w-full flex-shrink-0">
            <h3 className="font-label-caps text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">leaderboard</span> BẢNG ĐIỂM
            </h3>
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {gameState.players.map((p, index) => (
              <motion.div
                key={p.username}
                layout
                className="flex-shrink-0 lg:flex-shrink w-64 lg:w-auto glass-card p-4 rounded-xl flex items-center gap-4 border border-outline-variant/20 relative overflow-hidden group"
              >
                {/* Position Highlight */}
                {index === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary shadow-[0_0_10px_#e9c176]"></div>}
                
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-display-lg text-xl text-primary border border-outline-variant/50">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-label-caps truncate text-on-surface">{p.username}</div>
                  <div className="text-body-md text-on-surface-variant opacity-50">Thí sinh</div>
                </div>
                <div className="font-display-lg text-2xl text-secondary">{p.score}</div>
              </motion.div>
            ))}
            {gameState.players.length === 0 && (
              <div className="text-on-surface-variant italic text-sm">Chưa có thí sinh nào tham gia.</div>
            )}
            </div>
          </div>
        </aside>

        {/* Middle Sidebar: Admin Controls (Only for Admin) */}
        {role === 'admin' && (
          <aside className="w-full lg:w-[400px] xl:w-[480px] rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 lg:p-6 overflow-y-auto shadow-lg">
            <AdminControls />
          </aside>
        )}

        {/* Center: Game Board */}
        <main className={`flex-1 flex flex-col relative overflow-hidden ${role === 'admin' ? 'rounded-2xl border border-outline-variant/30 bg-surface/20 p-2 lg:p-4 shadow-lg' : 'p-2 lg:p-4'}`}>
          <AnimatePresence mode="wait">
            {currentRound === 0 && (
              <motion.div
                key="r0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <span className="material-symbols-outlined text-[100px] text-surface-variant mb-6">hourglass_empty</span>
                <h2 className="text-3xl font-headline-xl text-on-surface mb-2 uppercase">Chờ lệnh từ BTC</h2>
                <p className="text-on-surface-variant">Trận đấu sẽ sớm bắt đầu...</p>
              </motion.div>
            )}
            {currentRound === 1 && <Round1View key="r1" />}
            {currentRound === 2 && <Round2View key="r2" />}
            {currentRound === 3 && <Round3View key="r3" />}
            {currentRound === 4 && <Round4View key="r4" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
