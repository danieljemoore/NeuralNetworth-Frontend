import React, { useState } from 'react';

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
						<h3 className="text-lg font-semibold text-gray-800 mb-3">Leaderboards</h3>
						<div className="space-y-2">
							{/* Placeholder leaderboard items */}
							<div className="flex justify-between items-center">
								<span className="text-gray-700">1. Player One</span>
								<span className="font-medium">1000 pts</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-700">2. Player Two</span>
								<span className="font-medium">850 pts</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-700">3. Player Three</span>
								<span className="font-medium">720 pts</span>
							</div>
						</div>
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

