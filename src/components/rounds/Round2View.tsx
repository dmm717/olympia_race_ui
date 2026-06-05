"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Round2View() {
  const { socket, gameState, username, role } = useSocket();
  const [answer, setAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const rs = gameState?.roundState;

  // Reset answer when a new question is selected
  useEffect(() => {
    setAnswer('');
    setHasSubmitted(false);
  }, [gameState?.currentQuestion?.rowId]);

  if (!rs) return null;

  const isEliminated = rs.eliminatedPlayers?.includes(username);

  const handleBuzzObstacle = () => {
    if (!rs.obstacleBuzzedPlayer && !isEliminated) {
      socket?.emit('ring_bell_obstacle');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        socket?.emit('ring_bell_obstacle');
      }
    };

    if (role === 'user' && !isEliminated) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role, isEliminated, socket]);

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

    return `absolute w-1/2 h-1/2 bg-surface-container-high border-background flex items-center justify-center font-display-lg text-2xl md:text-3xl text-on-surface-variant transition-all duration-1000 ease-in-out ${positionClass} ${isOpened ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`;
  };

  const isObstacleRevealed = !!rs.obstacleSolved;

  return (
    <div className="flex flex-col md:flex-row flex-1 w-full h-full p-2 gap-4 relative overflow-hidden justify-center">
      
      {/* LEFT COLUMN: IMAGE PUZZLE */}
      <div className="w-full md:w-1/2 lg:w-[45%] max-w-[500px] xl:max-w-[600px] relative bg-black/40 rounded-xl overflow-hidden shadow-xl self-start md:self-center aspect-[4/3] mx-auto">
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
      <div className="w-full md:w-1/2 lg:w-1/2 xl:w-[45%] flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 py-1">
        
        <div className="bg-primary/20 border-l-4 border-primary px-3 py-1.5 rounded-r-lg flex justify-between items-center shadow-sm">
           <h3 className="font-bold text-sm md:text-base text-primary tracking-wider">
             CHƯỚNG NGẠI VẬT CÓ {gameState.questions?.round2?.keyword?.length || 0} CHỮ CÁI
           </h3>
        </div>

        {/* The rows */}
        <div className="flex flex-col gap-1.5 flex-shrink-0 max-h-[35vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
          {gameState.questions?.round2?.rows?.map((rowData: any) => {
             const rowId = rowData.rowId;
             const length = rowData.length || 0;
             const isOpened = rs.openedRows?.includes(rowId);
             const answer = rowData.answer || "";

             return (
               <div key={rowId} className="flex items-center gap-1.5 w-full">
                 <div className="flex-1 flex gap-1 justify-start items-center p-1.5 bg-surface-variant/20 rounded-lg border border-outline-variant/30 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-[36px]">
                   {Array.from({length}).map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`w-6 h-6 flex-shrink-0 rounded flex items-center justify-center font-bold text-xs shadow-[inset_0_-1px_3px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.3)] transition-colors duration-500
                        ${isOpened ? 'bg-secondary text-background' : 'bg-primary/80 border border-primary-container text-transparent'}`}
                     >
                        {isOpened ? answer[idx] : ''}
                     </div>
                   ))}
                 </div>
                 
                 <button 
                    onClick={() => handleRowClick(rowId)}
                    disabled={isOpened && role === 'admin'}
                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded font-bold shadow border transition-all 
                    ${isOpened ? 'bg-secondary/20 text-secondary border-secondary/50 opacity-50 cursor-not-allowed' : 'bg-surface-container-high text-on-surface hover:bg-primary/20 hover:border-primary'} 
                    ${role === 'admin' && !isOpened ? 'cursor-pointer hover:scale-105 active:scale-95' : (!isOpened ? 'cursor-default' : '')}`}
                 >
                   {role === 'admin' && gameState.currentQuestion?.rowId === rowId && !isOpened ? (
                     <span className="text-[10px] font-bold text-primary animate-pulse">LẬT</span>
                   ) : (
                     <span className="text-sm">{rowId}</span>
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
            className="bg-surface-container p-3 rounded-lg border border-primary/40 shadow flex flex-col items-center mt-2 flex-shrink-0"
          >
            <h4 className="text-sm font-bold text-on-surface text-center leading-snug mb-2">
              {gameState.currentQuestion.text}
            </h4>

            {gameState.currentQuestion.options && gameState.currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 w-full">
                {gameState.currentQuestion.options.map((opt: string, idx: number) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className="p-1.5 rounded border border-outline-variant/50 text-left font-bold bg-surface-variant text-on-surface text-[11px] flex items-center gap-1.5"
                    >
                      <span className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center text-[9px] bg-background text-on-surface-variant">
                        {label}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Khung nhập đáp án (User Only) */}
            {role === 'user' && !isEliminated && (
              <div className="mt-2 w-full flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value.toUpperCase());
                    setHasSubmitted(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && answer.trim()) {
                      socket?.emit('submit_answer', { answer: answer.trim() });
                      setHasSubmitted(true);
                      setAnswer('');
                    }
                  }}
                  className={`flex-1 bg-surface p-1.5 rounded border focus:ring-1 outline-none font-bold uppercase text-center text-[11px] transition-colors
                    ${hasSubmitted ? 'border-secondary/50 text-secondary focus:border-secondary focus:ring-secondary/50' : 'border-outline-variant text-on-surface focus:border-primary focus:ring-primary/50'}
                  `}
                  placeholder="NHẬP ĐÁP ÁN..."
                  autoComplete="off"
                />
                <button
                  onClick={() => {
                    if (answer.trim()) {
                      socket?.emit('submit_answer', { answer: answer.trim() });
                      setHasSubmitted(true);
                      setAnswer('');
                    }
                  }}
                  className={`px-3 py-1.5 rounded font-bold transition-all shadow-sm text-[11px] flex items-center gap-1
                    ${hasSubmitted ? 'bg-secondary text-background hover:bg-secondary/90' : 'bg-primary text-on-primary hover:bg-primary/90'}
                  `}
                >
                  {hasSubmitted ? (
                    <>
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      ĐÃ GỬI
                    </>
                  ) : (
                    'GỬI'
                  )}
                </button>
              </div>
            )}

            {/* Hiển thị danh sách đáp án (Admin Only) */}
            {role === 'admin' && rs?.submissions && rs.submissions.length > 0 && (
              <div className="mt-2 w-full bg-surface/80 p-2 rounded border border-outline-variant/30 max-h-32 overflow-y-auto">
                <h4 className="text-[11px] font-bold text-secondary mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">list_alt</span>
                  ĐÁP ÁN TỪ THÍ SINH ({rs.submissions.length})
                </h4>
                <div className="flex flex-col gap-1.5">
                  {rs.submissions.map((sub, idx) => (
                    <div key={idx} className="flex flex-col gap-1 bg-surface p-1.5 px-2 rounded text-xs shadow-sm border border-outline-variant/20">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-on-surface">{sub.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary font-bold bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded text-[10px]">
                            {sub.answer}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono w-10 text-right">
                            {(sub.timeMs / 1000).toFixed(2)}s
                          </span>
                        </div>
                      </div>
                      
                      {!sub.judged ? (
                        <div className="flex gap-1 justify-end mt-0.5">
                          <button
                            onClick={() => {
                              socket?.emit('admin_judge_round2_submission', { username: sub.username, status: 'correct' });
                            }}
                            className="bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white px-2 py-0.5 rounded text-[10px] font-bold border border-green-600/50 transition-colors"
                          >
                            ĐÚNG (+10)
                          </button>
                          <button
                            onClick={() => {
                              socket?.emit('admin_judge_round2_submission', { username: sub.username, status: 'wrong' });
                            }}
                            className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded text-[10px] font-bold border border-red-600/50 transition-colors"
                          >
                            SAI
                          </button>
                        </div>
                      ) : (
                        <div className={`text-[9px] font-bold text-right mt-0.5 ${sub.judged === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                          {sub.judged === 'correct' ? '✔️ ĐÃ CỘNG 10 ĐIỂM' : '❌ ĐÁP ÁN SAI'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Nút bấm chuông chướng ngại vật (User Only) */}
        {role === 'user' && !rs.obstacleBuzzedPlayer && (
          <div className="mt-2 z-10 w-full flex justify-center flex-shrink-0">
            {isEliminated ? (
              <div className="w-full bg-surface-variant text-on-surface-variant py-2 text-center rounded font-bold border border-outline-variant/50 text-xs">
                BẠN ĐÃ BỊ LOẠI KHỎI VÒNG NÀY
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuzzObstacle}
                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 border-2 z-10 transition-all duration-300 bg-gradient-to-r from-error to-primary-container border-error shadow-[0_0_15px_rgba(255,180,171,0.3)] text-white hover:shadow-[0_0_25px_rgba(255,180,171,0.6)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">touch_app</span>
                <span className="font-bold text-sm uppercase tracking-wider">
                  GIÀNH QUYỀN TRẢ LỜI CHƯỚNG NGẠI VẬT
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
