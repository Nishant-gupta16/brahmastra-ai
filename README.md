# 🚀 BRAHMASTRA AI

**Brahmastra AI** is a modern, futuristic, and fully responsive AI assistant built using modern web technologies. It provides an intelligent chat experience powered by Google's Gemini API, with real-time streaming responses, voice input, Firebase authentication, and cloud-based chat history.

The application offers both a free demo chat experience and a full authenticated chat experience with persistent conversation history.

---

## 🌐 Live Demo

| Service | Link |
|---|---|
| 🌍 Live Application | https://brahmastra-ai-2.onrender.com/ |
| ⚙️ Backend API | https://brahmastra-ai.onrender.com/ |
| 💻 GitHub Repository | https://github.com/Nishant-gupta16/brahmastra-ai |

---

## 📸 Project Preview

Add your application screenshots inside the `screenshots/` folder.

### 🏠 Home Page
![Home Page](screenshots/home.png)

### 💬 Demo Chat
![Demo Chat](screenshots/demo-chat.png)

### 🔐 Login / Signup
![Login Page](screenshots/login.png)

### 💾 Logged-in Chat
![Login Chat](screenshots/login-chat.png)

---

## ✨ Features

### 🔐 1. Authentication System

- Firebase Email and Password Authentication.
- User Registration and Login.
- Persistent login sessions.
- Protected routes for authenticated users.
- Custom logout confirmation popup.
- User display name support.
- Automatic redirection for authentication-based routes.

### 💬 2. AI Chat System

- Real-time streaming AI responses powered by Google Gemini API.
- Markdown response rendering.
- Support for headings, lists, tables, and code blocks.
- Copy AI responses to clipboard.
- Read responses aloud using Text-to-Speech.
- Share AI responses.
- Regenerate AI responses.
- Edit previously sent user messages.
- Delete messages.
- Stop AI response generation.
- Automatic scrolling for new conversations.
- Smooth chat experience.

### 🎙️ 3. Voice Input

- Browser-based Web Speech API.
- Voice-to-text functionality.
- English (India) and Hinglish-oriented input.
- Continuous listening mode.
- Silence detection with automatic sending, where supported.
- Microphone permission handling.
- Recommended browsers: Google Chrome and Microsoft Edge.

### 📚 4. Chat History Management

- Store conversations in Firebase Cloud Firestore.
- User-specific chat history.
- Each user's chats remain isolated.
- Search conversations by title.
- Pin and unpin important chats.
- Delete conversations using the Bin feature.
- Restore deleted conversations.
- Soft-delete functionality.
- Automatic cleanup after the configured retention period.
- Custom confirmation dialogs.

### 🧪 5. Demo Chat Mode

**Route:** `/chat`

- No login or registration required.
- Five free user messages.
- Login prompt after reaching the message limit.
- Conversations stored temporarily in memory.
- No Firestore writes in demo mode.
- Demo session resets after refreshing the page.
- Login option for accessing the full chat experience.

### 🖼️ 6. Image Upload

- Image upload interface placeholder.
- Coming Soon notification.
- Future integration planned for Gemini image understanding.

### 🌙 7. Modern UI/UX

- Futuristic cyberpunk and space-inspired interface.
- Dark theme with neon effects.
- Animated landing page with planet visuals.
- Smooth transitions and hover animations.
- Loading animations and shimmer effects.
- Custom success, error, and information notifications.
- Custom confirmation modals.
- Settings modal with multiple sections.
- Fully responsive design.
- Desktop, tablet, and mobile support.

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI development |
| Vite | Fast development and build tool |
| JavaScript | Application logic |
| Tailwind CSS | Responsive styling |
| React Router DOM v6 | Client-side routing |
| Firebase SDK | Authentication and Firestore |
| React Markdown | Markdown rendering |
| Remark GFM | GitHub Flavored Markdown |
| React Speech Recognition | Voice input |
| Lucide React | Icons |
| Regenerator Runtime | Async runtime support |

### Backend Technologies

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend API framework |
| Google Gemini API | AI-powered responses |
| @google/genai | Gemini API integration |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

### Database and Hosting

| Technology | Purpose |
|---|---|
| Firebase Authentication | User authentication |
| Cloud Firestore | Chat history storage |
| Render | Backend deployment |
| Vercel | Frontend deployment |
| Git & GitHub | Version control |

---

## 📂 Project Structure

```text
brahmastra-ai/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── LoginChat.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Technology.jsx
│   │   │   ├── Journal.jsx
│   │   │   └── Contact.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── speech.js
│   │   │
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── screenshots/
│   ├── home.png
│   ├── demo-chat.png
│   ├── login.png
│   └── login-chat.png
│
├── vercel.json
├── .gitignore
└── README.md
```

---

## 🗺️ Application Routes

