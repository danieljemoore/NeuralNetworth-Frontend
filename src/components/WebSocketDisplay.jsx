// src/components/WebSocketDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketProvider';
import { useUser } from '../context/UserProvider';
import UsernameForm from './UserNameForm';

const WebSocketDisplay = () => {
	const {
		connected,
		messages,
		players,
		summary,
		sendMessage,
		triggerApi,
		triggerDeleteApi,
	} = useWebSocket();
	const { currentUser } = useUser();
	const [input, setInput] = useState('');
	const [localPlayers, setLocalPlayers] = useState([]);

	// Update local players state whenever the players from context changes
	useEffect(() => {
		setLocalPlayers(players);
	}, [players]);

	const handleSendMessage = () => {
		// Wrap your custom message in an object (if needed)
		sendMessage({ event: 'custom_message', data: input });
		setInput('');
	};

	return (
		<div className="p-4">
			<div className="text-center justify-center">
				{/* User login form */}
				{!currentUser && (
					<UsernameForm />
				)}
				{/* If logged in, show a welcome message and a buy button */}
				{currentUser && (
					<div className="mt-4">
						<p>Welcome, {currentUser.username}</p>
					</div>
				)}
			</div>
			<h1 className="text-2xl font-bold mb-4">WebSocket Demo with DB Integration</h1>
			<div className="mb-4">
				<span>Status: {connected ? 'Connected' : 'Disconnected'}</span>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">Messages</h2>
				<ul className="border p-2 h-40 overflow-y-scroll">
					{messages.map((msg, index) => (
						<li key={index}>{JSON.stringify(msg)}</li>
					))}
				</ul>
			</div>
			<div className="mb-4">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="border p-2 mr-2"
					placeholder="Type a message"
				/>
				<button onClick={handleSendMessage} className="bg-blue-500 text-white p-2">
					Send
				</button>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">Players</h2>
				<ul className="border p-2">
					{localPlayers.length > 0 ? (
						localPlayers.map((playerObj, idx) => (
							<li key={`player-${playerObj.player}-${idx}`}>
								{playerObj.player} - Funds: {playerObj.funds.toFixed(2)}
							</li>
						))
					) : (
						<li>No players yet</li>
					)}
				</ul>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">Summary</h2>
				<p>Total messages: {summary.totalMessages}</p>
				<p>Total joins: {summary.totalJoins}</p>
				<p>Players count: {localPlayers.length}</p>
				<p>Round started: {summary.roundStarted ? 'Yes' : 'No'}</p>
				<p>Round ended: {summary.roundEnded ? 'Yes' : 'No'}</p>
			</div>
			<div>
				<button
					onClick={() => triggerApi('rounds')}
					className="bg-green-500 text-white p-2 mr-2"
				>
					Start Round
				</button>
				<button
					onClick={() => triggerDeleteApi('rounds')}
					className="bg-red-500 text-white p-2 mr-2"
				>
					End Round
				</button>
			</div>
		</div>
	);
};

export default WebSocketDisplay;
