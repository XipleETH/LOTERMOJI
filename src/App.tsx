import React from 'react';
import { Timer } from './components/Timer';
import { Ticket as TicketComponent } from './components/Ticket';
import { TicketGenerator } from './components/TicketGenerator';
import { GameHistoryButton } from './components/GameHistoryButton';
import { EmojiChat } from './components/chat/EmojiChat';
import { WalletButton } from './components/web3/WalletButton';
import { Trophy } from 'lucide-react';
import { useGameState } from './hooks/useGameState';

function App() {
  const { gameState, generateTicket } = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🎰 LottoMoji 🎲
          </h1>
          <p className="text-white/90 text-xl mb-4">
            Match 4 emojis to win! 🏆
          </p>
          <p className="text-white/80">Next draw in:</p>
          <div className="flex justify-center mt-4">
            <Timer seconds={gameState.timeRemaining} />
          </div>
        </div>

        {gameState.lastResults && (
          <div className="mb-8 p-6 bg-white/90 rounded-xl backdrop-blur-sm shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
              <Trophy className="mr-2" /> Latest Results
            </h2>
            <div className="text-center mb-4">
              <p className="text-xl">{gameState.winningNumbers.join(' ')}</p>
            </div>
            {gameState.lastResults.firstPrize.length > 0 && (
              <div className="text-center text-green-600">
                🎉 First Prize Winner(s)! Check your tickets!
              </div>
            )}
          </div>
        )}

        <TicketGenerator
          onGenerateTicket={generateTicket}
          disabled={gameState.tickets.length >= 10}
          ticketCount={gameState.tickets.length}
          maxTickets={10}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.tickets.map(ticket => (
            <TicketComponent
              key={ticket.id}
              ticket={ticket}
              isWinner={
                gameState.lastResults?.firstPrize.includes(ticket) ? 'first' :
                gameState.lastResults?.secondPrize.includes(ticket) ? 'second' :
                gameState.lastResults?.thirdPrize.includes(ticket) ? 'third' : null
              }
            />
          ))}
        </div>
      </div>
      <WalletButton />
      <GameHistoryButton />
      <EmojiChat />
    </div>
  );
}

export default App;