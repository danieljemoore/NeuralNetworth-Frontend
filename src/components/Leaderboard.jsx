import React, { useMemo } from 'react';
import { useWebSocket } from '../context/WebSocketProvider';

const Leaderboard = () => {
  const { players, stocks } = useWebSocket();

  // Compute each player's portfolio value
  const leaderboard = useMemo(() => {
    // Check if players exists
    if (!players || players.length === 0) return [];

    const computeValue = (playerData) => {
      // Assume the portfolio is stored as { funds, companies }
      // companies is an object mapping company identifiers to share counts.
      const portfolio = playerData.portfolio || {};
      let total = portfolio.funds || 0;
      if (portfolio.companies) {
        Object.entries(portfolio.companies).forEach(([company, shares]) => {
          // Lookup the company's stock price from your stocks array.
          const stock = stocks.find(
            (s) => s.ticker === company || s.name === company || s.id === company
          );
          const price = stock && stock.stockPrice ? stock.stockPrice : 10;
          total += shares * price;
        });
      }
      return total;
    };

    // Return players sorted in descending order based on portfolio value.
    return players
      .map(playerData => ({
        ...playerData,
        portfolioValue: computeValue(playerData)
      }))
      .sort((a, b) => b.portfolioValue - a.portfolioValue);
  }, [players, stocks]);

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Leaderboards</h3>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={entry.player} className="flex justify-between items-center py-1">
            <span className="text-gray-700">{index + 1}. {entry.player}</span>
            <span className="font-medium">{Math.round(entry.portfolioValue)} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;