// src/context/UserProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './WebSocketProvider';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { sendMessage, triggerApi, triggerGetApi, triggerPostApi, players, stocks } = useWebSocket();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Prevent overlapping calls

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUsername = localStorage.getItem('playerName');
    if (storedUsername && !currentUser && !isLoading) {
      setIsLoading(true);
      triggerGetApi(`portfolio?player=${storedUsername}`)
        .then((portfolioData) => {
          if (portfolioData) {
            // Portfolio exists, set user with data
            setCurrentUser({ username: storedUsername, portfolio: portfolioData });
          } else {
            // Portfolio doesn't exist, create it
            setCurrentUser({ username: storedUsername, portfolio: { companies: {} } });
            sendMessage({ event: 'portfolio_create', data: { player: storedUsername } });
          }
        })
        .catch((error) => {
          console.error('Error fetching portfolio:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [triggerApi, sendMessage]); // Remove currentUser and isLoading from dependencies

  // Update currentUser when players array changes - with player check to avoid infinite loop
  useEffect(() => {
    if (currentUser && currentUser.username && players.length > 0) {
      const playerData = players.find(p => p.player === currentUser.username);
      if (playerData && JSON.stringify(playerData) !== JSON.stringify(currentUser.portfolio)) {
        // Only update if the data is different to avoid infinite loops
        setCurrentUser(prev => ({
          ...prev,
          portfolio: playerData
        }));
      }
    }
  }, [players]);

  const login = (username) => {
    if (isLoading || currentUser?.username === username) return; // Avoid duplicate calls
    setIsLoading(true);
    localStorage.setItem('playerName', username);

    triggerGetApi(`portfolio?player=${username}`)
      .then((portfolioData) => {
        if (portfolioData) {
          // Portfolio exists, update state
          setCurrentUser({ username, portfolio: portfolioData });
        } else {
          // Portfolio doesn’t exist, create it
          setCurrentUser({ username, portfolio: [] });
          sendMessage({ event: 'portfolio_create', data: { player: username } });
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
      })
      .finally(() => setIsLoading(false));
  };

  const buyStock = (company, ticker, amount, price) => {
    if (!currentUser || isLoading) return; // Prevent action if not ready
    sendMessage({
      event: 'buy_stock',
      data: { player: currentUser.username, stock: company, amount },
    });
    console.log(`${currentUser.username} is Buying ${amount} of ${company} at ${price}`);

    // Assuming triggerPostApi exists in WebSocket provider
    triggerPostApi('trades', {
      player: currentUser.username,
      company,
      ticker,
      type: 'buy',
      amount,
      price,
      timestamp: new Date().toISOString(),
    });
  };

  const sellStock = (company, ticker, amount, price) => {
    if (!currentUser || isLoading) return; // Prevent action if not ready
    sendMessage({
      event: 'sell_stock',
      data: { player: currentUser.username, stock: company, amount },
    });
    console.log(`${currentUser.username} is Selling ${amount} of ${company} at ${price}`);

    // Assuming triggerPostApi exists in WebSocket provider
    triggerPostApi('trades', {
      player: currentUser.username,
      company,
      ticker,
      type: 'sell',
      amount,
      price,
      timestamp: new Date().toISOString(),
    });
  };

  // Use useCallback to memoize this function to prevent it from causing re-renders
  const getPortfolioValue = useCallback(() => {
    //console.log("Portfolio calculation:", currentUser?.portfolio?.companies, stocks);

    if (!currentUser || !currentUser.portfolio || !currentUser.portfolio.companies) {
      console.log("No portfolio data found");
      return 0;
    }

    // For debugging
    //console.log("Companies in portfolio:", Object.entries(currentUser.portfolio.companies));

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      //console.log("No stock data, using default price");
      return Object.entries(currentUser.portfolio.companies)
        .reduce((total, [company, shares]) => {
          //console.log(`Calculating for ${company}: ${shares} shares at $10 each`);
          return total + (shares * 10);
        }, 0);
    }

    return Object.entries(currentUser.portfolio.companies)
      .reduce((total, [company, shares]) => {
        const stockData = stocks.find(s =>
          s.ticker === company ||
          s.name === company ||
          s.id === company
        );

        console.log(`Stock lookup for ${company}:`, stockData);
        const price = stockData ? stockData.stockPrice : 10;
        console.log(`Using price ${price} for ${shares} shares of ${company}`);

        return total + (shares * price);
      }, 0);
  }, [currentUser, stocks]);

  return (
    <UserContext.Provider value={{ currentUser, login, buyStock, sellStock, getPortfolioValue }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
