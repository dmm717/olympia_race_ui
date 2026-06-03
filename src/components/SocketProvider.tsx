"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RoundState {
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
  round: number;
  status: string;
  players: { username: string; score: number }[];
  roundState: RoundState;
}

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState | null;
  isConnected: boolean;
  username: string;
  role: string;
  connect: (username: string, role: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const connect = (newUsername: string, newRole: string) => {
    setUsername(newUsername);
    setRole(newRole);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      query: { username: newUsername, role: newRole },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Game Server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from Game Server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      setIsConnected(false);
      alert('Không thể kết nối đến máy chủ. Đang thử lại...');
    });

    newSocket.on('auth_error', (msg: string) => {
      alert(msg);
      newSocket.disconnect();
    });

    newSocket.on('sync_state', (state: GameState) => {
      console.log('Received new state:', state);
      setGameState(state);
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
    <SocketContext.Provider value={{ socket, gameState, isConnected, username, role, connect, disconnect }}>
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
