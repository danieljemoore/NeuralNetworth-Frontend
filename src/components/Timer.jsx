
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketProvider';

const Timer = () => {
	const { allRoundsCompleted, timer } = useWebSocket();  // Get the timer from WebSocket context
	const [elapsed, setElapsed] = useState('00:00:00');
	const [remaining, setRemaining] = useState('00:00:00');

	useEffect(() => {
		// Check if timer and timer.data are valid
		if (!timer || !timer.elapsed || !timer.remaining) return;

		// Update elapsed and remaining time from timer data
		setElapsed(formatDuration(parseDuration(timer.elapsed)));
		setRemaining(formatDuration(parseDuration(timer.remaining)));
	}, [timer]); // This effect runs when `timer` changes

	// Helper function to parse duration strings like "9.000752251s" or "999.471599ms"
	const parseDuration = (str) => {
		const match = str.match(/(\d+(\.\d+)?)([a-zA-Z]+)/);  // Match number + unit (e.g., "9.000752251s")
		if (!match) return 0;

		const value = parseFloat(match[1]);  // Get the number
		const unit = match[3];  // Get the unit (e.g., "s", "ms")

		switch (unit) {
			case 'h':
				return value * 60 * 60 * 1000;  // Convert hours to milliseconds
			case 'm':
				return value * 60 * 1000;  // Convert minutes to milliseconds
			case 's':
				return value * 1000;  // Convert seconds to milliseconds
			case 'ms':
				return value;  // Milliseconds are already in the right unit
			default:
				return 0;  // Default case if the unit is not recognized
		}
	};

	// Function to format duration (in milliseconds) to hh:mm:ss
	const formatDuration = (ms) => {
		let totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
	};

	// Function to pad single-digit numbers with leading zero
	const padZero = (num) => num.toString().padStart(2, '0');

	// If all rounds are completed, hide the timer
	if (allRoundsCompleted) return null;

	return (
		<div className="bg-gray-100 border border-blue-500 rounded">
			<h2 className="text-lg font-semibold pl-1">Round Timer</h2>
			<div className="flex justify-between mt-2 p-1 gap-1">
				<div>
					<span className="font-bold">Elapsed:</span> {elapsed}
				</div>
				<div>
					<span className="font-bold">Remaining:</span> {remaining}
				</div>
			</div>
		</div>
	);
};

export default Timer;

