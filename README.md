# Behind-the-screen

A modern tabletop RPG encounter management application designed to streamline your game sessions.

## Overview

Behind-the-screen is a comprehensive tool for Game Masters to manage tabletop RPG encounters. Track initiative, manage players and NPCs during combat encounters. This application is currently in early development, with the encounter management system being the first feature under construction.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- MongoDB
- Tailwind CSS & DaisyUI
- Auth0 Authentication
- GraphQL (GraphQL Yoga)
- Vercel (Deployment & CI/CD)

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
   Create a `.env.local` file with the following variables (adjust as needed):
   ```
   MONGODB_URI=your_mongodb_connection_string
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=your_auth0_domain
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   ```

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

This project is under active development. Currently focusing on building the encounter management system.
