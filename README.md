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

## Deployment on Vercel

### Prerequisites

- A Vercel account
- PostgreSQL database (like Neon, Supabase, etc.)

### Environment Variables

Set these in your Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A random string for session encryption
- `NODE_ENV`: Set to "production"

### Deployment Steps

1. Fork or clone this repository to your GitHub account
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration
4. Add the required environment variables
5. Deploy!

### Database Setup

The application will automatically run migrations during the build process. To seed with initial data:

```bash
# Create a seed script to run after deployment
npm run seed
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your PostgreSQL connection string
4. Run migrations: `npx drizzle-kit push`
5. Start the development server: `npm run dev`

## License

MIT