# 🚀 Zenith – Productivity & Habit Tracking Dashboard

A full-stack productivity platform designed to help users manage tasks, build consistent habits, and track personal growth through a clean and intuitive dashboard.

🌐 **Live Demo:** https://zenith-wnfa.onrender.com

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login
- Password hashing and protected routes
- User-specific task and habit management

### 📋 Task Management
- Create, edit, and delete tasks
- Set task priorities and statuses
- Track deadlines and progress
- Organize daily productivity efficiently

### 🎯 Habit Tracking
- Create personalized habits
- Daily habit completion logging
- Custom habit icons and colors
- Monitor consistency and progress

### 📊 Dashboard Analytics
- Overview of tasks and habits
- Productivity insights
- Progress tracking
- Real-time database updates

### ☁️ Deployment Ready
- Hosted on Render
- Persistent SQLite database storage
- Data preserved across deployments and server restarts

---

## 🛠️ Tech Stack

| Category | Technologies |
|-----------|-------------|
| 🎨 Frontend | HTML5, CSS3, JavaScript |
| ⚙️ Backend | Node.js, Express.js |
| 🗄️ Database | SQLite (sql.js) |
| 🔒 Security | Authentication Middleware, Password Hashing |
| ☁️ Deployment | Render |
| 🔧 Tools | Git, GitHub |

---

## 🏗️ Architecture

```text
Frontend (HTML, CSS, JS)
           │
           ▼
    Express Server
           │
 ┌─────────┼─────────┐
 │         │         │
 ▼         ▼         ▼
Auth     Tasks    Habits
 API      API       API
           │
           ▼
    Dashboard API
           │
           ▼
    SQLite Database
```

---

## 📂 Project Structure

```text
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
```

---

## 🌟 Key Highlights

✅ Full-Stack Web Application

✅ Secure Authentication System

✅ RESTful API Architecture

✅ Modular Backend Design

✅ SQLite Relational Database

✅ Habit Tracking & Task Management

✅ Cloud Deployment with Persistent Storage

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/zenith.git
cd zenith
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm start
```

### Open in Browser

```text
http://localhost:3000
```

---

## 🔮 Future Enhancements

- 🔥 Habit streak tracking
- 📈 Advanced analytics and charts
- 🔔 Notifications and reminders
- 📅 Calendar integration
- 📱 Mobile responsiveness improvements
- 🌙 Dark mode support

---

## 👨‍💻 Author

Developed as a full-stack project demonstrating:

- Node.js & Express.js
- Database Design
- Authentication & Security
- REST API Development
- Cloud Deployment
- Full-Stack Web Development

⭐ If you like this project, consider giving it a star on GitHub!
