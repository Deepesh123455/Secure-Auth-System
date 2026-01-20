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
- **Validation:** Joi / Zod (Optional: update if you used these)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

**1. Clone the repository**
```bash
git clone [https://github.com/YOUR_USERNAME/REPO_NAME.git](https://github.com/YOUR_USERNAME/REPO_NAME.git)
cd REPO_NAME
