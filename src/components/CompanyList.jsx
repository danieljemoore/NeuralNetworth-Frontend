// src/components/CompanyList.jsx
import React, { useState, useEffect, useRef } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import BuyAndSellButtons from "./BuyAndSellButtons";
import { useWebSocket } from "../context/WebSocketProvider"; // Import the hook

const CompanyList = () => {
	const [companies, setCompanies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const { messages, connected } = useWebSocket(); // Destructure messages and connection status

	// Fetch companies on mount
	useEffect(() => {
		const fetchCompanies = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch("/api/companies", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				if (!Array.isArray(data)) {
					throw new Error("Backend response is not an array");
				}
				// Initialize historicalStockPrices if not present
				const initializedData = data.map((company) => ({
					...company,
					historicalStockPrices: company.historicalStockPrices || [],
				}));
				setCompanies(initializedData);
			} catch (err) {
				setError(err);
				console.error("Error fetching companies:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchCompanies();
	}, []);

	// Use a ref to store the latest companies state
	const companiesRef = useRef(companies);
	useEffect(() => {
		companiesRef.current = companies;
	}, [companies]);

	// Listen for WebSocket messages and update companies
	useEffect(() => {
		if (messages.length === 0) return;

		const lastMessage = messages[messages.length - 1];
		if (lastMessage.event === "stock_update") {
			const { ticker, price } = lastMessage.data;
			setCompanies((prevCompanies) => {
				return prevCompanies.map((company) => {
					if (company.ticker === ticker) {
						// Append new price to historicalStockPrices
						const updatedHistorical = [
							...company.historicalStockPrices,
							price,
						];
						// To limit history to latest 100 entries
						const MAX_HISTORY = 100;
						const trimmedHistorical =
							updatedHistorical.length > MAX_HISTORY
								? updatedHistorical.slice(-MAX_HISTORY)
								: updatedHistorical;

						return {
							...company,
							stockPrice: price,
							historicalStockPrices: trimmedHistorical,
						};
					}
					return company;
				});
			});
		}
	}, [messages]);

	if (loading) {
		return <div className="text-center py-8">Loading companies...</div>;
	}

	if (error) {
		return (
			<div className="text-center py-8 text-red-500">
				Error loading companies: {error.message}
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Connection Status */}
			<div className="fixed top-0 left-0 right-0 bg-transparent text-red-500 text-center py-2 z-50">
				{connected
					? ""
					: "Disconnected - Reconnecting..."}
			</div>

			<h2 className="text-2xl font-bold mb-4 text-gray-800">
				Companies to Trade (Gemini Powered!)
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{companies.map((company, index) => (
					<div
						key={index}
						className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
					>
						<h3 className="text-xl font-semibold text-blue-600 mb-2">
							{company.name}
						</h3>
						<p className="text-white bg-blue-500 rounded-lg text-center max-w-14 mb-2">
							{company.ticker}
						</p>
						<p className="text-gray-700 mb-2">{company.description}</p>
						<div className="flex items-center justify-between mb-4">
							{/* Conditional Rendering to Prevent Undefined */}
							<span className="text-green-500 font-bold">
								{typeof company.stockPrice === "number"
									? `$${company.stockPrice.toFixed(2)}`
									: "N/A"}
							</span>
							<BuyAndSellButtons company={company} />
						</div>
						{/* Historical Stock Price Chart */}
						{company.historicalStockPrices &&
							company.historicalStockPrices.length > 0 ? (
							<ResponsiveContainer width="100%" height={150}>
								<LineChart
									data={company.historicalStockPrices.map((price, i) => ({
										day: `Day ${i + 1}`,
										price,
									}))}
								>
									<XAxis dataKey="day" tick={{ fontSize: 12 }} />
									<YAxis
										domain={["auto", "auto"]}
										tick={{ fontSize: 12 }}
									/>
									<Tooltip />
									<Line
										type="monotone"
										dataKey="price"
										stroke="#2563eb"
										strokeWidth={2}
										dot={false}
										isAnimationActive={true} // Enable animations for smooth updates
									/>
								</LineChart>
							</ResponsiveContainer>
						) : (
							<p className="text-gray-500 text-sm text-center">
								No historical data
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default CompanyList;
