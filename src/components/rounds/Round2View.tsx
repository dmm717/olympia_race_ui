"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Round2View() {
  const { socket, gameState, username, role } = useSocket();
  const rs = gameState?.roundState;

  if (!rs) return null;

  const isEliminated = rs.eliminatedPlayers?.includes(username);

  const handleBuzzObstacle = () => {
    if (!rs.obstacleBuzzedPlayer && !isEliminated) {
      socket?.emit('ring_bell_obstacle');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        socket?.emit('ring_bell_obstacle');
      }
    };

    if (role === 'user' && !rs.obstacleBuzzedPlayer && !isEliminated) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role, rs?.obstacleBuzzedPlayer, isEliminated, socket]);

  const handleRowClick = (rowId: number) => {
    if (role === 'admin') {
      const isSelected = gameState.currentQuestion?.rowId === rowId;
      const isOpened = rs.openedRows?.includes(rowId);
      
      if (isOpened) return; // Đã lật thì không làm gì cả
      
      if (!isSelected) {
        socket?.emit('admin_select_row', { rowId });
      } else {
        socket?.emit('admin_open_row', { rowId });
      }
    }
  };

  const getPieceStyle = (id: number, isOpened: boolean) => {
    let positionClass = "";
    switch (id) {
      case 1: positionClass = "top-0 left-0 border-r-2 border-b-2"; break;
      case 2: positionClass = "top-0 right-0 border-l-2 border-b-2"; break;
      case 3: positionClass = "bottom-0 right-0 border-l-2 border-t-2"; break;
      case 4: positionClass = "bottom-0 left-0 border-r-2 border-t-2"; break;
      case 5: positionClass = "top-[25%] left-[25%] w-[50%] h-[50%] border-4 shadow-2xl z-10"; break; // Center
    }

    return `absolute w-1/2 h-1/2 bg-surface-container-high border-background flex items-center justify-center font-display-lg text-4xl text-on-surface-variant transition-all duration-1000 ease-in-out ${positionClass} ${isOpened ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`;
  };

  const isObstacleRevealed = !!rs.obstacleSolved;

  return (
    <div className="flex flex-col md:flex-row flex-1 w-full h-full p-4 gap-6 relative overflow-hidden">
      
      {/* LEFT COLUMN: IMAGE PUZZLE */}
      <div className="flex-1 relative bg-black/40 rounded-xl overflow-hidden shadow-2xl min-h-[300px]">
        {/* The hidden image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${gameState.questions?.round2?.imageUrl})` }}
        />
        
        {/* 4 Corner Pieces */}
        {gameState.questions?.round2?.rows?.map((r: any) => (
          <div key={r.rowId} className={getPieceStyle(r.rowId, !!rs.openedRows?.includes(r.rowId) || isObstacleRevealed)}>
            {r.rowId}
          </div>
        ))}

        {/* Center Piece (Fallback if not provided in questions as rowId=5) */}
        {!gameState.questions?.round2?.rows?.some((r: any) => r.rowId === 5) && (
          <div className={getPieceStyle(5, isObstacleRevealed)}>
            {/* Logo or placeholder for center */}
            <span className="material-symbols-outlined text-6xl text-primary/50">token</span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: ROWS & QUESTIONS */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-2">
        
        <div className="bg-primary/20 border-l-4 border-primary px-6 py-4 rounded-r-xl flex justify-between items-center shadow-md">
           <h3 className="font-headline-lg text-xl md:text-2xl text-primary tracking-wider">
             CHƯỚNG NGẠI VẬT CÓ {gameState.questions?.round2?.keyword?.length || 0} CHỮ CÁI
           </h3>
        </div>

        {/* The rows */}
        <div className="flex flex-col gap-3 flex-1 max-h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
          {gameState.questions?.round2?.rows?.map((rowData: any) => {
             const rowId = rowData.rowId;
             const length = rowData.length || 0;
             const isOpened = rs.openedRows?.includes(rowId);
             const answer = rowData.answer || "";

             return (
               <div key={rowId} className="flex items-center gap-3 w-full">
                 <div className="flex-1 flex gap-2 justify-start items-center p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/30 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-[70px]">
                   {Array.from({length}).map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-xl shadow-[inset_0_-2px_5px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] transition-colors duration-500
                        ${isOpened ? 'bg-secondary text-background' : 'bg-primary/80 border border-primary-container text-transparent'}`}
                     >
                        {isOpened ? answer[idx] : ''}
                     </div>
                   ))}
                 </div>
                 
                 <button 
                    onClick={() => handleRowClick(rowId)}
                    disabled={isOpened && role === 'admin'}
                    className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl font-headline-lg shadow-lg border-2 transition-all 
                    ${isOpened ? 'bg-secondary/20 text-secondary border-secondary/50 opacity-50 cursor-not-allowed' : 'bg-surface-container-high text-on-surface hover:bg-primary/20 hover:border-primary'} 
                    ${role === 'admin' && !isOpened ? 'cursor-pointer hover:scale-105 active:scale-95' : (!isOpened ? 'cursor-default' : '')}`}
                 >
                   {role === 'admin' && gameState.currentQuestion?.rowId === rowId && !isOpened ? (
                     <span className="text-sm font-bold text-primary animate-pulse">LẬT</span>
                   ) : (
                     <span className="text-2xl">{rowId}</span>
                   )}
                 </button>
               </div>
             );
          })}
        </div>
        
        {/* Giao diện Câu hỏi bên dưới */}
        {gameState.currentQuestion && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container p-6 rounded-2xl border border-primary/40 shadow-xl flex flex-col items-center mt-2"
          >
            <h4 className="text-lg font-headline-lg text-on-surface text-center leading-snug mb-4">
              {gameState.currentQuestion.text}
            </h4>

            {gameState.currentQuestion.options && gameState.currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-2 gap-3 w-full">
                {gameState.currentQuestion.options.map((opt: string, idx: number) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-outline-variant/50 text-left font-bold bg-surface-variant text-on-surface text-sm flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs bg-background text-on-surface-variant">
                        {label}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Nút bấm chuông chướng ngại vật (User Only) */}
        {role === 'user' && !rs.obstacleBuzzedPlayer && (
          <div className="mt-8 z-10 w-full flex justify-center">
            {isEliminated ? (
              <div className="w-full bg-surface-variant text-on-surface-variant py-4 text-center rounded-xl font-label-caps border border-outline-variant/50">
                BẠN ĐÃ BỊ LOẠI KHỎI VÒNG NÀY
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuzzObstacle}
                className="w-64 h-64 rounded-full flex flex-col items-center justify-center border-8 z-10 transition-all duration-300 bg-gradient-to-br from-error to-primary-container border-error shadow-[0_0_40px_rgba(255,180,171,0.5)] text-white hover:shadow-[0_0_80px_rgba(255,180,171,0.8)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-6xl mb-2">touch_app</span>
                <span className="font-headline-lg text-2xl uppercase tracking-wider text-center">
                  TRẢ LỜI<br/>CHƯỚNG NGẠI VẬT
                </span>
              </motion.button>
            )}
          </div>
        )}

        {/* Cảnh báo có người bấm chướng ngại vật */}
        {rs.obstacleBuzzedPlayer && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-error text-on-error px-4 py-4 rounded-xl font-headline-lg text-lg text-center shadow-[0_0_20px_rgba(255,180,171,0.5)] border-2 border-white mt-4 flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined animate-ping">warning</span>
            TÍN HIỆU TỪ: {rs.obstacleBuzzedPlayer}
          </motion.div>
        )}

      </div>
    </div>
  );
}
