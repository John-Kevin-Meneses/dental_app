# dental_app

backend/
├── config/
│   └── database.js                # Database connection setup
├── controllers/                  # Route logic and request handlers
│   ├── appointmentController.js
│   ├── authController.js
│   ├── dentistController.js
│   ├── patientController.js
│   ├── procedureController.js
│   └── userController.js
├── middlewares/                 # Custom middleware functions
│   └── authMiddleware.js
├── models/                      # Mongoose schema definitions
│   ├── Appointment.js
│   ├── Dentist.js
│   ├── Patient.js
│   ├── Procedure.js
│   └── User.js
├── routes/                      # Express route declarations
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── dentistRoutes.js
│   ├── patientRoutes.js
│   ├── procedureRoutes.js
│   └── userRoutes.js
├── services/                    # Business logic or external service calls (if any)
├── .gitignore                   # Git ignore rules
├── package-lock.json            # NPM lock file
├── package.json                 # Project metadata and dependencies
└── server.js                    # Entry point of the backend server


frontend/
│
├── node_modules/
├── public/
└── src/
    ├── components/
    │   ├── homepage/
    │   │   ├── footer/
    │   │   │   ├── footer.css
    │   │   │   └── footer.jsx
    │   │   └── header/
    │   │       ├── header.css
    │   │       └── header.jsx
    │   └── home/
    │       ├── contents/
    │       │   ├── contacts.jsx
    │       │   ├── main_page.jsx
    │       │   └── services.jsx
    │       ├── home.css
    │       └── home.jsx
    │
    ├── user/
    │   ├── Login/
    │   │   ├── actions.js
    │   │   ├── Login.css
    │   │   └── Login.jsx
    │   └── User/
    │       ├── actions.js
    │       ├── User.css
    │       └── User.jsx
    │
    ├── routes/
    │   └── protectedRoute.jsx
    │
    ├── services/
    │   └── api.js
    │
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    │
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── vite.config.js
