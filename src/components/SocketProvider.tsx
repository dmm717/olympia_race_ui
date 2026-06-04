"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface RoundState {
  part?: 'personal' | 'common';
  isPaused?: boolean;
  questionIndex?: number;
  buzzedPlayer?: string | null;
  bellLocked?: boolean;
  openedRows?: number[];
  obstacleBuzzedPlayer?: string | null;
  obstacleSolved?: boolean;
  submissions?: { username: string; answer: string; timeMs: number }[];
  currentPlayerIndex: number;
  currentQuestionValue: number;
  hopeStarActive?: boolean;
  stealPhase?: boolean;
  eliminatedPlayers?: string[];
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

    newSocket.on('bell_buzzed', (data: { username: string }) => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch(e) {
        console.error('Audio play error:', e);
      }
    });

    newSocket.on('obstacle_buzzed', (data: { username: string }) => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
          
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch(e) {
        console.error('Audio play error:', e);
      }
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
