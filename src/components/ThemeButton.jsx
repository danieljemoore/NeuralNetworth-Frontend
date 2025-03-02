// src/components/ui/theme/ThemeToggle.jsx
import React, { useContext } from "react";
import { ThemeContext } from '@/Provider.jsx'; // Import the ThemeContext
import { useSpring, animated } from "react-spring";

// Define the animated properties for the two themes.
// When in dark mode we show a moon (larger center circle with mask in place, no rays),
// and when in light mode we show a sun (smaller center circle with the mask off and rays visible).
const properties = {
	dark: {
		r: 9,
		transform: "rotate(40deg)",
		cx: 12,
		cy: 4,
		opacity: 0,
	},
	light: {
		r: 5,
		transform: "rotate(90deg)",
		cx: 30,
		cy: 0,
		opacity: 1,
	},
	springConfig: { mass: 4, tension: 250, friction: 35 },
};

function ThemeButton() {
	// Read initial theme from localStorage (default to "light")
	const { theme, setTheme } = useContext(ThemeContext);

	// Toggle between "light" and "dark" themes
	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	// Destructure the properties based on the current theme
	const { r, transform, cx, cy, opacity } = properties[theme];

	// Create our animated springs for each animated attribute
	const svgContainerProps = useSpring({
		transform,
		config: properties.springConfig,
	});
	const centerCircleProps = useSpring({
		r,
		config: properties.springConfig,
	});
	const maskedCircleProps = useSpring({
		cx,
		cy,
		config: properties.springConfig,
	});
	const linesProps = useSpring({
		opacity,
		config: properties.springConfig,
	});

	return (
		<button
			id="theme-toggle"
			aria-label="Toggle Dark Mode"
			onClick={toggleTheme}
			className="px-4 py-2 rounded-sm flex items-center justify-center"
		>
			<animated.svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{
					cursor: "pointer",
					...svgContainerProps,
				}}
			>
				{/* Define the mask that will “cut out” part of the circle to form the moon */}
				<mask id="themeMask">
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					<animated.circle style={maskedCircleProps} r="9" fill="black" />
				</mask>

				{/* The center circle represents our sun/moon.
            Its radius (r) is animated between 9 (moon) and 5 (sun). */}
				<animated.circle
					cx="12"
					cy="12"
					style={centerCircleProps}
					fill="black"
					mask="url(#themeMask)"
				/>

				{/* The rays (lines) are visible only in light mode (sun) */}
				<animated.g stroke="currentColor" style={linesProps}>
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</animated.g>
			</animated.svg>
		</button>
	);
}

export default ThemeButton;
