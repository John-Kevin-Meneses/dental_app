# 🦷 Dental App

A full-stack dental clinic management system built using the MERN stack. It enables appointment scheduling, user authentication, and comprehensive management of dentists, patients, and procedures.

---

## 🚀 Tech Stack

**Frontend**  
- React + Vite  
- React Router  
- CSS Modules

**Backend**  
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication

---

## 📁 Folder Structure

<details>
<summary><strong>Click to expand</strong></summary>

```
dental_app/
├── backend/
│   ├── config/
│   │   └── database.js                # Database connection setup
│   ├── controllers/                  # Route logic and request handlers
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── dentistController.js
│   │   ├── patientController.js
│   │   ├── procedureController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Dentist.js
│   │   ├── Patient.js
│   │   ├── Procedure.js
│   │   └── User.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dentistRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── procedureRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── server.js

├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── homepage/
│       │   │   ├── footer/
│       │   │   └── header/
│       │   └── home/
│       │       ├── contents/
│       ├── user/
│       ├── routes/
│       ├── services/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.html
│   ├── .gitignore
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
```

</details>

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dental_app.git
cd dental_app
```

### 2. Backend Setup

```bash
cd backend
npm install
# Set up your .env file
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 🤝 Contributing

Pull requests are welcome!

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 📬 Contact

- Email: your-email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)
