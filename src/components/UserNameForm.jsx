//src/components/UsernameForm.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserProvider';
import { useNavigate } from "react-router-dom";

const UsernameForm = () => {
	const { login } = useUser();
	const [username, setUsername] = useState('');
	const navigate = useNavigate();

	const handleUsernameSubmit = (e) => {
		e.preventDefault();
		if (username.trim()) {
			navigate("/stocks"); // Navigate to the stock selection page
		}
		if (!username.trim()) return;
		// Instead of directly calling the API, let the UserProvider handle the login,
		// which in turn should trigger a DB call (or a WS message) to create the portfolio.
		login(username);
		setUsername('');
	};

	return (
		<form onSubmit={handleUsernameSubmit}>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username"
				className="border p-2"
			/>
			<button type="submit" className="bg-blue-500 text-white p-2 ml-2">
				Join
			</button>
		</form>
	);
};

export default UsernameForm;
