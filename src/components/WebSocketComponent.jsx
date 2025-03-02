//src/components/WebSocketComponent.jsx
import React, { useState, useEffect, useRef } from 'react';

function WebSocketComponent() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [connected, setConnected] = useState(false);
	const [players, setPlayers] = useState([]);
	const [summary, setSummary] = useState({
		totalMessages: 0,
		totalJoins: 0,
		roundStarted: false,
		roundEnded: false,
	});
	const [username, setUsername] = useState('');
	const wsRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);

	const connectWebSocket = () => {
		const ws = new WebSocket('ws://localhost:5001/ws');
		wsRef.current = ws;

		ws.onopen = () => {
			setConnected(true);
			console.log('ws connected');
		};

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				setMessages((prev) => [...prev, msg]);
				setSummary((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
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
				} else if (msg.event === 'round_started') {
					setSummary((prev) => ({ ...prev, roundStarted: true, roundEnded: false }));
				} else if (msg.event === 'round_ended') {
					setSummary((prev) => ({ ...prev, roundEnded: true }));
				} else if (msg.event === 'portfolio_update') {
					const updatedPlayer = msg.data;
					setPlayers((prev) => {
						const idx = prev.findIndex((p) => p.player === updatedPlayer.player);
						if (idx === -1) return prev;
						const newPlayers = [...prev];
						newPlayers[idx] = updatedPlayer;
						return newPlayers;
					});
				}
			} catch (err) {
				console.error('invalid json:', err);
			}
		};

		ws.onerror = (err) => {
			console.error('ws error:', err);
		};

		ws.onclose = () => {
			setConnected(false);
			console.log('ws closed, reconnecting in 2s');
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

	const sendMessage = () => {
		if (!input.trim() || !connected || !wsRef.current) return;
		const msg = { event: 'custom_message', data: input };
		wsRef.current.send(JSON.stringify(msg));
		setInput('');
	};

	const handleUsernameSubmit = (e) => {
		e.preventDefault();
		if (!username.trim() || !connected || !wsRef.current) return;
		triggerApi(`portfolio?player=${username}`);	// replace with actual api call

		setUsername('');
	};

	const triggerApi = async (action) => {
		try {
			const response = await fetch(`${API_BASE_URL}/${action}`, { method: 'POST' });
			if (!response.ok) console.error(`api call to /${action} failed`);
		} catch (err) {
			console.error(`error triggering ${action}:`, err);
		}
	};

	const triggerDeleteApi = async (action) => {
		try {
			const response = await fetch(`${API_BASE_URL}/api/${action}`, { method: 'DELETE' });
			if (!response.ok) console.error(`api call to /${action} failed`);
		} catch (err) {
			console.error(`error triggering ${action}:`, err);
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">websocket demo</h1>
			<div className="mb-4">
				<span>status: {connected ? 'connected' : 'disconnected'}</span>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">messages</h2>
				<ul className="border p-2 h-40 overflow-y-scroll">
					{messages.map((msg, index) => (
						<li key={index}>
							{msg.event === 'round_started'
								? `round started at ${msg.data.start_time}`
								: msg.event === 'round_ended'
									? `round ended at ${msg.data.end_time}`
									: msg.event === 'player_joined'
										? `player joined: ${msg.data.player}`
										: JSON.stringify(msg)}
						</li>
					))}
				</ul>
			</div>
			<div className="mb-4">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="border p-2 mr-2"
					placeholder="type a message"
				/>
				<button onClick={sendMessage} className="bg-blue-500 text-white p-2">
					send
				</button>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">player list</h2>
				<ul className="border p-2">
					{players.length > 0 ? (
						players.map((playerObj, idx) => (
							<li key={idx}>
								{playerObj.player} - funds: {playerObj.funds.toFixed(2)}
							</li>
						))
					) : (
						<li>no players yet</li>
					)}
				</ul>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">summary</h2>
				<p>total messages: {summary.totalMessages}</p>
				<p>total joins: {summary.totalJoins}</p>
				<p>players count: {players.length}</p>
				<p>round started: {summary.roundStarted ? 'yes' : 'no'}</p>
				<p>round ended: {summary.roundEnded ? 'yes' : 'no'}</p>
			</div>
			<div>
				<button
					onClick={() => triggerApi('rounds')}
					className="bg-green-500 text-white p-2 mr-2"
				>
					start round
				</button>
				<button
					onClick={() => triggerDeleteApi('rounds')}
					className="bg-red-500 text-white p-2 mr-2"
				>
					end round
				</button>
			</div>
			<form onSubmit={handleUsernameSubmit} className="mt-4">
				<input
					type="text"
					placeholder="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="border border-gray-300 rounded px-3 py-2 mr-2"
				/>
				<button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
					submit
				</button>
			</form>
		</div>
	);
}

export default WebSocketComponent;

