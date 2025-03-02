// src/context/WebSocketProvider.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [players, setPlayers] = useState([]);
  const [summary, setSummary] = useState({
    totalMessages: 0,
    totalJoins: 0,
    roundStarted: false,
    roundEnded: false,
  });

  const [portfolios, setPortfolios] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [winner, setWinner] = useState(null);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);
  const [timer, setTimer] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    const ws = new WebSocket('wss://neuralnetworth-backend-409815903554.us-central1.run.app/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
      // Request current stock prices
      ws.send(JSON.stringify({ event: 'get_stocks' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        setSummary((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));

        if (msg.event === 'stock_update') {
          // Broadcast stock updates to consumers
          // You can use a callback or context to pass this data
          // For simplicity, we'll store messages and let consumers handle them
          setMessages((prev) => [...prev, msg]);
        }
        if (msg.event === 'round_status') {
          setPortfolios(msg.data);
        }
        if (msg.event === 'round_started') {
          setCurrentRound(msg.data);
        }

        if (msg.event === 'round_ended') {
          setCurrentRound(null);
          setWinner(msg.data);
        }

        if (msg.event === 'all_rounds_completed') {
          setAllRoundsCompleted(true);
        }

        if (msg.event === 'timer_update') {
          setCurrentRound(msg.data.round_id);
          setTimer(msg.data);
        }

        if (msg.event === 'all_portfolios') {
          setPlayers(msg.data);
        } else if (msg.event === 'player_joined') {
          const newPlayer = msg.data;
          setPlayers((prev) => {
            if (!prev.some((p) => p.player === newPlayer.player)) {
              return [...prev, newPlayer];
            }
            return prev;
          });
          setSummary((prev) => ({ ...prev, totalJoins: prev.totalJoins + 1 }));
        } else if (msg.event === 'portfolio_update') {
          const updatedPlayer = msg.data;
          setPlayers((prev) => {
            const idx = prev.findIndex((p) => p.player === updatedPlayer.player);
            if (idx === -1) return prev;
            const newPlayers = [...prev];
            newPlayers[idx] = updatedPlayer;
            return newPlayers;
          });
        } else if (msg.event === 'stocks' || msg.event === 'all_stocks') {
          // If your backend sends stock prices, handle them here
          setStocks(msg.data);
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket closed, reconnecting in 2s');
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);


  const sendMessage = (message) => {
    if (!wsRef.current || !connected) return;
    let msg;
    if (typeof message === 'string') {
      if (!message.trim()) return;
      msg = { event: 'custom_message', data: message };
    } else if (typeof message === 'object' && message !== null && message.event) {
      msg = message;
    } else {
      console.error('invalid message type');
      return;
    }
    wsRef.current.send(JSON.stringify(msg));
  };

  const triggerApi = async (action) => {
    try {
      const response = await fetch(`/api/${action}`, { method: 'POST' });
      if (!response.ok) console.error(`API call to /${action} failed`);
    } catch (err) {
      console.error(`Error triggering ${action}:`, err);
    }
  };

  const triggerDeleteApi = async (action) => {
    try {
      const response = await fetch(`/api/${action}`, { method: 'DELETE' });
      if (!response.ok) console.error(`API call to /${action} failed`);
    } catch (err) {
      console.error(`Error triggering ${action}:`, err);
    }
  };

  const triggerPostApi = async (endpoint, data) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) console.error(`API call to /${endpoint} failed`);
    } catch (err) {
      console.error(`Error triggering ${endpoint}:`, err);
    }
  };
  const triggerGetApi = async (endpoint, data) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) console.error(`API call to /${endpoint} failed`);
    } catch (err) {
      console.error(`Error triggering ${endpoint}:`, err);
    }
  };
  // Fetch stock prices via API
  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
        return data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching stocks:', err);
      return [];
    }
  };

  // Instead, add the fetchStocks call to the main useEffect
  useEffect(() => {
    connectWebSocket();
    fetchStocks(); // Fetch stocks initially

    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(fetchStocks, 30000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ connected, messages, players, portfolios, summary, stocks, sendMessage, triggerApi, triggerDeleteApi, triggerPostApi, triggerGetApi, fetchStocks, currentRound, winner, allRoundsCompleted, timer }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
