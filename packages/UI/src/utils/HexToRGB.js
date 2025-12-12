/**
 * Converts a CSS variable (e.g., --primary-app-color) to an RGB array [r, g, b].
 * @param {string} varName - The CSS variable name (e.g., '--primary-app-color')
 * @param {HTMLElement} [element=document.documentElement] - The element to read the variable from
 * @returns {number[]} An array [r, g, b].
 */
export default function HexToRGB(varName, element = document.documentElement) {
	const cssValue = getComputedStyle(element).getPropertyValue(varName).trim();
	let rgb = [41, 128, 185]; // fallback default

	if (cssValue.startsWith('#')) {
		// Convert hex to RGB
		const hex = cssValue.replace('#', '');
		if (hex.length === 3) {
			rgb = [
				parseInt(hex[0] + hex[0], 16),
				parseInt(hex[1] + hex[1], 16),
				parseInt(hex[2] + hex[2], 16)
			];
		} else if (hex.length === 6) {
			rgb = [
				parseInt(hex.substring(0, 2), 16),
				parseInt(hex.substring(2, 4), 16),
				parseInt(hex.substring(4, 6), 16)
			];
		}
	} else if (cssValue.startsWith('rgb')) {
		// Convert rgb/rgba string to array
		const match = cssValue.match(/\d+/g);
		if (match && match.length >= 3) {
			rgb = match.slice(0, 3).map(Number);
		}
	}
	return rgb;
}