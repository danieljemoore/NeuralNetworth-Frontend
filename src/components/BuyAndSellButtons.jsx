// src/components/BuyAndSellButtons.jsx
import React from 'react';
import { useUser } from "@/context/UserProvider";

const BuyAndSellButtons = ({ company }) => {
	const { buyStock, sellStock, currentUser } = useUser();

	// Retrieve the number of shares owned for the given company
	const owned = currentUser?.portfolio?.companies?.[company.ticker] || 0;

	return (
		<div className="flex items-center gap-4">
			{/* Counter displaying the number of shares owned */}
			<span className="text-gray-700 text-sm font-semibold">
				Qty: {owned}
			</span>

			{/* Sell Button */}
			<button
				onClick={() => sellStock(company.name, company.ticker, 1, company.stockPrice)}
				className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
				disabled={owned <= 0} // Disable if no shares to sell
				title={owned > 0 ? "Sell 1 share" : "No shares to sell"}
			>
				Sell
			</button>

			{/* Buy Button */}
			<button
				onClick={() => buyStock(company.name, company.ticker, 1, company.stockPrice)}
				className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
				title="Buy 1 share"
			>
				Buy
			</button>
		</div>
	);
}

export default BuyAndSellButtons;
