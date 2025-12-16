# Hooks

This directory contains custom React hooks used throughout the Core-UI library for managing application state and side effects.

## useAnimations

A hook for managing animation preferences globally across the application.

**Features:**
- Persists animation preference in localStorage
- Sets data attribute on document root for CSS targeting
- Provides toggle functionality

**Returns:** `{ animationsEnabled, toggleAnimations, setAnimationsEnabled }`

## useTheme

A hook for managing application theme preferences (light/dark mode).

**Features:**
- Automatic system preference detection
- Persists theme choice in localStorage
- Sets data attribute on document root

**Returns:** `{ theme, toggleTheme, setTheme }`

## useTooltip

A hook for managing tooltip positioning and visibility.

**Features:**
- Automatic tooltip positioning
- Support for multiple placement options
- Smooth animations
- Portal rendering for proper z-index

**Returns:** `{ triggerProps, TooltipPortal }`

## useAPIService

A comprehensive hook for making API calls with standardized error handling and loading states.

**Features:**
- Support for all HTTP methods
- Named parameter substitution in URLs
- User-friendly error messages
- Loading state management
- Request timeout configuration

**Returns:** `{ request, isLoading, error, clearError }`