# Movie Portal API - Backend

This is the backend server for the Movie Portal application. It is responsible for handling all core functionalities such as user authentication and authorization, movie and series management, user reviews, and role-based access control. The server also manages secure payment processing and ensures that all data is handled safely and efficiently. It acts as the main system that connects the frontend with the database, making the entire application work smoothly and reliably.

## Key Features
### User Authentication
A secure authentication system built with Better Auth and JWT. It allows users to register, log in, and stay authenticated safely. The system ensures proper session handling and protects user data from unauthorized access.

### RBAC (Role-Based Access Control)
The application supports multiple user roles such as Admin, Creator, and User. Each role has its own set of permissions and access levels, ensuring better security and organized control over different parts of the system.
Movie Management: Admins have full control over movies and series, including creating, updating, deleting, and managing content. This complete CRUD functionality makes it easy to maintain and update the platform’s content.

### Review System
Users can write and submit reviews for movies and series. All reviews go through an admin approval process before being published, helping maintain quality and prevent spam or inappropriate content.

### Watchlist
Users can add movies or series to their personal watchlist. This feature allows them to save content and easily access it later without searching again.

### Payment Integration
The platform includes a secure and reliable one-time payment system powered by Stripe. It ensures safe transactions and a smooth checkout experience for users who want to access premium content.

### Database
The application uses PostgreSQL as the main database along with Prisma ORM. This combination provides high performance, strong data consistency, and an easy way to manage and scale the database as the application grows.

### Scalable Architecture
The backend is designed in a clean and modular way, making it easy to maintain, extend, and add new features in the future.

### API Integration
Well-structured RESTful APIs are used to connect the frontend and backend, ensuring smooth communication and fast data exchange across the application.

## Technology Stack
 Runtime: Node.js
 
 Framework: Express.js
 
 ORM: Prisma
 
 Database: PostgreSQL (Neon DB)
 
 Language: TypeScript
 
 Auth: Better-Auth And Jwt

## Local Setup
#### Clone the repository GitHub cli
gh repo clone TwistMehedi/assigment-5-backend-p-hero-l2

Deployment Link: https://assigment-5-backend-p-hero-l2.onrender.com

#### Install dependencies: 
npm install

Setup environment for follow .env.example file

Run Prisma Generate

npm run generate

Run Prisma Migrations

npm run migrate

npm run dev
