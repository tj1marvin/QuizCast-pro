
import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizState, GameStatus, SyncMessage } from '../types';

const CHANNEL_NAME = 'quiz_cast_pro_channel';

const INITIAL_STATE: QuizState = {
  questions: [],
  currentQuestionIndex: -1,
  status: GameStatus.IDLE,
  lastUpdate: Date.now(),
  animationStyle: 'slide'
};

export const useQuizSync = (mode: 'manager' | 'presenter') => {
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem(CHANNEL_NAME);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    
    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      if (event.data.type === 'SYNC_STATE') {
        setState(event.data.payload);
      }
    };

    channelRef.current.onmessage = handleMessage;

    return () => {
      channelRef.current?.close();
    };
  }, []);

  const updateState = useCallback((newState: Partial<QuizState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState, lastUpdate: Date.now() };
      localStorage.setItem(CHANNEL_NAME, JSON.stringify(updated));
      channelRef.current?.postMessage({
        type: 'SYNC_STATE',
        payload: updated
      });
      return updated;
    });
  }, []);

  return { state, updateState };
};
