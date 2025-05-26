import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useWallet } from './useWallet';
import { validateEmojis } from '../utils/emojiValidation';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false }) // Changed to descending order
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev;
            const updatedMessages = [newMessage, ...prev].slice(0, 100);
            return updatedMessages;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    loadInitialMessages();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [setupRealtimeSubscription]);

  const sendMessage = useCallback(async (emojis: string[]) => {
    if (!address || emojis.length === 0) return;

    const validatedEmojis = validateEmojis(emojis);
    if (validatedEmojis.length === 0) return;

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: address,
      emojis: validatedEmojis,
      created_at: new Date().toISOString()
    };

    // Add optimistic message at the beginning
    setMessages(prev => [optimisticMessage, ...prev].slice(0, 100));

    try {
      const { error, data } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: address,
          emojis: validatedEmojis,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? data : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  }, [address]);

  return { messages, sendMessage, isLoading };
}