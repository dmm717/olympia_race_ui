"use client";

import React, { useState } from "react";
import { useSocket } from "@/components/SocketProvider";
import GameArena from "@/components/GameArena";
import { motion } from "framer-motion";

export default function GamePage() {
  const { isConnected, connect } = useSocket();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user"); // "user" | "admin"

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username.trim(), role);
    }
  };

  if (isConnected) {
    return <GameArena />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/20 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-md w-full z-10 rounded-2xl border border-outline-variant/30"
      >
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-5xl text-primary mb-4 star-shine">
            rocket_launch
          </span>
          <h1 className="font-headline-xl text-3xl uppercase text-on-surface">VÀO ĐẤU TRƯỜNG</h1>
          <p className="text-on-surface-variant font-body-md mt-2">
            Nhập tên của bạn để tham gia Dialectic Summit
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-label-caps text-on-surface-variant mb-2">TÊN THÍ SINH</label>
            <input
              type="text"
              required
              className="w-full bg-surface-container/50 border border-outline-variant/50 focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-colors"
              placeholder="Nhập tên..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-label-caps text-on-surface-variant mb-2">VAI TRÒ</label>
            <select
              className="w-full bg-surface-container/50 border border-outline-variant/50 focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-colors appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Thí sinh (User)</option>
              <option value="admin">Ban Tổ Chức (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-container text-secondary font-label-caps py-4 rounded-lg hover:shadow-[0_0_20px_rgba(165,28,48,0.5)] hover:-translate-y-1 transition-all duration-300 uppercase"
          >
            BẮT ĐẦU KẾT NỐI
          </button>
        </form>
      </motion.div>
    </div>
  );
}
