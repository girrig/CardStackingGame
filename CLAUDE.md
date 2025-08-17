# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Important**: All commands must be run from the `cardstackinggame/` subdirectory.

- `yarn dev` - Start the development server (default port 3000)
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint to check for code issues

## Project Architecture

This is a **Next.js 15 App Router** application built with TypeScript, React 19, and Tailwind CSS v4. The project implements a card-based crafting/combination game with drag-and-drop mechanics using `@dnd-kit/core`.

### Key Structure
- **Main Directory**: All source code is in `cardstackinggame/` subdirectory
- **Components**: Modular components - Card, InventoryBox, CombinationBox, TabbedComponent
- **Data**: JSON configuration files for cards and recipes
- **Utils**: Helper functions for drag/drop, icon mapping, and inventory management
- **Types**: TypeScript interfaces in `types/card.ts`
- **Constants**: Global configuration in `constants/globals.ts`
- **Main Entry**: Game orchestration in `app/(root)/page.tsx`

### Core Game Architecture
The application implements a card combination system with:

- **Card Database**: JSON configuration with card types, Lucide React icons, and colors
- **Recipe System**: JSON-based recipes (planned feature, currently unused)
- **Inventory System**: Responsive grid-based inventory with automatic sorting and stacking
- **Combination Area**: Free-form draggable area with absolute positioning and clear functionality
- **Drag & Drop**: `@dnd-kit/core` with precise offset tracking, drop validation, and snap-back animations
- **Tab Navigation**: Tabbed interface with Inventory and Equipment (placeholder) sections
- **State Management**: React useState for inventory, combination area, drag state, and positions

### Component Structure
- **Card Component** (`components/Card.tsx`): Reusable draggable card with quantity badges and dynamic icons
- **InventoryBox Component** (`components/InventoryBox.tsx`): Responsive grid-based inventory with auto-sorting
- **CombinationBox Component** (`components/CombinationBox.tsx`): Free-form combination area with clear functionality
- **TabbedComponent** (`components/TabbedComponent.tsx`): Tab navigation wrapper for different views
- **Main Game** (`app/(root)/page.tsx`): Central game logic and state orchestration

### Utility Functions
- **dragUtils.ts**: Drag and drop logic, card movement, and position calculations
- **inventoryUtils.ts**: Grid calculations, sorting, and inventory management
- **iconMap.ts**: Dynamic Lucide React icon resolution with fallback handling

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Drag & Drop**: @dnd-kit/core with modifiers
- **Styling**: Tailwind CSS v4 with PostCSS
- **Icons**: Lucide React
- **Linting**: ESLint with Next.js configuration

## Code Patterns

- Functional components with React hooks
- Tailwind utility classes for styling
- JSON-based data configuration
- Component composition with state passed through props
- @dnd-kit drag and drop with precise offset tracking
- Immutable state updates with spread operators and functional array methods
- Responsive grid calculations with useMemo optimization
- Coordinate-based positioning for combination area