//src/Provider.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const ThemeContext = createContext();

// Create a ThemeProvider component
export const ThemeProvider = ({ children }) => {
	// Read initial theme from localStorage (default to "light")
	const [theme, setTheme] = useState(() => {
		const storedTheme = localStorage.getItem("theme");
		return storedTheme ? storedTheme : "light"; // Use ternary for conciseness
	});

	// Update localStorage when theme changes
	useEffect(() => {
		localStorage.setItem("theme", theme);
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	// Provide the theme and setTheme function to components that consume this context
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

