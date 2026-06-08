"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface RoundState {
  part?: 'personal' | 'common';
  isPaused?: boolean;
  questionIndex?: number;
  mediaVisible?: boolean;
  buzzedPlayer?: string | null;
  bellLocked?: boolean;
  openedRows?: number[];
  obstacleBuzzedPlayers?: string[];
  obstacleSolved?: boolean;
  submissions?: { username: string; answer: string; timeMs: number; judged?: 'correct' | 'wrong' }[];
  currentPlayerIndex: number;
  currentQuestionValue: number;
  hopeStarActive?: boolean;
  hopeStarUsed?: boolean;
  stealPhase?: boolean;
  eliminatedPlayers?: string[];
  eliminatedFromSteal?: string[];
}

export interface GameState {
  gameMode?: 'manual' | 'auto';
  round: number;
  status: string;
  currentQuestion?: any;
  players: { username: string; score: number }[];
  roundState: RoundState;
  questions?: any;
}

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState | null;
  isConnected: boolean;
  username: string;
  role: string;
  questions: any;
  connect: (username: string, role: string) => void;
  disconnect: () => void;
  fetchQuestions: () => void;
  saveQuestions: (newQuestions: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [questions, setQuestions] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const fetchQuestions = () => {
    if (socket && role === 'admin') {
      socket.emit('admin_get_questions');
    }
  };

  const saveQuestions = (newQuestions: any) => {
    if (socket && role === 'admin') {
      socket.emit('admin_save_questions', { questions: newQuestions });
    }
  };

  const connect = (newUsername: string, newRole: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setUsername(newUsername);
    setRole(newRole);
    
    // Lưu vào localStorage để chống mất đăng nhập khi reload
    localStorage.setItem('olympia_username', newUsername);
    localStorage.setItem('olympia_role', newRole);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      query: { username: newUsername, role: newRole },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Đã kết nối đến máy chủ trò chơi');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Đã ngắt kết nối khỏi máy chủ');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      setIsConnected(false);
      toast.error('Không thể kết nối đến máy chủ. Đang thử lại...');
    });

    newSocket.on('auth_error', (msg: string) => {
      toast.error(msg);
      newSocket.disconnect();
    });

    newSocket.on('sync_state', (state: GameState) => {
      console.log('Received new state:', state);
      setGameState(state);
    });

    newSocket.on('notification', (data: { message: string, type: 'success' | 'error' | 'info' }) => {
      if (data.type === 'success') {
        toast.success(data.message, { duration: 4000 });
      } else if (data.type === 'error') {
        toast.error(data.message, { duration: 4000 });
      } else {
        toast(data.message, { icon: 'ℹ️', duration: 4000 });
      }
    });

    newSocket.on('sync_questions', (data: any) => {
      console.log('Received new questions:', data);
      setQuestions(data);
    });

    // Helper: Play Olympia-style bell "ding" sound
    const playOlympiaBell = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const t = ctx.currentTime;

        // Olympia bell: bright metallic "DING" with harmonics
        const freqs = [880, 1760, 2640, 3520]; // A5 + harmonics
        const gains = [0.35, 0.15, 0.08, 0.04]; // decreasing volume per harmonic
        const decays = [1.2, 0.8, 0.5, 0.3]; // ring-out duration

        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(gains[i], t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + decays[i]);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + decays[i]);
        });

        // Add a short click/strike transient for realism
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(4000, t);
        clickOsc.frequency.exponentialRampToValueAtTime(500, t + 0.02);
        clickGain.gain.setValueAtTime(0.3, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(t);
        clickOsc.stop(t + 0.05);
      } catch (e) {
        console.error('Audio play error:', e);
      }
    };

    newSocket.on('bell_buzzed', (data: { username: string }) => {
      playOlympiaBell();
    });

    newSocket.on('obstacle_buzzed', (data: { username: string }) => {
      playOlympiaBell();
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setIsConnected(false);
    setGameState(null);
    setUsername('');
    setRole('');
    localStorage.removeItem('olympia_username');
    localStorage.removeItem('olympia_role');
  };

  useEffect(() => {
    // Tự động khôi phục đăng nhập khi reload trang
    const savedUser = localStorage.getItem('olympia_username');
    const savedRole = localStorage.getItem('olympia_role');
    if (savedUser && savedRole && !socketRef.current) {
      connect(savedUser, savedRole);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi mount

  return (
    <SocketContext.Provider value={{ socket, gameState, questions, isConnected, username, role, connect, disconnect, fetchQuestions, saveQuestions }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
