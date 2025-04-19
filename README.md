# Inventory Tracker

A full-featured inventory management system with authentication, product management, stock tracking, and reporting capabilities.

## Features

- User authentication with secure password hashing
- Product management with categories
- Inventory tracking across multiple locations
- Stock movement history and adjustments
- Low stock alerts and dashboard analytics
- Import/export functionality for data management
- Responsive design for mobile and desktop

## Technologies Used

- **Frontend**: React, TailwindCSS, ShadcnUI, React Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy

# Deployment Options

## Deploy on Render

### Prerequisites

- A Render account
- PostgreSQL database (either from Render or external service like Neon)

### Environment Variables

Set these in your Render project settings:

- `DATABASE_URL`: Your PostgreSQL connection string (required)
- `SESSION_SECRET`: A random string for session encryption (required)
- `NODE_ENV`: Set to "production"

### Deployment Steps

#### Deploying with Render Dashboard

1. Fork or clone this repository to your GitHub account
2. Go to [render.com](https://render.com) and sign up/login
3. Click "New" → "Web Service" 
4. Connect your GitHub repository
5. Configure the web service:
   - Name: `inventory-tracker` (or your preferred name)
   - Build Command: `./render-build.sh`
   - Start Command: `node dist/index.js`
   - Publish Directory: `dist`
6. Set environment variables in the "Environment" section
7. Click "Create Web Service"

#### Deploying with render.yaml (Blueprint)

1. Fork or clone this repository to your GitHub account
2. Connect your repository to Render using their Blueprint feature
3. The included `render.yaml` will automatically configure your deployment
4. Add the required environment variables

### Important Configuration Notes

- The `render.yaml` file includes deployment configuration
- The `render-build.sh` script handles:
  - Installing dependencies
  - Running database migrations
  - Building both client and server
- Database migrations are automatically applied during deployment
- The `dist` directory contains the final build output

### After Deployment

1. Your app will be available at a URL like `your-service.onrender.com`
2. Register a user account at `/auth`
3. You can populate additional data via the app interface

## Deploy on Vercel

### Prerequisites

- A Vercel account
- PostgreSQL database (Neon is recommended and already configured)

### Environment Variables

Set these in your Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string (required)
- `SESSION_SECRET`: A random string for session encryption (required)

### Deployment Steps

1. Fork or clone this repository to your GitHub account
2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure project settings:
      - Build Command: `./vercel-build.sh`
      - Output Directory: `dist`
      - Install Command: `npm install`
   - Add the required environment variables
   - Click "Deploy"

### Important Configuration Notes

- The `vercel.json` file includes custom build configuration
- The `vercel-build.sh` script handles:
  - Installing dependencies
  - Running database migrations
  - Building the client application
- Database migrations are automatically applied during deployment

### After Deployment

1. Your app will be available at a URL like `your-project.vercel.app`
2. Register a user account at `/auth`
3. You can populate additional data via the app interface

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your PostgreSQL connection string
4. Run migrations: `npx drizzle-kit push`
5. Start the development server: `npm run dev`

## License

MIT