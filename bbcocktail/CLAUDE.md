# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- `npm run dev` - Start development server (runs both Kea typegen and Vite)
- `npm run build` - Build for production
- `npm run prettier` - Format code with Prettier
- `npm run preview` - Preview production build locally

## Code Style Guidelines
- TypeScript with strict types
- React functional components with hooks
- Use Kea for state management
- Format with Prettier (semi: false, singleQuote: true, printWidth: 120)
- Use Tailwind CSS for styling
- Imports order: React, third-party libraries, internal modules, types
- Component naming: PascalCase for components, camelCase for functions/variables
- Error handling: Use try/catch in async operations, log errors to console
- Type definitions in dedicated files under /src/types/
- Logic/state in dedicated files under /src/logic/

## File Structure
- React components in src/components/
- Type definitions in src/types/
- State management logic in src/logic/
- Utility functions in src/utils/