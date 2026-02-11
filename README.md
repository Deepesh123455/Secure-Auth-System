# 🛡️ SecureAuth API

A production-ready Authentication & Authorization microservice built with **Node.js** and **Express**.

Unlike basic tutorials, this project focuses on **security best practices**, scalability, and performance optimization using **Redis caching** and **Rate Limiting**.

## 🚀 Key Features

### 🔐 Advanced Security
- **JWT & Session Management:** Implemented dual-strategy authentication using **Stateless JWTs** (Access Tokens) and **Refresh Tokens** stored in secure **HttpOnly Cookies** to prevent XSS attacks.
- **Rate Limiting:** Custom middleware to prevent **Brute Force** and **DDoS** attacks by limiting repeated requests from the same IP.
- **Password Hashing:** Utilizes `bcrypt` for secure password encryption before storage.

### ⚡ Performance & Scalability
- **Redis Caching:** Implements a whitelist/blacklist strategy for token management, significantly reducing database load during session validation.
- **Scalable Architecture:** Structured using the **MVC pattern** (Model-View-Controller) to ensure code maintainability and ease of testing.

### 🌐 OAuth Integration
- **Google Strategy:** Integrated **Passport.js** with Google OAuth 2.0 to allow seamless social logins.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Caching/Performance:** Redis
- **Security:** Helmet, CORS, Bcrypt, JWT, Express-Rate-Limit
- **Validation:** Joi / Zod (Optional)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

**1. Clone the repository**
```bash
git clone [https://github.com/Deepesh123455/Secure-Auth-System.git](https://github.com/Deepesh123455/Secure-Auth-System.git)
cd Secure-Auth-System
2. Install Dependencies
    npm install
3. Configure Environment VariablesCreate a .env file in the root directory and add the following configuration.(Note: You will need a local or Atlas MongoDB URI and a running Redis instance).
Server Configuration
* PORT=5000
* NODE_ENV=development

# Database Connection
MONGO_URI=your mongodb uri

# Redis Configuration (Caching)
REDIS_HOST=""
REDIS_PORT=""
# REDIS_PASSWORD=  <-- Uncomment if your Redis has a password

# JWT Secrets (Generate random strong strings for these)
JWT_ACCESS_SECRET=your_super_secret_access_key_123
JWT_REFRESH_SECRET=your_super_secret_refresh_key_456
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=""
4. Run the ServerYou can run the server in development mode (with auto-restart) or production mode.
# Development Mode
* (uses nodemon)
# Productions mode
* npm run dev

# Production Mode
npm start
📡 API Endpoints OverviewMethodEndpointDescriptionPOST/api/auth/registerRegister a new userPOST/api/auth/loginLogin & receive HttpOnly CookieGET/api/auth/googleInitiate Google LoginPOST/api/auth/refreshGet new Access Token via Refresh TokenPOST/api/auth/logoutClear Session & Redis Cache
