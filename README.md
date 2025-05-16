# Behind-the-screen

A modern tabletop RPG encounter management application designed to streamline your game sessions.

## Overview

Behind-the-screen is a comprehensive tool for Game Masters to manage tabletop RPG encounters. Track initiative, manage players and NPCs during combat encounters. This application is currently in early development, with the encounter management system being the first feature under construction.

## Features

- **Encounter Management:** Create, view, and manage combat encounters.
- **Initiative Tracking:** Easily track turn order for players and monsters during combat.
- **Character Management:** Add and manage player characters and non-player characters/monsters within encounters.
- **Difficulty Calculation:** Estimate encounter difficulty based on player levels and monster challenge ratings.

## License

This project is free to use under the MIT License. The copyright belongs to Shane Schmaltz. While the project is freely available, it is not currently open for contributions.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- MongoDB
- Tailwind CSS & DaisyUI
- Auth0 Authentication
- GraphQL (GraphQL Yoga)
- Vercel (Deployment & CI/CD)

## High-Level Architecture

This application utilizes Next.js for both the React frontend and the server-side API routes. GraphQL (via GraphQL Yoga) is used for data fetching between the client and server. The architecture follows standard Next.js patterns, leveraging React components, custom hooks for state management, and context for global state.

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file by copying the template:
   ```bash
   cp .env.base .env.local
   ```
   Then, open `.env.local` and fill in the required values for your environment (e.g., database connection strings, API keys).
   **Important:** Ensure `.env.local` is included in your `.gitignore` file and is never committed to version control.

### Development

Run the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Deployment

The application uses Vercel for continuous integration and deployment:

- **Preview Deployments**: Every push to a branch automatically creates a preview deployment
- **Production Deployment**: Merges to the main branch trigger automatic deployment to production
- **Environment Variables**: Managed through the Vercel dashboard

### Other Commands

- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run prettier` - Run Prettier code formatter

## Project Structure

- `/components` - Reusable UI components
- `/container` - Container components
- `/context` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and libraries
- `/pages` - Next.js pages and API routes
- `/providers` - Service providers
- `/public` - Static assets
- `/repositories` - Data access layer
- `/styles` - Global styles and Tailwind configuration
- `/types` - TypeScript type definitions

## Current Status

This project is under active development. Currently focusing on building the encounter management system, which includes initiative tracking, character management, and combat facilitation for tabletop RPG sessions.

## Legal Notice: D&D SRD and Open Game License

This application includes Open Game Content from the System Reference Document 5.1 (SRD 5.1) by Wizards of the Coast, LLC, used under the terms of the Open Game License v1.0a. Only content from the SRD 5.1 is included. Dungeons & Dragons and D&D are trademarks of Wizards of the Coast, LLC. See the OGL.txt file in this repository for the full license text.

```

```
