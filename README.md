🚀 Zenith – Productivity & Habit Tracking Dashboard

A full-stack productivity platform designed to help users manage tasks, build consistent habits, and track personal growth through a clean and intuitive dashboard.

🌐 Live Demo: https://zenith-wnfa.onrender.com

✨ Features
🔐 Authentication & Security
Secure user registration and login
Password hashing and protected routes
User-specific task and habit management
📋 Task Management
Create, edit, and delete tasks
Set task priorities and statuses
Track deadlines and progress
Organize daily productivity efficiently
🎯 Habit Tracking
Create personalized habits
Daily habit completion logging
Custom habit icons and colors
Consistency tracking and progress monitoring
📊 Dashboard Analytics
Overview of tasks and habits
Productivity insights
Progress tracking in one place
Real-time updates from the database
☁️ Deployment Ready
Hosted on Render
Persistent SQLite database storage
Data remains safe across deployments and server restarts
🛠️ Tech Stack
Category	Technologies
🎨 Frontend	HTML5, CSS3, JavaScript
⚙️ Backend	Node.js, Express.js
🗄️ Database	SQLite (sql.js)
🔒 Security	Authentication Middleware, Password Hashing
☁️ Deployment	Render
🔧 Tools	Git, GitHub, Custom Database Utilities
🏗️ Project Architecture
                ┌─────────────────┐
                │     Frontend    │
                │ HTML • CSS • JS │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Express Server  │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   🔐 Auth API      📋 Tasks API     🎯 Habits API
                         │
                         ▼
                📊 Dashboard API
                         │
                         ▼
                🗄️ SQLite Database
📂 Project Structure
Zenith/
│
├── public/              # Frontend files
├── controllers/         # API route handlers
├── middleware/          # Authentication middleware
├── database/            # SQLite database
├── server.js            # Main server file
├── view-db.js           # Database viewer utility
├── render.yaml          # Deployment configuration
└── package.json
🌟 Key Highlights

✅ Full-Stack Web Application

✅ Secure Authentication System

✅ RESTful API Architecture

✅ Modular Backend Design

✅ SQLite Relational Database

✅ Habit Tracking & Task Management

✅ Single Page Application (SPA) Support

✅ Cloud Deployment with Persistent Storage

✅ Developer Utility for Database Inspection

🚀 Getting Started
1️⃣ Clone the Repository
git clone <repository-url>
cd Zenith
2️⃣ Install Dependencies
npm install
3️⃣ Run the Application
npm start
4️⃣ Open in Browser
http://localhost:3000
🗄️ Database Design

The application uses a relational SQLite database consisting of:

👤 Users
User authentication data
Unique usernames and emails
Secure password storage
📋 Tasks
Task details
Priority levels
Status tracking
Due dates
🎯 Habits
Habit information
Icons and color customization
📅 Habit Logs
Daily completion records
Consistency tracking
Duplicate entry prevention
☁️ Deployment

Zenith is deployed on Render with a dedicated persistent disk configuration to ensure all user data remains available after deployments and server restarts.

🔗 Live Application: https://zenith-wnfa.onrender.com

🔮 Future Enhancements
🔥 Habit Streak Tracking
📈 Advanced Analytics & Charts
🔔 Notifications & Reminders
📅 Calendar Integration
📱 Mobile Optimization
📤 Data Export (CSV/PDF)
🎨 Dark Mode Support
👤 User Profile Customization
👨‍💻 Author

Developed as a full-stack project to demonstrate skills in:

Node.js & Express.js
Database Design & Management
Authentication & Security
REST API Development
Cloud Deployment
Full-Stack Web Development

⭐ If you found this project interesting, consider giving it a star on GitHub!
