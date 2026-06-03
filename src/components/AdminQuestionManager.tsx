"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";
import toast from "react-hot-toast";

export default function AdminQuestionManager({ onClose }: { onClose: () => void }) {
  const { questions, fetchQuestions, saveQuestions } = useSocket();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (questions) {
      setJsonText(JSON.stringify(questions, null, 2));
    }
  }, [questions]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      saveQuestions(parsed);
      toast.success("Đã lưu ngân hàng câu hỏi thành công!");
      onClose();
    } catch (e) {
      setError("Lỗi cú pháp JSON! Vui lòng kiểm tra lại dấu phẩy, ngoặc kép.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container glass-card w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col border border-outline-variant shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-variant/30">
          <h2 className="font-headline-lg text-xl flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">database</span>
            QUẢN LÝ NGÂN HÀNG CÂU HỎI (JSON)
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col gap-2">
          <p className="text-sm text-on-surface-variant mb-2">
            Đây là hệ cơ sở dữ liệu gốc của trò chơi. Bạn có thể tự do copy/paste nội dung. Hãy cẩn thận giữ đúng cấu trúc các dấu ngoặc nhọn <code className="bg-surface px-1">{"{ }"}</code> và ngoặc vuông <code className="bg-surface px-1">{"[ ]"}</code>.
          </p>
          
          <textarea 
            className="w-full flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded border border-outline-variant/30 font-mono text-sm outline-none focus:border-primary resize-none shadow-inner"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck="false"
          />
          
          {error && (
            <div className="text-error bg-error/10 p-2 rounded text-sm font-bold flex items-center gap-2 border border-error/30 mt-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-variant/30 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded font-label-caps text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            HUỶ BỎ
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded font-label-caps bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(165,28,48,0.3)]"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            LƯU DỮ LIỆU
          </button>
        </div>
      </div>
    </div>
  );
}
