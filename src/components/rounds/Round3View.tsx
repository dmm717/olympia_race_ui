"use client";

import { useSocket } from "../SocketProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function Round3View() {
  const { socket, gameState, role } = useSocket();
  const rs = gameState?.roundState;
  const [timeLeft, setTimeLeft] = useState(0);
  const [myAnswer, setMyAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Drag Drop State
  const [slots, setSlots] = useState<(any | null)[]>([]);
  const [dndOptions, setDndOptions] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handleTick = (time: number) => setTimeLeft(time);
    const handleAck = () => {
      setHasSubmitted(true);
      toast.success("Hệ thống đã ghi nhận đáp án!", {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          padding: '16px 24px',
          borderRadius: '12px'
        }
      });
    };

    socket.on('timer_tick', handleTick);
    socket.on('submission_accepted', handleAck);
    return () => {
      socket.off('timer_tick', handleTick);
      socket.off('submission_accepted', handleAck);
    };
  }, [socket]);

  // Khởi tạo DND Options khi câu hỏi thay đổi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if ((gameState?.currentQuestion?.type === 'drag_drop' || gameState?.currentQuestion?.type === 'drag_drop_match') && gameState.currentQuestion.options) {
      setDndOptions([...gameState.currentQuestion.options]);
      setSlots(new Array(gameState.currentQuestion.options.length).fill(null));
    }
  }, [gameState?.currentQuestion]);

  // Reset answer when new round/question starts
  useEffect(() => {
    if (rs && !rs.bellLocked && rs.submissions?.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMyAnswer("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSubmitted(false);

      // Reset DND if it was already manipulated before
      if ((gameState?.currentQuestion?.type === 'drag_drop' || gameState?.currentQuestion?.type === 'drag_drop_match') && gameState.currentQuestion.options) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDndOptions([...gameState.currentQuestion.options]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlots(new Array(gameState.currentQuestion.options.length).fill(null));
      }
    }
  }, [rs?.bellLocked, rs?.submissions, gameState?.currentQuestion]);

  // Tự cập nhật myAnswer cho DND
  useEffect(() => {
    if (gameState?.currentQuestion?.type === 'drag_drop') {
      const ans = slots.map(s => s || "").join(',');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMyAnswer(ans);
    } else if (gameState?.currentQuestion?.type === 'drag_drop_match') {
      const ans = slots.map(s => s ? s.id : "").join(',');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMyAnswer(ans);
    }
  }, [slots, gameState?.currentQuestion]);

  if (!rs) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (myAnswer.trim() && !isLocked) {
      socket?.emit('submit_answer', { answer: myAnswer.trim() });
    }
  };

  const isLocked = rs.bellLocked;
  const q = gameState?.currentQuestion;
  const isMediaLayout = q?.type === 'image' || q?.type === 'video';
  const isDragDrop = q?.type === 'drag_drop';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (gameState?.currentQuestion?.type === 'drag_drop_match' || gameState?.currentQuestion?.type === 'drag_drop') {
          // Chỉ nộp bài khi tất cả các ô trống đã được điền
          if (!isLocked && !slots.some(s => s === null)) {
            handleSubmit();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, slots, myAnswer, gameState?.currentQuestion]);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    const payload = typeof item === 'string' ? item : JSON.stringify(item);
    e.dataTransfer.setData('text/plain', payload);
  };

  const handleDropSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isLocked) return;
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    let item: any = data;
    try {
      if (data.startsWith('{')) item = JSON.parse(data);
    } catch (err) { }

    const newSlots = [...slots];
    const newOptions = [...dndOptions];

    // If target has item, push it back to options
    if (newSlots[index]) {
      newOptions.push(newSlots[index]);
    }

    newSlots[index] = item;

    // Remove from options or other slot
    // For objects, we need to compare IDs
    const isObject = typeof item === 'object';
    const optIdx = newOptions.findIndex(o => isObject ? o.id === item.id : o === item);
    if (optIdx > -1) {
      newOptions.splice(optIdx, 1);
    } else {
      const oldSlotIdx = slots.findIndex(s => s && (isObject ? s.id === item.id : s === item));
      if (oldSlotIdx > -1) newSlots[oldSlotIdx] = null;
    }

    setSlots(newSlots);
    setDndOptions(newOptions);
  };

  const renderTimer = () => (
    <div className="flex flex-col items-center mb-6 z-10 w-full">
      <div className="text-sm font-label-caps text-on-surface-variant mb-1 tracking-[0.3em]">THỜI GIAN CÒN LẠI</div>
      <motion.div
        animate={{ scale: timeLeft <= 5 && timeLeft > 0 ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`text-[60px] md:text-[80px] leading-none font-display-lg ${timeLeft <= 5 ? 'text-error drop-shadow-[0_0_20px_rgba(255,180,171,0.8)]' : 'text-secondary drop-shadow-[0_0_15px_rgba(233,193,118,0.3)]'}`}
      >
        {timeLeft}
      </motion.div>
    </div>
  );

  const isDragDropMatch = q?.type === 'drag_drop_match';

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full relative p-4 overflow-hidden">
      <h3 className="font-headline-xl text-2xl uppercase mb-4 z-10 text-primary">TĂNG TỐC {q ? `- CÂU ${(rs.questionIndex || 0) + 1}` : ''}</h3>

      {!q ? (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant text-2xl opacity-50 font-bold tracking-widest">
          ĐANG CHỜ CÂU HỎI...
        </div>
      ) : isMediaLayout ? (
        <div className="flex w-full h-full gap-6">
          {/* Cột trái: Media */}
          <div className="w-1/2 flex items-center justify-center border-r border-outline-variant/30 pr-6 relative">
            {rs.mediaVisible && q.mediaUrl ? (
              q.type === 'video' ? (
                // @ts-ignore
                <video src={q.mediaUrl} controls autoPlay referrerPolicy="no-referrer" className="w-full max-h-[60vh] rounded-2xl border-2 border-secondary shadow-[0_0_30px_rgba(233,193,118,0.2)] object-contain bg-black" />
              ) : (
                <img src={q.mediaUrl} alt="Question Media" referrerPolicy="no-referrer" className="w-full max-h-[60vh] rounded-2xl border-2 border-secondary shadow-[0_0_30px_rgba(233,193,118,0.2)] object-contain bg-black" />
              )
            ) : (
              <div className="w-full h-[60vh] flex items-center justify-center bg-surface-variant/30 rounded-2xl border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30">
                  {q.type === 'video' ? 'movie' : 'image'}
                </span>
              </div>
            )}
          </div>
          {/* Cột phải: Câu hỏi & Input */}
          <div className="w-1/2 flex flex-col items-center justify-center pl-6">
            {renderTimer()}
            <div className="glass-card w-full p-6 rounded-2xl border border-primary/50 text-center mb-8 shadow-[0_0_20px_rgba(165,28,48,0.2)] flex flex-col items-center z-10">
              <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
                {q.text}
              </h2>
            </div>

            {role === 'user' && (
              <div className="w-full mt-auto">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={myAnswer}
                    onChange={(e) => setMyAnswer(e.target.value)}
                    disabled={isLocked || hasSubmitted}
                    placeholder={isLocked ? "HẾT THỜI GIAN NHẬP" : "Nhập đáp án..."}
                    className="w-full glass-card text-center text-3xl py-4 rounded-xl border border-primary/30 focus:border-primary outline-none text-on-surface uppercase font-bold disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLocked || hasSubmitted || !myAnswer.trim()}
                    className="bg-primary-container text-on-primary-container py-3 rounded-xl font-headline-lg text-lg tracking-wider disabled:opacity-30 border-b-4 border-primary-fixed-dim active:border-b-0 active:translate-y-1"
                  >
                    {hasSubmitted ? "ĐÃ NỘP BÀI" : "CHỐT ĐÁP ÁN"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : isDragDropMatch ? (
        <div className="flex flex-col w-full h-full items-center">
          {renderTimer()}
          <div className="glass-card w-full max-w-4xl p-4 rounded-2xl border border-primary/50 text-center mb-4 shadow-[0_0_20px_rgba(165,28,48,0.2)]">
            <h2 className="text-xl font-headline-lg text-on-surface leading-relaxed">
              {q.text}
            </h2>
          </div>

          {role === 'user' && (
            <div className="w-full max-w-5xl flex flex-col items-center gap-6">
              {/* Lưới Label + Slot */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full px-4">
                {q.labels?.map((label: string, idx: number) => (
                  <div key={`label-slot-${idx}`} className="flex flex-col items-center gap-2">
                    <span className="font-bold text-lg text-on-surface">{label}</span>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropSlot(e, idx)}
                      onClick={() => {
                        const item = slots[idx];
                        if (isLocked || !item) return;
                        const newSlots = [...slots];
                        newSlots[idx] = null;
                        setSlots(newSlots);
                        setDndOptions([...dndOptions, item]);
                      }}
                      className="w-full h-[120px] bg-surface-variant/30 rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center p-2 transition-colors hover:border-primary cursor-pointer relative"
                    >
                      {slots[idx] ? (
                        <div
                          draggable={!isLocked}
                          onDragStart={(e) => handleDragStart(e, slots[idx])}
                          className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing shadow-lg overflow-hidden flex items-center justify-center bg-black/10"
                        >
                          <img src={slots[idx].url} alt={slots[idx].id} className="w-full h-full object-contain pointer-events-none" />
                          <span className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded font-bold">{slots[idx].id}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant opacity-30 text-sm">{isLocked ? "ĐANG KHÓA" : "Click / Thả ảnh vào đây"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lưới hình ảnh (Options) */}
              <div className="w-full flex gap-4 min-h-[140px] bg-surface-variant/10 p-4 rounded-2xl border border-outline-variant/30 relative mt-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isLocked || hasSubmitted) return;
                  const data = e.dataTransfer.getData('text/plain');
                  if (!data) return;
                  let item: any = data;
                  try { if (data.startsWith('{')) item = JSON.parse(data); } catch (err) { }
                  const oldSlotIdx = slots.findIndex(s => s && s.id === item.id);
                  if (oldSlotIdx > -1) {
                    const newSlots = [...slots];
                    newSlots[oldSlotIdx] = null;
                    setSlots(newSlots);
                    setDndOptions([...dndOptions, item]);
                  }
                }}
              >
                <span className="absolute -top-3 left-6 bg-background px-2 text-xs font-bold text-on-surface-variant">
                  ẢNH ĐỂ CHỌN (Click để đưa lên ô trống)
                </span>
                {dndOptions.map((item, idx) => (
                  <div
                    key={`opt-img-${item.id}`}
                    draggable={!isLocked}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => {
                      if (isLocked) return;
                      const emptySlotIdx = slots.findIndex(s => s === null);
                      if (emptySlotIdx > -1) {
                        const newSlots = [...slots];
                        newSlots[emptySlotIdx] = item;
                        setSlots(newSlots);
                        const newOpts = [...dndOptions];
                        newOpts.splice(idx, 1);
                        setDndOptions(newOpts);
                      }
                    }}
                    className="flex-1 max-w-[200px] h-[120px] bg-surface text-on-surface border border-outline-variant rounded-lg flex items-center justify-center cursor-pointer p-1 text-center hover:scale-105 transition-transform shadow-md overflow-hidden relative mx-auto"
                  >
                    <img src={item.url} alt={item.id} className="w-full h-full object-contain pointer-events-none" />
                    <span className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded font-bold">{item.id}</span>
                  </div>
                ))}
              </div>
              
              <div className="fixed bottom-8 right-8 z-50">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isLocked || slots.some(s => s === null)}
                  className={`px-8 py-4 rounded-xl font-headline-lg text-xl tracking-wider transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-b-4 active:border-b-0 active:translate-y-1 ${
                    hasSubmitted
                      ? "bg-green-600 text-white border-green-800"
                      : "bg-primary text-on-primary border-primary-fixed-dim"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">{hasSubmitted ? "check_circle" : "send"}</span>
                    <span>{hasSubmitted ? "ĐÃ NỘP BÀI" : "CHỐT ĐÁP ÁN"}</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isDragDrop ? (
        <div className="flex flex-col w-full h-full items-center">
          {renderTimer()}
          <div className="glass-card w-full max-w-4xl p-6 rounded-2xl border border-primary/50 text-center mb-8 shadow-[0_0_20px_rgba(165,28,48,0.2)]">
            <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
              {q.text}
            </h2>
          </div>

          {role === 'user' && (
            <div className="w-full max-w-5xl flex flex-col items-center gap-10">
              {/* SLOTS (Answers) */}
              <div className="w-full flex gap-4 bg-surface-variant/30 p-6 rounded-2xl border border-outline-variant/50 relative">
                <span className="absolute -top-3 left-6 bg-background px-2 text-xs font-bold text-secondary">
                  {isLocked ? "ĐANG KHÓA" : "KHUNG ĐÁP ÁN (Kéo thả hoặc Click)"}
                </span>
                {slots.map((item, idx) => (
                  <div
                    key={`slot-${idx}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropSlot(e, idx)}
                    onClick={() => {
                      if (isLocked || hasSubmitted || !item) return;
                      // Move back to options
                      const newSlots = [...slots];
                      newSlots[idx] = null;
                      setSlots(newSlots);
                      setDndOptions([...dndOptions, item]);
                    }}
                    className="flex-1 min-h-[80px] bg-surface rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center p-2 transition-colors hover:border-primary cursor-pointer"
                  >
                    {item && (
                      <div
                        draggable={!isLocked && !hasSubmitted}
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="w-full h-full bg-primary/20 text-primary border border-primary/50 rounded-lg flex items-center justify-center font-bold text-lg cursor-grab active:cursor-grabbing p-2 text-center"
                      >
                        {item}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* OPTIONS (Draggables) */}
              <div className="w-full flex gap-4 min-h-[100px] bg-surface-variant/10 p-6 rounded-2xl border border-outline-variant/30 relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isLocked || hasSubmitted) return;
                  const item = e.dataTransfer.getData('text/plain');
                  if (!item) return;
                  const oldSlotIdx = slots.indexOf(item);
                  if (oldSlotIdx > -1) {
                    const newSlots = [...slots];
                    newSlots[oldSlotIdx] = null;
                    setSlots(newSlots);
                    setDndOptions([...dndOptions, item]);
                  }
                }}
              >
                <span className="absolute -top-3 left-6 bg-background px-2 text-xs font-bold text-on-surface-variant">
                  LỰA CHỌN KÉO THẢ (Click để chọn nhanh)
                </span>
                {dndOptions.map((item, idx) => (
                  <div
                    key={`opt-${idx}`}
                    draggable={!isLocked && !hasSubmitted}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => {
                      if (isLocked || hasSubmitted) return;
                      const emptySlotIdx = slots.findIndex(s => s === null);
                      if (emptySlotIdx > -1) {
                        const newSlots = [...slots];
                        newSlots[emptySlotIdx] = item;
                        setSlots(newSlots);
                        const newOpts = [...dndOptions];
                        newOpts.splice(idx, 1);
                        setDndOptions(newOpts);
                      }
                    }}
                    className="flex-1 bg-surface-variant text-on-surface-variant border border-outline-variant rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer p-4 text-center hover:bg-surface-variant/80 transition-all shadow-md"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={isLocked || hasSubmitted || slots.includes(null)}
                className="w-full max-w-sm bg-primary-container text-on-primary-container py-3 rounded-xl font-headline-lg text-lg tracking-wider disabled:opacity-30 border-b-4 border-primary-fixed-dim active:border-b-0 active:translate-y-1 mt-4"
              >
                {hasSubmitted ? "ĐÃ NỘP BÀI" : "CHỐT ĐÁP ÁN (KÉO XONG MỚI CHỐT)"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {renderTimer()}
          <div className="glass-card w-full max-w-4xl p-6 rounded-2xl border border-primary/50 text-center mb-8 shadow-[0_0_20px_rgba(165,28,48,0.2)]">
            <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
              {q.text}
            </h2>
          </div>
          {role === 'user' && (
            <div className="w-full max-w-xl">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  disabled={isLocked || hasSubmitted}
                  placeholder={isLocked ? "HẾT THỜI GIAN NHẬP" : "Nhập đáp án..."}
                  className="w-full glass-card text-center text-3xl py-4 rounded-xl border border-primary/30 focus:border-primary outline-none text-on-surface uppercase font-bold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLocked || hasSubmitted || !myAnswer.trim()}
                  className="bg-primary-container text-on-primary-container py-3 rounded-xl font-headline-lg text-lg tracking-wider disabled:opacity-30 border-b-4 border-primary-fixed-dim active:border-b-0 active:translate-y-1"
                >
                  {hasSubmitted ? "ĐÃ NỘP BÀI" : "CHỐT ĐÁP ÁN"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Admin Panel hiển thị kết quả */}
      {role === 'admin' && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-surface-variant/90 backdrop-blur-md p-4 rounded-xl border border-outline-variant shadow-2xl">
          <h4 className="font-label-caps text-on-surface-variant mb-2 text-xs">KẾT QUẢ CỦA THÍ SINH</h4>
          <div className="flex gap-4 overflow-x-auto">
            {gameState?.players?.map((p: { username: string }) => {
              const sub = rs.submissions?.find((s: { username: string, answer: string, timeMs: number }) => s.username === p.username);
              return (
                <div key={p.username} className="min-w-[150px] bg-surface p-2 rounded flex flex-col items-center">
                  <span className="font-bold text-xs text-secondary">{p.username}</span>
                  {sub ? (
                    <>
                      <span className="font-bold text-sm text-on-surface uppercase text-center mt-1">{sub.answer}</span>
                      <span className="text-[10px] text-on-surface-variant mt-1">{(sub.timeMs / 1000).toFixed(2)}s</span>
                    </>
                  ) : (
                    <span className="italic text-on-surface-variant/50 text-[10px] mt-1">Chưa nộp</span>
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