| Route | Page | Authentication | Description |
|---|---|---|---|
| `/` | Home | Not Required | Landing page |
| `/explore` | Explore | Not Required | AI capabilities |
| `/technology` | Technology | Not Required | Technology overview |
| `/journal` | Journal | Not Required | Blog and articles |
| `/contact` | Contact | Not Required | Contact page |
| `/login` | Login / Signup | Not Required | Firebase authentication |
| `/chat` | Demo Chat | Not Required | Five-message free trial |
| `/loginchat` | LoginChat | Required | Full AI chat with history |

---

## 🔥 Firebase Firestore Data Model

Brahmastra AI uses Cloud Firestore to store authenticated users' conversations.

### Database Structure

```text
users/
  └── {uid}/
      └── chats/
          └── {chatId}/
              ├── title
              ├── createdAt
              ├── updatedAt
              ├── messageCount
              ├── pinned
              ├── deletedAt
              │
              └── messages/
                  └── {messageId}/
                      ├── role
                      ├── content
                      ├── createdAt
                      └── order
```

### Field Description

| Field | Description |
|---|---|
| uid | Unique Firebase user ID |
| chatId | Unique conversation ID |
| title | Conversation title |
| createdAt | Chat creation timestamp |
| updatedAt | Last update timestamp |
| messageCount | Total message count |
| pinned | Pin status |
| deletedAt | Soft-delete timestamp |
| role | User or assistant |
| content | Message content |
| order | Message ordering number |

### Firestore Security Rules

Use the following rules in Firebase Console → Firestore Database → Rules.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/chats/{chatId} {

      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      match /messages/{messageId} {

        allow read, write: if request.auth != null
                           && request.auth.uid == userId;

      }
    }
  }
}
```

**Security Note:**

- Each authenticated user can access only their own chats.
- Never use open test rules in production.
- Validate data fields and types for stronger security.
- Keep Gemini API credentials on the backend.

---

## ⚙️ Installation and Setup

Follow these steps to run Brahmastra AI locally.

### Prerequisites

Make sure you have installed:

- Node.js 18 or later.
- npm.
- Git.
- Google Gemini API Key.
- Firebase Account.

### Step 1: Clone Repository

```bash
git clone https://github.com/Nishant-gupta16/brahmastra-ai.git
```

Move into the project directory:

```bash
cd brahmastra-ai
```

### Step 2: Backend Setup

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend folder.

Add the following variables:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:

```bash
npm run dev
```

If your package does not contain a development script, use:

```bash
node server.js
```

Backend local URL:

```text
http://localhost:5000
```

### Step 3: Get Google Gemini API Key

1. Visit Google AI Studio.
2. Open the API Key section.
3. Create a new API key.
4. Copy the API key.
5. Add it to your backend `.env` file.

API Key:

https://aistudio.google.com/apikey

**Important:** Never upload your Gemini API key to GitHub.

### Step 4: Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

### Step 5: Firebase Configuration

1. Open Firebase Console.
2. Create a Firebase project.
3. Register a Web Application.
4. Copy your Firebase configuration.
5. Open `frontend/src/firebase.js`.
6. Add your Firebase project configuration.

Example:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 6: Configure Backend API URL

In `Chat.jsx` and `LoginChat.jsx`, configure your backend API endpoint.

For local development:

```javascript
const API_URL = "http://localhost:5000/api/chat";
```

For deployed backend:

```javascript
const API_URL = "https://brahmastra-ai.onrender.com/api/chat";
```

If you use Vite environment variables, you can configure the URL using `VITE_API_URL` instead.

### Step 7: Start Frontend

Run:

```bash
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

Now your Brahmastra AI application should be running locally.

---

## 🔐 Firebase Console Configuration

### Enable Authentication

1. Open Firebase Console.
2. Select your project.
3. Navigate to Authentication.
4. Select Sign-in Method.
5. Enable Email/Password authentication.

### Enable Cloud Firestore

1. Open Firestore Database.
2. Create a database.
3. Select your database location.
4. Open the Rules tab.
5. Add the security rules provided above.
6. Publish the rules.

Also add your deployed frontend domain under Firebase Authentication → Settings → Authorized domains.

---

## 🌐 Deployment Guide

### Backend Deployment — Render

Brahmastra AI backend is deployed using Render.

Steps:

1. Open Render.
2. Connect your GitHub account.
3. Select the Brahmastra AI repository.
4. Create a new Web Service.
5. Set Root Directory to `backend`.
6. Set Build Command:

```bash
npm install
```

7. Set Start Command:

```bash
node server.js
```

8. Add Environment Variables:

```env
GEMINI_API_KEY=your_gemini_api_key
```

9. Deploy the backend.

Live Backend:

https://brahmastra-ai.onrender.com/

### Frontend Deployment — Vercel

Steps:

1. Open Vercel.
2. Import the GitHub repository.
3. Set Root Directory to `frontend`.
4. Select Vite framework.
5. Set Build Command:

