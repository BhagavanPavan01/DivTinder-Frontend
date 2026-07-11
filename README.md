# 💻🚀 divTinder - The Developer Connection Community

**divTinder** is a modern, responsive, full-stack MERN application tailored specifically for the global tech community! Designed to act as a hub where developers can connect, collaborate, and partner up on projects. Think of it as a professional matching platform to find your next coding partner, open-source contributor, or simply make new friends in the tech ecosystem. 

---

## 🔥 Features & Functionality

### 🔐 Secure Authentication & User Profiles
- Secure JWT-based Login and Signup processes with encrypted passwords.
- **Detailed User Profiles**: Setup your avatar, set a custom bio, fill in your gender, age, and contact information.
- **Skill Engine**: Add a variety of predefined tech stack skills (`MERN Stack`, `Python`, `Machine Learning`, `Java`, etc.) that act as searchable vectors to find you the best coding partners.

### 📊 Interactive Dashboard
- A fully responsive analytics dashboard for your account footprint. 
- Real-time statistics showing your total **Connections**, **Pending Requests**, and **Sent Requests**.
- A visually driven **Recent Activity** timeline.
- A **Recommendations Engine** preview linking you straight to developers that match your coding language preferences!

### 🤝 The "Feed" & Connections System
- Browse an interactive Feed populated exclusively by developers.
- Send connection requests instantly to collaborate with potential partners.
- **Request Management**: Check your **Inbox** for incoming requests with the ability to `✓ Accept` or `✗ Decline` directly from beautifully laid out responsive cards. You can also actively track all your **Sent Requests**.

### 💬 Real-Time WhatsApp-Style Chat (Socket.io)
When a connection is mutual, the chat unlocks!
- **Real-Time Messaging**: Built completely on `Socket.io` allowing instantaneous delivery with no page refreshing necessary.
- **Advanced Chat UI**: 
  - Rich chat bubbles representing Sent/Received flows seamlessly.
  - **Typing Indicators**: Displays when the user you're talking to is currently typing.
  - **Online/Offline Status**: Know instantly if your connection is online.
  - **Replies & Deletions**: Seamlessly "Reply" to specific messages or "Delete" sent messages actively synced across both frontends.

---

## 🛠️ Technology Stack

**Frontend Architecture**:
- **React 18** powered by **Vite** for blazing fast performance.
- **Tailwind CSS** alongside **DaisyUI** for stunning, glass-morphic, and fully responsive layouts that look identical to a native mobile app on small screens.
- **React-Router-Dom** for dynamic routing.
- **Axios** and **Socket.io-Client** for API & WebSocket interactions.

**Backend Infrastructure** (running separately):
- **Node.js** + **Express.js** providing all RESTful route handling.
- **MongoDB** + **Mongoose** for heavy-duty NoSQL document storage.
- **Socket.io** web-socket server handling bi-directional live chat and read-receipts.
- **JSON Web Tokens (JWT)** handled inside cookies for robust, stateless session authentication.

---

## 👨‍💻 Developer Information

Built entirely from the ground up for the developer ecosystem!

- **Developed By**: Bhagavan Pavan
- **Portfolio**: [bhagavanpavan-portfolio.netlify.app](https://bhagavanpavan-portfolio.netlify.app/)
- **LinkedIn**: [Bhagavan Pavan](https://www.linkedin.com/in/bhagavan-pavan-227857253/)
- **GitHub Profile**: [@BhagavanPavan01](https://github.com/BhagavanPavan01)

---

## 🚀 Running the Project Locally

Assuming you have `Node.js` installed on your machine and the backend repository properly wired up to a local or remote MongoDB instance:

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Ensure you have configured `API_BASE_URL` properly inside `/src/config/api.js` or via a `.env` file referencing your Express dev server (typically `http://localhost:3000`).
4. **Boot the Vite Development Server**
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:5173/` in your browser!

*Happy Coding and Happy Connecting!* 🚀
