# Mankousheh Go Backend

This repository contains the Node.js/Express backend for **Mankousheh Go**, a white‑label clone of the Shini Go supermarket application. The server provides RESTful APIs for user authentication, product catalog management, cart handling, order processing, and push notifications. It is designed to work with a cross‑platform mobile client (e.g. React Native) and an optional admin dashboard.

## Features

- **Authentication**: User registration and login with JWT. Roles (`user`/`admin`) supported.
- **Products & Categories**: CRUD endpoints for products and categories. Public listing of available products with search and category filtering.
- **Cart**: Logged‑in users can add items to their cart, update quantities, and remove items.
- **Orders**: Place orders from a cart or direct item list, track order status, cancel orders, and view order history.
- **Addresses**: Manage multiple delivery addresses per user, with default selection.
- **Notifications**: Persist notifications in MongoDB and optionally send push messages via Firebase Cloud Messaging.
- **Admin**: List users, change user roles, and view all orders. Product and category management is protected by admin role.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a `.env` file** based on `.env.example` and set your MongoDB URI, JWT secret, and Firebase credentials if using push notifications.

3. **Run the server**

   ```bash
   npm run dev
   ```

4. **Docker**: Use the provided `Dockerfile` and `docker-compose.yml` to run the API and MongoDB together.

5. **API Documentation**: Endpoints are organised under `/api`:

   - `POST /api/auth/register` – Register a new user.
   - `POST /api/auth/login` – Authenticate using email/phone and password.
   - `POST /api/auth/fcm-token` – Save an FCM token for push notifications.
   - `GET /api/products` – List products. Supports `?search=` and `?category=` query params.
   - `POST /api/products` – Create product (admin only).
   - `GET /api/categories` – List categories.
   - `POST /api/categories` – Create category (admin only).
   - `GET /api/cart` – Get current user's cart.
   - `POST /api/cart` – Add item to cart.
   - `PUT /api/cart/item/:productId` – Update quantity.
   - `DELETE /api/cart/item/:productId` – Remove item.
   - `POST /api/orders` – Create an order.
   - `GET /api/orders` – Get current user's orders.
   - `DELETE /api/orders/:id` – Cancel order.
   - `PATCH /api/orders/:id/status` – Update order status (admin).
   - `GET /api/profile` – Get user profile.
   - `PUT /api/profile` – Update profile.
   - `POST /api/profile/address` – Add address.
   - ...and more.

Consult the source code in `controllers/` and `routes/` for full details of request/response formats.