```bash
npm run build
```

6. Set Output Directory:

```text
dist
```

7. Configure the backend API URL.
8. Deploy the frontend.

### Vercel SPA Configuration

For direct navigation to React routes, configure `vercel.json` in the frontend deployment root.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration supports routes such as:

- `/chat`
- `/login`
- `/loginchat`
- `/explore`

---

## 🔒 Environment Variables and Security

| Variable | Location | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Backend | Gemini API authentication |
| `PORT` | Backend | Express server port |
| Firebase Config | Frontend | Firebase application connection |
| `VITE_API_URL` | Frontend (optional) | Backend API endpoint |

### Important Security Practices

- Never commit `.env` files.
- Add `.env` to `.gitignore`.
- Never expose Gemini API keys in frontend code.
- Use Firebase Firestore Security Rules.
- Restrict CORS to trusted frontend domains.
- Rotate API keys immediately if accidentally exposed.

---

## 🧪 Local Testing Checklist

- [ ] Backend starts successfully.
- [ ] Frontend loads successfully.
- [ ] Home page displays correctly.
- [ ] Demo chat works without login.
- [ ] Five-message demo limit works.
- [ ] Firebase signup works.
- [ ] Firebase login works.
- [ ] Protected chat route works.
- [ ] AI streaming responses work.
- [ ] Chat history is saved.
- [ ] Chat history remains after refresh.
- [ ] Pin and unpin functionality works.
- [ ] Delete and restore functionality works.
- [ ] Voice input works.
- [ ] Responsive layout works on mobile and desktop.

---

## 🔧 Troubleshooting

| Problem | Possible Solution |
|---|---|
| Failed to fetch | Check backend URL, server status, and CORS configuration. |
| Gemini API error | Verify your Gemini API key and model availability. |
| Firebase login error | Enable Email/Password authentication. |
| Firestore permission denied | Check Firebase security rules and authenticated UID. |
| White screen | Check browser console for JavaScript errors. |
| Voice input not working | Use Chrome or Edge and allow microphone access. |
| Slow AI response | Check backend logs and hosting cold-start behavior. |
| 404 on direct routes | Verify Vercel SPA rewrite configuration. |
| Chat history not saving | Verify Firestore configuration and write permissions. |
| Deployment failed | Check build logs, dependencies, and environment variables. |

---

## 🎨 Customization

### Change Theme

Update Tailwind CSS classes and configuration to customize:

- Background colors.
- Neon effects.
- Gradients.
- Animations.
- Typography.

### Change Branding

Update the project name and logo in:

- `Navbar.jsx`
- `Home.jsx`

### Customize AI Behavior

Modify the Gemini system instruction in:

```text
backend/server.js
```

You can customize the assistant's behavior, response style, and instructions.

---

## 🚧 Future Roadmap

- [ ] Image Upload and AI Vision Analysis.
- [ ] Export Chat as PDF.
- [ ] Export Chat as Markdown.
- [ ] Multi-language Voice Input.
- [ ] Chat Folders and Categories.
- [ ] Shared Chat Links.
- [ ] Partial Response Recovery.
- [ ] Progressive Web App Support.
- [ ] Offline Mode.
- [ ] Light and Dark Theme Toggle.
- [ ] Improved AI Personalization.

---

## 🤝 Contributing

Contributions are welcome!

If you want to improve Brahmastra AI:

1. Fork this repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add: your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

For bugs and suggestions, visit:

https://github.com/Nishant-gupta16/brahmastra-ai/issues

---

## 📄 License

This project is intended to be distributed under the MIT License.

Add a `LICENSE` file containing the full MIT License text before publishing the project under this license.

---

## 👨‍💻 Author

<p align="center">
  <strong>Nishant Gupta</strong>
  <br />
  Full Stack Developer
  <br /><br />
  <a href="https://github.com/Nishant-gupta16">
    <img src="https://img.shields.io/badge/GitHub-Nishant--gupta16-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://linkedin.com/in/nishant-gupta-2483b7334">
    <img src="https://img.shields.io/badge/LinkedIn-Nishant%20Gupta-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn">
  </a>
</p>

**Project Repository:**

https://github.com/Nishant-gupta16/brahmastra-ai

---

## 🙏 Acknowledgements

Special thanks to the following technologies and platforms:

- Google Gemini API — AI-powered responses.
- React — Frontend development.
- Vite — Fast development environment.
- Firebase — Authentication and database.
- Node.js — Backend runtime.
- Express.js — API development.
- Tailwind CSS — Modern styling.
- Lucide React — Icons.
- Render — Backend hosting.
- Vercel — Frontend deployment.

---

<p align="center">
  <h3 align="center">🚀 BRAHMASTRA AI</h3>
  <p align="center">
    Where Creativity Meets Intelligence.
    <br />
    Nishant Gupta
  </p>
</p>
