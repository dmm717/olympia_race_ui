"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface RoundState {
  isPaused?: boolean;
  questionIndex?: number;
  buzzedPlayer?: string | null;
  bellLocked?: boolean;
  openedRows?: number[];
  obstacleBuzzedPlayer?: string | null;
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
    setUsername(newUsername);
    setRole(newRole);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      query: { username: newUsername, role: newRole },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
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

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setIsConnected(false);
    setGameState(null);
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

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
