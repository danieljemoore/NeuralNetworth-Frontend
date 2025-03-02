// src/components/PlayerStatusHeader.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserProvider';
import { useWebSocket } from '../context/WebSocketProvider';
import Timer from './Timer';
import StartGameButton from './StartGameButton';

const PlayerStatusHeader = () => {
	const { currentUser, getPortfolioValue } = useUser();
	const { players, stocks } = useWebSocket();
	const [playerFunds, setPlayerFunds] = useState(0);
	const [portfolioValue, setPortfolioValue] = useState(0);

	// Update player funds whenever the players array or currentUser changes
	useEffect(() => {
		if (currentUser && currentUser.username && players.length > 0) {
			const playerData = players.find(p => p.player === currentUser.username);
			if (playerData) {
				setPlayerFunds(playerData.funds);
			} else if (currentUser.portfolio && typeof currentUser.portfolio.funds === 'number') {
				setPlayerFunds(currentUser.portfolio.funds);
			}
		}
	}, [players, currentUser]);

	// Update portfolio value whenever relevant data changes
	useEffect(() => {
		if (currentUser && currentUser.portfolio) {
			const value = getPortfolioValue();
			setPortfolioValue(value);
		}
	}, [currentUser, stocks, getPortfolioValue]);

	// Don't render if no user is logged in
	if (!currentUser) {
		return null;
	}

	// Calculate total assets
	const totalAssets = playerFunds + portfolioValue;

	return (
		<div className="bg-gray-100 p-4 rounded-md shadow-sm mb-4">
			<div className="flex flex-wrap justify-between items-center">
				<div className="flex items-center space-x-2 gap-2">
					<div className="flex items-center space-x-2">
						<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
							{currentUser.username.charAt(0).toUpperCase()}
						</div>

						<h2 className="text-lg font-semibold">{currentUser.username}</h2>
					</div>
					<Timer />
					<StartGameButton />
				</div>

				<div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
					<div className="bg-white p-2 rounded shadow-sm">
						<div className="text-sm text-gray-500">Available Funds</div>
						<div className="font-bold text-green-600">${isNaN(playerFunds) ? '0.00' : playerFunds.toFixed(2)}</div>
					</div>

					<div className="bg-white p-2 rounded shadow-sm">
						<div className="text-sm text-gray-500">Portfolio Value</div>
						<div className="font-bold text-blue-600">${isNaN(portfolioValue) ? '0.00' : portfolioValue.toFixed(2)}</div>
					</div>

					<div className="bg-white p-2 rounded shadow-sm">
						<div className="text-sm text-gray-500">Total Assets</div>
						<div className="font-bold text-purple-600">${isNaN(totalAssets) ? '0.00' : totalAssets.toFixed(2)}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlayerStatusHeader;
