// src/components/StartGameButton.jsx
import React from 'react';
import axios from 'axios';

const StartGameButton = () => {
	const startGame = async () => {
		try {
			const response = await axios.post('${API_BASE_URL}/round/start_manual');
			console.log(response.data.message);
		} catch (error) {
			console.error('Error starting game:', error.response?.data?.error || error.message);
		}
	};

	return (
		<button
			onClick={startGame}
			className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
		>
			Start Game
		</button>
	);
};

export default StartGameButton;
