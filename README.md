# Movie Portal API - Backend

This is the backend server for the Movie Portal application. It handles authentication, movie and series management, user reviews, role-based access control, and payment processing.

## Key Features
 User Authentication: Integrated with Better-Auth for secure session management. And implement jwt.
 RBAC (Role-Based Access Control): Specific routes and permissions for Admin, Creator, and Users.
 Movie Management: Full CRUD operations for movies and series (Admin only).
 Review System: User-generated reviews with an Admin approval workflow.
 Watchlist: Capability for users to save movies for later.
 Payment Integration: Support for on time payment integration via Stripe.
 Database: PostgreSQL managed through Prisma ORM for high performance and reliability.

## Technology Stack
 Runtime: Node.js
 Framework:Express.js
 ORM: Prisma
 Database: PostgreSQL (Neon DB)
 Language: TypeScript
 Auth: Better-Auth And Jwt

## Local Setup
1. Clone the repository GitHub cli: gh repo clone TwistMehedi/assigment-5-backend-p-hero-l2

Deployment Link: https://assigment-5-backend-p-hero-l2.onrender.com

2. Install dependencies: 
npm install

3. Setup environment for follow .env.example file

4.Run Prisma Generate
npm run generate

5. Run Prisma Migrations
npm run migrate

npm run dev
