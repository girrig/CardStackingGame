# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Important**: All commands must be run from the `cardstackinggame/` subdirectory.

- `yarn dev` - Start the development server (default port 3000)
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint to check for code issues

## Project Architecture

This is a **Next.js 15 App Router** application built with TypeScript, React 19, and Tailwind CSS v4. The project implements a card-based crafting/combination game with drag-and-drop mechanics.

### Key Structure
- **Main Directory**: All source code is in `cardstackinggame/` subdirectory
- **Components**: Modular components - Card, InventoryBox, CombinationBox
- **Data**: JSON configuration files for cards and recipes
- **Utils**: Helper functions including icon mapping
- **Main Entry**: Game orchestration in `app/(root)/page.tsx`

### Core Game Architecture
The application implements a card combination system with:

- **Card Database**: JSON configuration with card types, Lucide React icons, and colors
- **Recipe System**: JSON-based recipes defining valid card combinations
- **Inventory System**: Grid-based inventory with drag-and-drop positioning
- **Combination Area**: Dedicated draggable area with scattered card layout
- **Drag & Drop**: Global state management with coordinate tracking and drop validation
- **State Management**: React useState for inventory, combination area, drag state, and positions

### Component Structure
- **Card Component** (`components/Card.tsx`): Reusable card with drag handlers and quantity badges
- **InventoryBox Component** (`components/InventoryBox.tsx`): Grid-based inventory management  
- **CombinationBox Component** (`components/CombinationBox.tsx`): Scattered combination area
- **Main Game** (`app/(root)/page.tsx`): Central game logic and state orchestration
- **Icon Mapping** (`utils/iconMap.ts`): Dynamic Lucide React icon resolution

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with PostCSS
- **Icons**: Lucide React
- **Linting**: ESLint with Next.js configuration

## Code Patterns

- Functional components with React hooks
- Tailwind utility classes for styling
- JSON-based data configuration
- Component composition with state passed through props
- Event-driven drag and drop with coordinate tracking
- Immutable state updates with spread operators and functional array methods
- Ref-based DOM interaction for drag boundaries and positioning