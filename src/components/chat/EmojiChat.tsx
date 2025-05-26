import React, { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { ChatMessages } from './ChatMessages';
import { useChat } from '../../hooks/useChat';
import { MinusSquare, Maximize2 } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';

export const EmojiChat: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const { isConnected } = useWallet();
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl transition-all duration-300 ${
      isMinimized ? 'h-12' : 'h-[32rem]'
    }`}>
      <div 
        className="p-3 bg-purple-600 text-white rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="font-bold">Emoji Chat</h3>
        <button 
          className="hover:bg-purple-700 rounded p-1"
          aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
        >
          {isMinimized ? <Maximize2 size={18} /> : <MinusSquare size={18} />}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-3rem)]">
          <ChatMessages messages={messages} isLoading={isLoading} />
          {isConnected ? (
            <EmojiPicker onSend={sendMessage} />
          ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50">
              Connect your wallet to chat
            </div>
          )}
        </div>
      )}
    </div>
  );
};