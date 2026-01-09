# 📝 Real-time Collaboration Platform – Backend

A production-ready backend for a **real-time document collaboration platform**, similar to Google Docs (backend only).  
Built using **Node.js, Express, MongoDB, JWT Authentication, and Socket.IO**.

This backend supports:
- Secure user authentication
- Document CRUD operations
- Real-time collaborative editing
- Version control with rollback
- Role-based access (owner & collaborators)

---

## 📌 Tech Stack

- **Node.js** – Runtime
- **Express.js** – REST API framework
- **MongoDB + Mongoose** – Database & ODM
- **JWT (JSON Web Token)** – Authentication
- **Socket.IO** – Real-time communication
- **bcryptjs** – Password hashing
- **dotenv** – Environment variables
- **nodemon** – Development auto-restart

---

## 📂 Project Structure
```
src/
├── config/
│   └── db.js                # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   └── Document.js          # Document + Version schema
├── controllers/
│   ├── auth.controller.js   # Auth business logic
│   └── document.controller.js
├── routes/
│   ├── auth.routes.js       # Auth routes
│   └── document.routes.js   # Document routes
├── middleware/
│   └── auth.middleware.js   # JWT auth middleware
├── sockets/
│   └── document.socket.js   # Socket.IO logic
└── index.js                 # App entry point
```

---

## ⚙️ How the Backend Works (High Level)

1. **User Authentication**
   - Users register/login using REST APIs
   - JWT token is issued on successful login
   - Token is required for protected routes

2. **Document Management**
   - Authenticated users can create documents
   - Document has:
     - Owner
     - Collaborators
     - Content
     - Versions (history)

3. **Real-time Collaboration**
   - Socket.IO manages live editing
   - Users join a document-specific room
   - Changes are broadcast to other users
   - Cursor positions can be shared

4. **Version Control**
   - Each save creates a snapshot
   - Users can restore any previous version

---

## 🔐 Authentication Flow

1. User registers → password hashed using `bcrypt`
2. User logs in → JWT token generated
3. Token sent in headers:
```
Authorization: Bearer <TOKEN>
```
4. `auth.middleware.js`:
   - Verifies token
   - Attaches `req.user`

---

## 🧩 Database Design

### User Schema
- name
- email (unique)
- password (hashed)
- timestamps

### Document Schema
- title
- content
- owner
- collaborators
- versions[]
- isPublic
- timestamps

Each version stores:
- content snapshot
- savedBy
- savedAt

---

## 🚀 Getting Started

### 1️⃣ Clone Repository
```bash
git clone https://github.com/abhaygarg3504/locus-hackathon.git
cd locus-hackathon
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Environment Variables

Create `.env` in root:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collab-platform
JWT_SECRET=your_secret_key
NODE_ENV=development
```

> ⚠️ `.env` should never be committed to GitHub.

---

### 4️⃣ Start MongoDB
```bash
mongod
```

---

### 5️⃣ Run Server
```bash
npm run dev
```

Expected output:
```
MongoDB Connected Successfully
Server running on port 5000
```

---

## 🧪 API Endpoints

### Auth Routes

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register new user  |
| POST   | /api/auth/login    | Login user         |
| GET    | /api/auth/me       | Get logged-in user |

---

### Document Routes (Protected)

| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| POST   | /api/documents                   | Create document        |
| GET    | /api/documents                   | Get all user documents |
| GET    | /api/documents/:id               | Get single document    |
| PUT    | /api/documents/:id               | Update document        |
| DELETE | /api/documents/:id               | Delete document        |
| POST   | /api/documents/:id/versions      | Save version           |
| POST   | /api/documents/:id/restore       | Restore version        |
| POST   | /api/documents/:id/collaborators | Add collaborator       |

---

## 🔌 Socket.IO Events

| Event            | Purpose             |
|------------------|---------------------|
| join-document    | Join document room  |
| edit-document    | Live content update |
| document-updated | Receive changes     |
| save-version     | Save snapshot       |
| version-saved    | Notify users        |
| cursor-position  | Share cursor        |
| leave-document   | Leave room          |

Each document has its own socket room using `documentId`.

---

## 🛡️ Access Control Rules

- Only authenticated users can access documents
- Only owners can:
  - Delete documents
  - Add collaborators
- Collaborators can:
  - Edit content
  - Save versions
- Public documents can be viewed by anyone (optional)

---

## 🧠 Design Decisions

- **JWT instead of sessions** → scalable & stateless
- **Socket rooms per document** → efficient broadcasting
- **Version snapshots** → easy rollback
- **Mongoose population** → clean relational data
- **Middleware-based auth** → clean separation of concerns

---

## 🧑‍💻 For Next Developers

If you want to extend this project:

- Add rich-text editor on frontend
- Implement operational transforms (OT) or CRDTs
- Add document permissions (read/write)
- Add audit logs
- Add Redis for socket scaling

---

## 📄 License

This project is open-source and available under the **ISC License**.

---

## 💬 Interview Explanation (Use This)

> "I designed a real-time collaboration backend using Express and Socket.IO, with JWT-based authentication and MongoDB for persistence. The system supports document versioning, role-based access control, and real-time synchronization using document-specific socket rooms."

---

### ✅ Backend Ready for Production & Interviews 🚀
