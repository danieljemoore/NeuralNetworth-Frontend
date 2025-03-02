import React, { useState } from 'react';
import Leaderboard from './Leaderboard';

const FooterNav = () => {
	const [showLeaderboard, setShowLeaderboard] = useState(false);
	const handleClick = async () => {
		try {
			const response = await fetch('http://localhost:5001/api/generate/append', {
				method: 'POST',
				headers: {
				},
				// body: JSON.stringify({ key: 'value' }), // Include if you need to send data
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json(); // Assuming the response is JSON
			console.log('Response:', data);
			// Handle the response data as needed
		} catch (error) {
			console.error('Error:', error);
			// Handle errors as needed
		}
	};
	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-transparent p-4 flex justify-between items-center -z-10">
			<div className="relative">
				<button
					className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
					onClick={() => setShowLeaderboard(!showLeaderboard)}
				>
					Leaderboards
				</button>

				{showLeaderboard && (
					<div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
							<Leaderboard />
					</div>
				)}
			</div>

			<button
				className="px-6 py-3 bg-rose-400 text-white rounded-lg font-medium hover:bg-rose-500 transition-colors"
				onClick={handleClick}
			>
				Make Decision
			</button>
		</footer>
	);
};

export default FooterNav;

