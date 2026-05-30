Zenith – Productivity & Habit Tracking Dashboard
Overview

Zenith is a full-stack productivity and habit-tracking application that helps users organize tasks, build positive habits, and monitor their daily progress. The platform provides a simple and intuitive interface for managing productivity while maintaining a secure and scalable backend.

Features
User registration and authentication
Task creation, editing, and tracking
Priority and status management for tasks
Daily habit tracking and completion logging
Personalized productivity dashboard
Secure protected routes using authentication middleware
Persistent data storage with SQLite
Responsive Single Page Application (SPA) architecture
Tech Stack
Frontend
HTML5
CSS3
JavaScript
Backend
Node.js
Express.js
Database
SQLite (sql.js)
Deployment
Render
Persistent Disk Storage
Development Tools
Git & GitHub
Custom Database Viewer (view-db.js)
Project Structure
Zenith/
├── public/           # Frontend files
├── controllers/      # API controllers
├── middleware/       # Authentication middleware
├── database/         # SQLite database files
├── server.js         # Main server entry point
├── view-db.js        # Database inspection utility
├── render.yaml       # Render deployment configuration
└── package.json
Key Highlights
Modular backend architecture with separate API routes
Secure user authentication and authorization
Relational database design for users, tasks, habits, and habit logs
SPA support with Express fallback routing
Persistent cloud deployment ensuring data durability
Easy-to-maintain and scalable project structure
Installation
Clone the repository
git clone <repository-url>
cd Zenith
Install dependencies
npm install
Start the application
npm start
Open in your browser
http://localhost:3000
Live Demo

Application: https://zenith-wnfa.onrender.com

Future Enhancements
Habit streak tracking
Productivity analytics and charts
Task reminders and notifications
User profile customization
Calendar integration
Data export functionality
