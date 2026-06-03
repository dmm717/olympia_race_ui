"use client";

import { useSocket } from "./SocketProvider";
import { useState } from "react";
import AdminQuestionManager from "./AdminQuestionManager";
import toast from "react-hot-toast";

export default function AdminControls() {
  const { socket, gameState } = useSocket();
  const [targetRound, setTargetRound] = useState("1");
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
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
          <>
            <button onClick={() => socket.emit('admin_start_common_r1')} className="btn-admin bg-primary-container text-on-primary-container">
              Bắt đầu Khởi động {gameState.gameMode === 'auto' ? '(Tự Động)' : 'chung'}
            </button>
            {gameState.gameMode === 'manual' && (
              <>
                <button onClick={() => socket.emit('admin_allow_bell')} className="btn-admin bg-surface-variant text-on-surface-variant">
                  MỞ KHÓA CHUÔNG
                </button>
                <div className="flex-1"></div>
                {rs?.buzzedPlayer ? (
                  <div className="flex items-center gap-4 bg-primary/10 p-2 rounded border border-primary/30">
                    <span className="font-bold text-primary">{rs.buzzedPlayer} đang trả lời!</span>
                    <button onClick={() => socket.emit('admin_judge', { correct: true })} className="bg-green-600/20 text-green-400 border border-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition-colors">
                      ĐÚNG (+10)
                    </button>
                    <button onClick={() => socket.emit('admin_judge', { correct: false })} className="bg-red-600/20 text-red-400 border border-red-600 px-4 py-1 rounded hover:bg-red-600 hover:text-white transition-colors">
                      SAI (-5)
                    </button>
                  </div>
                ) : (
                  <span className="text-on-surface-variant text-sm italic">Chưa ai bấm chuông...</span>
                )}
              </>
            )}
          </>
        )}

        {gameState.round === 2 && (
          <>
            <button onClick={() => socket.emit('admin_start_round2')} className="btn-admin bg-primary-container text-on-primary-container">
              Bắt đầu Vòng 2 {gameState.gameMode === 'auto' ? '(Tự Động)' : ''}
            </button>
            {gameState.gameMode === 'manual' && (
              <>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(row => (
                    <button 
                      key={row}
                      onClick={() => socket.emit('admin_open_row', { rowId: row })} 
                      className={`btn-admin ${rs?.openedRows?.includes(row) ? 'bg-secondary text-on-secondary' : 'bg-surface-variant'}`}
                    >
                      Mở Hàng {row}
                    </button>
                  ))}
                </div>
                <div className="flex-1"></div>
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
