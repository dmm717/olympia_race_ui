"use client";

import { useSocket } from "./SocketProvider";
import { useState } from "react";
import AdminQuestionManager from "./AdminQuestionManager";
import toast from "react-hot-toast";

export default function AdminControls() {
  const { socket, gameState } = useSocket();
  const [targetRound, setTargetRound] = useState("1");
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
  const [r2AddScorePlayerIndex, setR2AddScorePlayerIndex] = useState(0);
  const rs = gameState?.roundState;

  if (!socket || !gameState) return null;

  const handleStartRound = () => {
    socket.emit('admin_set_round', { round: parseInt(targetRound) });
  };

  const handleResetScore = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span className="font-bold">Bạn có chắc muốn Reset điểm không?</span>
          <div className="flex gap-2 mt-2">
            <button 
              className="bg-error text-white px-4 py-1 rounded text-sm"
              onClick={() => {
                socket.emit('admin_reset');
                toast.dismiss(t.id);
                toast.success('Đã reset điểm!');
              }}
            >
              Chắc chắn
            </button>
            <button 
              className="bg-surface-variant text-on-surface-variant px-4 py-1 rounded text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Huỷ
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handleSetMode = (mode: 'manual' | 'auto') => {
    socket.emit('admin_set_mode', { mode });
  };

  const handleTogglePause = () => {
    socket.emit('admin_toggle_pause');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 items-start border-b border-outline-variant/30 pb-4">
        <h3 className="font-label-caps text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">settings_applications</span>
          ADMIN DASHBOARD (Vòng {gameState.round})
        </h3>
        <div className="flex flex-wrap items-center gap-2 w-full">
          <select 
            className="bg-surface border border-outline-variant rounded px-3 py-1.5 text-xs outline-none flex-1"
            value={targetRound}
            onChange={(e) => setTargetRound(e.target.value)}
          >
            <option value="0">Sảnh chờ</option>
            <option value="1">Vòng 1: Khởi động</option>
            <option value="2">Vòng 2: Chướng ngại vật</option>
            <option value="3">Vòng 3: Tăng tốc</option>
            <option value="4">Vòng 4: Về đích</option>
          </select>
          <button 
            onClick={handleStartRound}
            className="bg-secondary text-on-secondary px-3 py-1.5 rounded font-label-caps text-xs hover:bg-secondary/80 whitespace-nowrap"
          >
            CHUYỂN VÒNG
          </button>
          <button 
            onClick={() => setIsQuestionManagerOpen(true)}
            className="bg-primary/20 text-primary px-3 py-1.5 rounded font-label-caps text-xs border border-primary/50 hover:bg-primary hover:text-on-primary flex items-center justify-center gap-1 flex-1 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">database</span>
            CÂU HỎI
          </button>
          <button 
            onClick={handleResetScore}
            className="bg-error/20 text-error px-3 py-1.5 rounded font-label-caps text-xs border border-error/50 hover:bg-error hover:text-on-error w-full mt-1"
          >
            RESET TRẬN ĐẤU
          </button>
        </div>
      </div>

      {/* Dual Mode Controls */}
      {/* Dual Mode Controls */}
      <div className="flex flex-col gap-3 bg-surface p-3 rounded-lg border border-outline-variant/30 mb-2">
        <div className="flex flex-col items-start gap-2 w-full">
          <span className="font-label-caps text-sm text-on-surface-variant">CHẾ ĐỘ CHƠI:</span>
          <div className="flex bg-surface-variant rounded-lg p-1 w-full">
            <button 
              onClick={() => handleSetMode('manual')}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-colors ${gameState.gameMode === 'manual' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:bg-surface'}`}
            >
              THỦ CÔNG (MC Chấm)
            </button>
            <button 
              onClick={() => handleSetMode('auto')}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-colors ${gameState.gameMode === 'auto' ? 'bg-secondary text-on-secondary shadow' : 'text-on-surface-variant hover:bg-surface'}`}
            >
              TỰ ĐỘNG (Máy Chấm)
            </button>
          </div>
        </div>

        {gameState.gameMode === 'auto' && (
          <button 
            onClick={handleTogglePause}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-sm border-2 transition-all ${
              rs?.isPaused 
                ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600 hover:text-white' 
                : 'bg-error/20 border-error text-error hover:bg-error hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">
              {rs?.isPaused ? 'play_arrow' : 'pause'}
            </span>
            {rs?.isPaused ? 'TIẾP TỤC TRẬN ĐẤU' : 'TẠM DỪNG TRẬN ĐẤU'}
          </button>
        )}
      </div>

      {/* Dynamic Controls based on Round */}
      <div className="flex flex-wrap gap-4 items-center">
        {gameState.round === 1 && (
          <div className="flex justify-center w-full">
            
            {/* Các Nút Điều Khiển */}
            <div className="flex flex-col gap-4 bg-surface-variant/10 p-3 rounded-xl border border-outline-variant/40 shadow-sm w-full">
              
              {/* Panel 1: Khởi động riêng & chung */}
              <div className="flex flex-col gap-3 w-full border-b border-outline-variant/30 pb-4">
                {/* Khởi động riêng */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                  <span className="font-label-caps text-[11px] text-primary">KHỞI ĐỘNG RIÊNG:</span>
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-outline-variant/50 shadow-inner">
                    <select id="r1_player" className="bg-transparent outline-none text-xs font-bold text-secondary">
                      {gameState.players.map((p, i) => <option key={i} value={i}>{p.username}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const idx = (document.getElementById('r1_player') as HTMLSelectElement).value;
                        socket.emit('admin_start_personal_r1', { playerIndex: parseInt(idx) });
                      }}
                      className="bg-primary/20 text-primary py-0.5 px-3 rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                      Bắt đầu
                    </button>
                  </div>
                </div>

                {/* Khởi động chung */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="font-label-caps text-[11px] text-primary">KHỞI ĐỘNG CHUNG:</span>
                  <button onClick={() => socket.emit('admin_start_common_r1')} className="bg-primary-container text-on-primary-container text-xs py-1 px-4 rounded font-bold hover:brightness-110 shadow-sm">
                    Bắt đầu chung
                  </button>
                </div>
              </div>

              {/* Panel 2: Điều khiển Manual Mode */}
              {gameState.gameMode === 'manual' && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-label-caps bg-surface-variant px-2 py-0.5 rounded text-on-surface-variant">ĐIỀU KHIỂN CHẤM ĐIỂM {gameState.currentQuestion && `- CÂU ${(rs?.questionIndex || 0) + 1}`}</span>
                    <button onClick={() => socket.emit('admin_next_question_r1')} className="bg-secondary text-on-secondary py-1 px-4 rounded font-bold shadow-sm hover:bg-secondary/80 transition-transform flex items-center gap-1 text-[11px]">
                      CÂU TIẾP THEO <span className="material-symbols-outlined text-sm">skip_next</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3 bg-surface p-2 rounded-lg border border-outline-variant/50">
                    
                    {/* Đáp án hiển thị siêu gọn */}
                    {gameState.currentQuestion && (
                      <div className="bg-green-900/20 border-l-2 border-green-500 p-2 rounded text-green-400 font-bold text-[11px] flex-1 flex items-center gap-2">
                        <span className="text-[9px] font-label-caps text-green-500/70">ĐÁP ÁN ĐÚNG:</span>
                        <span className="truncate flex-1">
                          {(() => {
                            const ans = gameState.currentQuestion.answer;
                            const opts = gameState.currentQuestion.options;
                            if (opts && opts.length > 0) {
                              const idx = opts.indexOf(ans);
                              if (idx >= 0) return `${String.fromCharCode(65 + idx)}: ${ans}`;
                            }
                            return ans;
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-center border-t border-outline-variant/30 pt-3">
                      {rs?.part === 'personal' ? (
                        <div className="flex gap-2">
                          <button onClick={() => socket.emit('admin_judge', { correct: true })} className="bg-green-600/10 text-green-500 border border-green-600/50 py-1.5 rounded font-bold hover:bg-green-600 hover:text-white transition-all flex-1 text-[11px]">
                            ĐÚNG (+10)
                          </button>
                          <button onClick={() => socket.emit('admin_judge', { correct: false })} className="bg-red-600/10 text-red-500 border border-red-600/50 py-1.5 rounded font-bold hover:bg-red-600 hover:text-white transition-all flex-1 text-[11px]">
                            SAI (+0)
                          </button>
                        </div>
                      ) : rs?.part === 'common' ? (
                        rs?.buzzedPlayer ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-primary flex items-center justify-center bg-primary/10 rounded">
                              {rs.buzzedPlayer} giành quyền!
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => socket.emit('admin_judge', { correct: true })} className="bg-green-600/10 text-green-500 border border-green-600/50 py-1 rounded font-bold hover:bg-green-600 hover:text-white transition-all flex-1 text-[11px]">
                                ĐÚNG (+10)
                              </button>
                              <button onClick={() => socket.emit('admin_judge', { correct: false })} className="bg-red-600/10 text-red-500 border border-red-600/50 py-1 rounded font-bold hover:bg-red-600 hover:text-white transition-all flex-1 text-[11px]">
                                SAI (-5)
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-on-surface-variant text-[10px] italic text-center opacity-60">Đang chờ thí sinh...</div>
                        )
                      ) : (
                        <div className="text-on-surface-variant text-[10px] italic text-center opacity-60">Chưa bắt đầu thi</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState.round === 2 && (
          <div className="flex flex-col gap-3 w-full bg-surface-variant/10 p-3 rounded-xl border border-outline-variant/40 shadow-sm">
            {gameState.questions?.round2 && (
               <div className="w-full bg-surface/50 rounded-lg overflow-hidden border border-outline-variant/40 mt-2 flex flex-col">
                 {gameState.questions.round2.imageUrl && (
                   <div className="w-full aspect-video relative">
                     <img src={gameState.questions.round2.imageUrl} alt="Chướng ngại vật" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                        <span className="text-white/80 text-[10px] uppercase font-bold tracking-widest mb-1">ĐÁP ÁN CHƯỚNG NGẠI VẬT</span>
                        <span className="text-yellow-400 font-headline-lg text-xl drop-shadow-md text-center leading-tight">
                          {gameState.questions.round2.keyword}
                        </span>
                     </div>
                   </div>
                 )}
                 {gameState.questions.round2.rows && (
                   <div className="p-3 bg-surface border-t border-outline-variant/30 flex flex-col gap-1.5">
                     <span className="text-[10px] text-primary font-bold uppercase mb-1">Đáp án hàng ngang:</span>
                     {gameState.questions.round2.rows.map((row: any) => (
                       <div key={row.rowId} className="flex items-center justify-between text-xs border-b border-outline-variant/20 pb-1.5 last:border-0 last:pb-0">
                         <span className="text-on-surface-variant font-medium whitespace-nowrap">Hàng {row.rowId}:</span>
                         <span className="font-bold text-on-surface text-right truncate ml-2 text-[11px]">{row.answer}</span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            )}
            <button onClick={() => socket.emit('admin_start_round2')} className="bg-primary-container text-on-primary-container font-bold py-2 px-4 rounded w-full hover:brightness-110">
              Bắt đầu Vòng 2 {gameState.gameMode === 'auto' ? '(Tự Động)' : ''}
            </button>
            {gameState.gameMode === 'manual' && rs?.obstacleBuzzedPlayers && rs.obstacleBuzzedPlayers.length > 0 && (
              <div className="flex flex-col gap-2 bg-error/10 p-3 rounded-lg border border-error/50 mt-2">
                <span className="font-bold text-error text-center text-sm">⚠️ {rs.obstacleBuzzedPlayers[0]} TRẢ LỜI CNV!</span>
                {rs.obstacleBuzzedPlayers.length > 1 && (
                  <div className="text-[10px] text-error/80 text-center -mt-1">
                    Chờ tiếp theo: {rs.obstacleBuzzedPlayers.slice(1).join(', ')}
                  </div>
                )}
                <div className="flex gap-2 w-full">
                  <button onClick={() => socket.emit('admin_judge_obstacle', { correct: true })} className="bg-green-600/20 text-green-500 border border-green-600/50 py-1.5 rounded hover:bg-green-600 hover:text-white font-bold flex-1 text-[11px] transition-colors">
                    ĐÚNG CNV
                  </button>
                  <button onClick={() => socket.emit('admin_judge_obstacle', { correct: false })} className="bg-red-600/20 text-red-500 border border-red-600/50 py-1.5 rounded hover:bg-red-600 hover:text-white font-bold flex-1 text-[11px] transition-colors">
                    SAI CNV (Loại & Tiếp Tục)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState.round === 3 && (
          <div className="flex flex-col gap-3 w-full bg-surface-variant/10 p-3 rounded-xl border border-outline-variant/40 shadow-sm">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-label-caps bg-surface-variant px-2 py-0.5 rounded text-on-surface-variant">TĂNG TỐC - CÂU {(rs?.questionIndex || 0) + 1}</span>
              <button onClick={() => socket.emit('admin_next_question_r3')} className="bg-secondary text-on-secondary py-1 px-4 rounded font-bold shadow-sm hover:bg-secondary/80 transition-transform flex items-center gap-1 text-[11px]">
                CÂU TIẾP THEO <span className="material-symbols-outlined text-sm">skip_next</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => socket.emit('admin_show_media_r3')} className="bg-tertiary text-on-tertiary font-bold py-2 px-3 rounded flex-1 hover:brightness-110 text-[11px] whitespace-nowrap">
                Hiện Video/Ảnh
              </button>
              <button 
                onClick={() => socket.emit('admin_start_round3_question')} 
                className="bg-primary-container text-on-primary-container font-bold py-2 px-3 rounded flex-1 hover:brightness-110 text-[11px] whitespace-nowrap"
              >
                Phát Câu Hỏi ({(rs?.questionIndex === 0 || rs?.questionIndex === 1) ? '20s' : '30s'})
              </button>
            </div>
            
            <div className="flex flex-col gap-2 bg-surface p-3 rounded-lg border border-outline-variant/50">
              <span className="text-[10px] font-label-caps text-on-surface-variant">ĐÁP ÁN ĐÚNG:</span>
              <input type="text" id="r3_answer" placeholder="Ví dụ: 1,2,3,4 hoặc Đáp án A" className="bg-transparent border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary w-full" />
              <button 
                onClick={() => {
                  const val = (document.getElementById('r3_answer') as HTMLInputElement).value;
                  socket.emit('admin_judge_round3', { correctAnswer: val });
                }} 
                className="bg-secondary text-on-secondary px-4 py-2 rounded font-bold hover:bg-secondary/80 text-xs w-full transition-colors mt-1"
              >
                CHẤM ĐIỂM
              </button>
            </div>
          </div>
        )}

        {gameState.round === 4 && (
          <div className="flex flex-col gap-3 w-full bg-surface-variant/10 p-3 rounded-xl border border-outline-variant/40 shadow-sm">
            {/* Chọn Thí Sinh */}
            <div className="flex flex-col gap-2 bg-surface p-3 rounded-lg border border-outline-variant/50">
              <span className="text-[10px] font-label-caps text-on-surface-variant">CHỌN THÍ SINH:</span>
              <div className="flex items-center gap-2 w-full">
                <select id="r4_player" className="bg-transparent border border-outline-variant rounded px-2 py-1.5 text-sm outline-none flex-1">
                  {gameState.players
                    .map((p, idx) => ({ p, idx }))
                    .sort((a, b) => b.p.score - a.p.score)
                    .map((item) => (
                      <option key={item.idx} value={item.idx}>
                        {item.p.username} - {item.p.score}đ
                      </option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const idx = (document.getElementById('r4_player') as HTMLSelectElement).value;
                    socket.emit('admin_r4_start_turn', { playerIndex: parseInt(idx) });
                  }}
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded font-bold text-xs transition-colors whitespace-nowrap"
                >
                  VÀO THI
                </button>
              </div>
            </div>

            {/* Điều khiển Gói Câu Hỏi */}
            {rs?.currentPlayerIndex !== undefined && rs?.currentPlayerIndex !== -1 && (
              <div className="flex flex-col gap-3 bg-surface p-3 rounded-lg border border-outline-variant/50">
                <span className="text-[10px] font-label-caps text-on-surface-variant">CHỌN GIÁ TRỊ ĐIỂM:</span>
                <div className="flex gap-2 w-full">
                  <button onClick={() => socket.emit('admin_r4_set_question', { value: 20 })} className="flex-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 py-2 rounded font-bold text-xs transition-colors">20 Điểm</button>
                  <button onClick={() => socket.emit('admin_r4_set_question', { value: 30 })} className="flex-1 bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 py-2 rounded font-bold text-xs transition-colors">30 Điểm</button>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => {
                      const duration = rs?.currentQuestionValue === 30 ? 20 : 15;
                      socket.emit('admin_r4_start_timer', { duration });
                    }} 
                    className="flex-1 bg-amber-600/20 text-amber-500 border border-amber-600/50 py-2 rounded font-bold hover:bg-amber-600 hover:text-white transition-colors text-xs"
                    disabled={!rs?.currentQuestionValue}
                  >
                    PHÁT CÂU HỎI & TÍNH GIỜ ({rs?.currentQuestionValue === 30 ? '20s' : '15s'})
                  </button>
                </div>
                {/* Judging */}
                <span className="text-[10px] font-label-caps text-on-surface-variant mt-1 border-t border-outline-variant/30 pt-3">CHẤM ĐIỂM:</span>
                {rs?.stealPhase ? (
                   <div className="flex flex-col gap-2 bg-error/10 p-2 rounded border border-error/30">
                     <span className="font-bold text-error text-[11px] text-center">GIÀNH QUYỀN: {rs?.buzzedPlayer || 'Đang chờ...'}</span>
                     
                     {!rs?.buzzedPlayer && rs?.bellLocked && (
                        <button onClick={() => socket.emit('admin_r4_open_steal_bell')} className="w-full bg-blue-600/20 text-blue-500 border border-blue-600/50 py-1.5 rounded font-bold text-[11px] hover:bg-blue-600 hover:text-white transition-colors">
                          MỞ CHUÔNG CƯỚP ĐIỂM (5s)
                        </button>
                     )}

                     {rs?.buzzedPlayer && (
                       <div className="flex gap-2">
                        <button onClick={() => socket.emit('admin_r4_judge_steal', { correct: true })} className="flex-1 bg-green-600/20 text-green-500 border border-green-600/50 py-1.5 rounded font-bold text-[11px] hover:bg-green-600 hover:text-white">ĐÚNG CƯỚP</button>
                        <button onClick={() => socket.emit('admin_r4_judge_steal', { correct: false })} className="flex-1 bg-red-600/20 text-red-500 border border-red-600/50 py-1.5 rounded font-bold text-[11px] hover:bg-red-600 hover:text-white">SAI CƯỚP</button>
                       </div>
                     )}
                   </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button onClick={() => socket.emit('admin_r4_judge_main', { correct: true })} className="flex-1 bg-green-600/20 text-green-500 border border-green-600/50 py-1.5 rounded font-bold hover:bg-green-600 hover:text-white transition-colors text-xs">ĐÚNG</button>
                    <button onClick={() => socket.emit('admin_r4_judge_main', { correct: false })} className="flex-1 bg-red-600/20 text-red-500 border border-red-600/50 py-1.5 rounded font-bold hover:bg-red-600 hover:text-white transition-colors text-xs">SAI</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Manager Modal */}
      {isQuestionManagerOpen && (
        <AdminQuestionManager onClose={() => setIsQuestionManagerOpen(false)} />
      )}
    </div>
  );
}
