# ⬡ ProductApp

A full-stack web application built with **Node.js**, **Express 5**, **TypeScript**, and **MySQL** — containerized with Docker. Users can sign up, log in, and search a product catalogue. Built as a CA project for ICT University.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express 5 + TypeScript |
| Database | MySQL 8.0 (Docker container) |
| Auth | Session-based (express-session + bcrypt) |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Runtime | tsx (runs TypeScript directly) |
| Container | Docker + Docker Compose |

---

## Features

- **Signup** — register with username, email, and hashed password
- **Login** — session-based authentication against MySQL users table
- **Protected Search** — only logged-in users can access the product search page
- **Product Search** — query products by name or description (partial match)
- **Persistent Storage** — MySQL data survives container restarts via Docker volume
- **Auto DB Init** — tables created and seeded automatically on first run

---

## Project Structure

```
product-app/
├── src/
│   ├── server.ts              # Entry point — starts server, inits DB
│   ├── app.ts                 # Express app, middleware, routes
│   ├── db.ts                  # MySQL connection pool
│   ├── routes/
│   │   ├── auth.ts            # POST /auth/signup, /auth/login, /auth/logout
│   │   └── products.ts        # GET /products/search?q=..., GET /products
│   └── middleware/
│       └── requireAuth.ts     # Protects routes that need a logged-in session
├── public/
│   ├── login.html
│   ├── signup.html
│   └── search.html
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Running Locally with Docker

> **Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone the repo
git clone https://github.com/fanyicharllson/product-app.git
cd product-app

# 2. Start all services (builds app image + pulls MySQL image)
docker compose up --build

# 3. Open in browser
# http://localhost:3000
```

That's it. No local MySQL install needed — everything runs in containers.

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and create session |
| `POST` | `/auth/logout` | No | Destroy session |
| `GET` | `/products/search?q=` | ✅ Yes | Search products by name/description |
| `GET` | `/products` | ✅ Yes | List all products |

### Example Request (Thunder Client / Postman)

**POST** `http://localhost:3000/auth/signup`
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

**GET** `http://localhost:3000/products/search?q=laptop`
> Requires an active session cookie from login.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed:

```env
DB_HOST=db
DB_PORT=3306
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=productdb
SESSION_SECRET=super_secret_change_in_production
PORT=3000
```

> When running with Docker Compose, environment variables are injected via `docker-compose.yml` and the `.env` file is not required.

---

## Docker Hub

```bash
# Pull the image directly
docker pull fanyicharllson/product-app:latest
```

---

## Docker Commands Reference

| Command | What it does |
|---|---|
| `docker compose up --build` | Build image and start all containers |
| `docker compose up -d` | Start in detached mode (background) |
| `docker compose down` | Stop and remove containers (data kept) |
| `docker compose down -v` | Stop containers AND delete volumes (data lost) |
| `docker compose logs -f app` | Stream live logs from the app container |
| `docker ps` | List running containers |
| `docker images` | List local Docker images |

---

## Author

**fanyicharllson** — [github.com/fanyicharllson](https://github.com/fanyicharllson)  
Built with Node.js, Express, TypeScript, MySQL, Docker.