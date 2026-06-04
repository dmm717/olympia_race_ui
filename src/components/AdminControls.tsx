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
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <h3 className="font-label-caps text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">settings_applications</span>
          ADMIN DASHBOARD (Vòng {gameState.round})
        </h3>
        <div className="flex items-center gap-2">
          <select 
            className="bg-surface border border-outline-variant rounded px-3 py-1 text-sm outline-none"
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
            className="bg-secondary text-on-secondary px-4 py-1 rounded font-label-caps text-xs hover:bg-secondary/80"
          >
            CHUYỂN VÒNG
          </button>
          <button 
            onClick={handleResetScore}
            className="bg-error/20 text-error px-4 py-1 rounded font-label-caps text-xs border border-error/50 hover:bg-error hover:text-on-error ml-4"
          >
            RESET TRẬN ĐẤU
          </button>
          <button 
            onClick={() => setIsQuestionManagerOpen(true)}
            className="bg-primary/20 text-primary px-4 py-1 rounded font-label-caps text-xs border border-primary/50 hover:bg-primary hover:text-on-primary ml-4 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">database</span>
            QUẢN LÝ CÂU HỎI
          </button>
        </div>
      </div>

      {/* Dual Mode Controls */}
      <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant/30 mb-2">
        <div className="flex items-center gap-4">
          <span className="font-label-caps text-sm text-on-surface-variant">Chế độ chơi:</span>
          <div className="flex bg-surface-variant rounded-lg p-1">
            <button 
              onClick={() => handleSetMode('manual')}
              className={`px-4 py-1 rounded text-sm font-bold transition-colors ${gameState.gameMode === 'manual' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:bg-surface'}`}
            >
              THỦ CÔNG (MC Chấm)
            </button>
            <button 
              onClick={() => handleSetMode('auto')}
              className={`px-4 py-1 rounded text-sm font-bold transition-colors ${gameState.gameMode === 'auto' ? 'bg-secondary text-on-secondary shadow' : 'text-on-surface-variant hover:bg-surface'}`}
            >
              TỰ ĐỘNG (Máy Chấm)
            </button>
          </div>
        </div>

        {gameState.gameMode === 'auto' && (
          <button 
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm border-2 transition-all ${
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            
            {/* Cột trái: Các Nút Điều Khiển */}
            <div className="flex flex-col gap-4 bg-surface-variant/10 p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
              
              {/* Khởi động riêng */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <span className="font-label-caps text-primary">KHỞI ĐỘNG RIÊNG:</span>
                <div className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-outline-variant/50 shadow-inner">
                  <span className="text-sm pl-2">Thí sinh:</span>
                  <select id="r1_player" className="bg-transparent outline-none border-b border-outline-variant/50 text-sm font-bold text-secondary">
                    {gameState.players.map((p, i) => <option key={i} value={i}>{p.username}</option>)}
                  </select>
                  <button 
                    onClick={() => {
                      const idx = (document.getElementById('r1_player') as HTMLSelectElement).value;
                      socket.emit('admin_start_personal_r1', { playerIndex: parseInt(idx) });
                    }}
                    className="btn-admin bg-surface-variant text-on-surface-variant py-1 px-4 ml-1 whitespace-nowrap hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    Bắt đầu {gameState.gameMode === 'auto' ? '(Auto)' : ''}
                  </button>
                </div>
              </div>

              {/* Khởi động chung */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <span className="font-label-caps text-primary">KHỞI ĐỘNG CHUNG:</span>
                <div className="flex gap-2">
                  <button onClick={() => socket.emit('admin_start_common_r1')} className="btn-admin bg-primary-container text-on-primary-container whitespace-nowrap shadow-sm hover:shadow-md">
                    Bắt đầu chung {gameState.gameMode === 'auto' ? '(Auto)' : ''}
                  </button>
                </div>
              </div>

              {/* Điều khiển Manual Mode */}
              {gameState.gameMode === 'manual' && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-label-caps bg-surface-variant px-3 py-1 rounded-full">ĐIỀU KHIỂN CHẤM ĐIỂM</span>
                    <button onClick={() => socket.emit('admin_next_question_r1')} className="btn-admin bg-secondary text-on-secondary py-1.5 px-6 text-sm font-bold shadow-md hover:bg-secondary/80 hover:scale-105 transition-transform flex items-center gap-1">
                      CÂU TIẾP THEO <span className="material-symbols-outlined text-sm">skip_next</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 bg-surface p-4 rounded-xl border border-outline-variant/50">
                    {rs?.part === 'personal' ? (
                      <>
                        <span className="font-bold text-primary flex items-center gap-2 mb-2 justify-center bg-primary/10 py-2 rounded-lg">
                          <span className="material-symbols-outlined text-lg">person</span>
                          {gameState.players[rs.currentPlayerIndex]?.username} đang thi
                        </span>
                        <div className="flex gap-3">
                          <button onClick={() => socket.emit('admin_judge', { correct: true })} className="bg-green-600/10 text-green-500 border-2 border-green-600/50 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all flex-1 shadow-sm">
                            ĐÚNG (+10)
                          </button>
                          <button onClick={() => socket.emit('admin_judge', { correct: false })} className="bg-red-600/10 text-red-500 border-2 border-red-600/50 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all flex-1 shadow-sm">
                            SAI (+0)
                          </button>
                        </div>
                      </>
                    ) : rs?.part === 'common' ? (
                      rs?.buzzedPlayer ? (
                        <>
                          <span className="font-bold text-primary flex items-center gap-2 mb-2 justify-center bg-primary-container text-on-primary-container py-2 rounded-lg shadow-inner">
                            <span className="material-symbols-outlined text-lg animate-bounce">notifications_active</span>
                            {rs.buzzedPlayer} giành quyền!
                          </span>
                          <div className="flex gap-3">
                            <button onClick={() => socket.emit('admin_judge', { correct: true })} className="bg-green-600/10 text-green-500 border-2 border-green-600/50 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all flex-1 shadow-sm">
                              ĐÚNG (+10)
                            </button>
                            <button onClick={() => socket.emit('admin_judge', { correct: false })} className="bg-red-600/10 text-red-500 border-2 border-red-600/50 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all flex-1 shadow-sm">
                              SAI (-5)
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-on-surface-variant text-sm italic w-full text-center py-6 opacity-60 flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
                          Đang chờ thí sinh bấm chuông...
                        </div>
                      )
                    ) : (
                      <div className="text-on-surface-variant text-sm italic w-full text-center py-6 opacity-60 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">info</span>
                        Vui lòng Bắt đầu một phần thi
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Câu hỏi hiển thị */}
            <div className="flex flex-col h-full">
              {gameState.currentQuestion ? (
                <div className="bg-surface p-8 rounded-2xl border-2 border-primary/30 w-full h-full flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                  <span className="text-secondary font-label-caps mb-6 flex items-center gap-2 text-lg">
                    <span className="material-symbols-outlined">help_center</span>
                    CÂU HỎI SỐ {(rs?.questionIndex || 0) + 1}
                  </span>
                  
                  <p className="font-headline-lg text-2xl md:text-3xl mb-8 flex-1 text-on-surface leading-relaxed relative z-10">
                    {gameState.currentQuestion.text}
                  </p>
                  
                  <div className="bg-green-900/20 border-l-8 border-green-500 p-5 rounded-r-xl text-green-400 font-bold text-xl flex flex-col gap-2 shadow-inner relative z-10">
                    <span className="text-xs font-label-caps text-green-500/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      ĐÁP ÁN ĐÚNG
                    </span>
                    <span>
                      {(() => {
                        const ans = gameState.currentQuestion.answer;
                        const opts = gameState.currentQuestion.options;
                        if (opts && opts.length > 0) {
                          const idx = opts.indexOf(ans);
                          if (idx >= 0) {
                            return `${String.fromCharCode(65 + idx)}: ${ans}`;
                          }
                        }
                        return ans;
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-surface/30 p-8 rounded-2xl border-2 border-outline-variant/30 border-dashed w-full h-full flex flex-col items-center justify-center opacity-40 min-h-[300px]">
                  <span className="material-symbols-outlined text-6xl mb-4">visibility_off</span>
                  <p className="font-label-caps text-xl tracking-widest">CHƯA CÓ CÂU HỎI</p>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState.round === 2 && (
          <>
            <button onClick={() => socket.emit('admin_start_round2')} className="btn-admin bg-primary-container text-on-primary-container">
              Bắt đầu Vòng 2 {gameState.gameMode === 'auto' ? '(Tự Động)' : ''}
            </button>
            {gameState.gameMode === 'manual' && (
              <>
                <div className="flex-1"></div>
                
                {/* Nút cộng điểm thủ công cho hàng ngang */}
                <div className="flex items-center gap-2 bg-surface p-2 rounded border border-outline-variant mr-4">
                  <span className="text-sm font-label-caps text-primary">CỘNG ĐIỂM HÀNG NGANG:</span>
                  <select 
                    value={r2AddScorePlayerIndex}
                    onChange={(e) => setR2AddScorePlayerIndex(parseInt(e.target.value))}
                    className="bg-transparent outline-none border-b border-outline-variant text-sm text-on-surface"
                  >
                    {gameState.players.map((p, i) => <option key={i} value={i}>{p.username}</option>)}
                  </select>
                  <button 
                    onClick={() => {
                      socket.emit('admin_add_score', { playerIndex: r2AddScorePlayerIndex, score: 10 });
                    }}
                    className="bg-green-600/20 text-green-400 border border-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition-colors text-sm font-bold shadow-sm"
                  >
                    +10 ĐIỂM
                  </button>
                </div>

                {rs?.buzzedPlayer && !rs?.obstacleBuzzedPlayer && (
                  <div className="flex items-center gap-4 bg-primary/20 p-2 rounded border border-primary/50 mb-2">
                    <span className="font-bold text-primary">🔔 {rs.buzzedPlayer} TRẢ LỜI HÀNG NGANG!</span>
                    <button onClick={() => socket.emit('admin_clear_buzzer_r2')} className="bg-red-600/20 text-red-400 border border-red-600 px-4 py-1 rounded hover:bg-red-600 hover:text-white">
                      HUỶ TÍN HIỆU
                    </button>
                  </div>
                )}

                {rs?.obstacleBuzzedPlayer ? (
                  <div className="flex items-center gap-4 bg-error/20 p-2 rounded border border-error/50">
                    <span className="font-bold text-error">⚠️ {rs.obstacleBuzzedPlayer} TRẢ LỜI CHƯỚNG NGẠI VẬT!</span>
                    <button onClick={() => socket.emit('admin_judge_obstacle', { correct: true })} className="bg-green-600/20 text-green-400 border border-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white">
                      ĐÚNG CNV
                    </button>
                    <button onClick={() => socket.emit('admin_judge_obstacle', { correct: false })} className="bg-red-600/20 text-red-400 border border-red-600 px-4 py-1 rounded hover:bg-red-600 hover:text-white">
                      SAI CNV (LOẠI)
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}

        {gameState.round === 3 && (
          <>
            <button onClick={() => socket.emit('admin_start_round3_question', { duration: 30 })} className="btn-admin bg-primary-container text-on-primary-container">
              Phát Câu Hỏi (30s)
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2 bg-surface p-2 rounded border border-outline-variant">
              <input type="text" id="r3_answer" placeholder="Đáp án đúng..." className="bg-transparent border-b border-outline-variant outline-none px-2 text-sm text-on-surface" />
              <button 
                onClick={() => {
                  const val = (document.getElementById('r3_answer') as HTMLInputElement).value;
                  socket.emit('admin_judge_round3', { correctAnswer: val });
                }} 
                className="bg-secondary text-on-secondary px-4 py-1 rounded hover:bg-secondary/80 font-label-caps text-xs"
              >
                CHẤM ĐIỂM
              </button>
            </div>
          </>
        )}

        {gameState.round === 4 && (
          <>
            <div className="flex items-center gap-2 bg-surface p-2 rounded border border-outline-variant">
              <span className="text-sm">Thí sinh:</span>
              <select id="r4_player" className="bg-transparent outline-none border-b border-outline-variant text-sm">
                {gameState.players.map((p, i) => <option key={i} value={i}>{p.username}</option>)}
              </select>
              <button 
                onClick={() => {
                  const idx = (document.getElementById('r4_player') as HTMLSelectElement).value;
                  socket.emit('admin_r4_start_turn', { playerIndex: parseInt(idx) });
                }}
                className="btn-admin bg-surface-variant"
              >
                VÀO THI
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => socket.emit('admin_r4_set_question', { value: 20 })} className="btn-admin bg-primary/20 text-primary border border-primary/50">Câu 20đ</button>
              <button onClick={() => socket.emit('admin_r4_set_question', { value: 30 })} className="btn-admin bg-secondary/20 text-secondary border border-secondary/50">Câu 30đ</button>
            </div>

            <div className="flex-1"></div>

            {/* Judging */}
            {rs?.stealPhase ? (
               <div className="flex items-center gap-4 bg-error/20 p-2 rounded border border-error/50">
                 <span className="font-bold text-error">GIÀNH QUYỀN TRẢ LỜI: {rs?.buzzedPlayer || 'Đang chờ...'}</span>
                 {rs?.buzzedPlayer && (
                   <>
                    <button onClick={() => socket.emit('admin_r4_judge_steal', { correct: true })} className="bg-green-600/20 text-green-400 border border-green-600 px-4 py-1 rounded">ĐÚNG CƯỚP</button>
                    <button onClick={() => socket.emit('admin_r4_judge_steal', { correct: false })} className="bg-red-600/20 text-red-400 border border-red-600 px-4 py-1 rounded">SAI CƯỚP</button>
                   </>
                 )}
               </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm">Chấm người chính:</span>
                <button onClick={() => socket.emit('admin_r4_judge_main', { correct: true })} className="bg-green-600/20 text-green-400 border border-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition-colors">ĐÚNG</button>
                <button onClick={() => socket.emit('admin_r4_judge_main', { correct: false })} className="bg-red-600/20 text-red-400 border border-red-600 px-4 py-1 rounded hover:bg-red-600 hover:text-white transition-colors">SAI</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Question Manager Modal */}
      {isQuestionManagerOpen && (
        <AdminQuestionManager onClose={() => setIsQuestionManagerOpen(false)} />
      )}
    </div>
  );
}
