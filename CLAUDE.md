# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` or `npm run dev` - Start the development server (default port 3000)
- `yarn build` or `npm run build` - Build the application for production
- `yarn start` or `npm run start` - Start the production server
- `yarn lint` or `npm run lint` - Run ESLint to check for code issues

## Project Architecture

This is a **Next.js 15 App Router** application built with TypeScript, React 19, and Tailwind CSS v4. The project implements a card-based crafting/combination game.

### Key Structure
- **App Router**: Uses Next.js App Router with the `app/` directory structure
- **Components**: Reusable UI components stored in `components/`
- **Main Entry**: Game logic lives in `app/(root)/page.tsx`
- **Layout**: Root layout in `app/layout.tsx` with Geist fonts and global CSS

### Core Game Architecture
The application implements a card combination system with:

- **Card Database**: Static configuration defining card types, icons (from Lucide React), and colors
- **Inventory System**: React state managing available cards with quantities
- **Combination System**: Recipe-based crafting where cards can be combined to create new cards
- **State Management**: Uses React useState hooks for:
  - Inventory tracking
  - Combination slots (2-slot system)
  - Held card state
  - UI messages

### Component Structure
- **Card Component** (`components/Card.tsx`): Reusable card display with icon, name, quantity badge
- **Main Game** (`app/(root)/page.tsx`): Contains all game logic and UI layout

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with PostCSS
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono (Google Fonts)
- **Linting**: ESLint with Next.js configuration

## Code Patterns

- Uses TypeScript with `any` types in current implementation (could be improved with proper interfaces)
- Functional components with React hooks
- Tailwind utility classes for styling
- Component composition pattern for reusable Card component
- Immutable state updates with spread operators and functional array methods