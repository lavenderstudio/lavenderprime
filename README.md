# 🖼️ Golden Art Frames

A full-stack **MERN** (MongoDB · Express · React · Node.js) e-commerce platform for ordering custom photo prints, framed art, canvas prints, collages, and exclusive wedding products — all with a live in-browser editor experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Customer Flow](#customer-flow)
  - [Editor Flow](#editor-flow)
  - [Checkout & Payment Flow](#checkout--payment-flow)
  - [Admin Flow](#admin-flow)
- [Pages & Routes](#pages--routes)
- [Product Editors](#product-editors)
- [Backend API](#backend-api)
- [Database Models](#database-models)
- [Authentication & Authorization](#authentication--authorization)
- [Third-Party Integrations](#third-party-integrations)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Building for Production](#building-for-production)

---

## Overview

Golden Art Frames is a premium photo product e-commerce store. Customers can:

- Upload their own photos through an interactive in-browser **product editor**
- Customize their products (size, orientation, frame, mount, mat, material)
- Add to cart and **checkout securely via Stripe**
- Track their orders from their personal account dashboard

Admins can manage orders, control dynamic pricing, publish blog posts, and view analytics from a dedicated admin panel.

---

## Tech Stack

### Frontend (`/client`)

| Technology                  | Purpose                                 |
| --------------------------- | --------------------------------------- |
| **React 19**                | UI framework                            |
| **Vite**                    | Build tool & dev server                 |
| **React Router v7**         | Client-side routing                     |
| **Tailwind CSS v4**         | Utility-first styling                   |
| **Framer Motion**           | Animations & transitions                |
| **Recharts**                | Admin analytics charts                  |
| **react-easy-crop**         | In-browser image cropping               |
| **@stripe/react-stripe-js** | Stripe payment UI elements              |
| **Tiptap**                  | Rich text editor for blog posts         |
| **Filestack JS**            | Image upload widget                     |
| **Axios**                   | HTTP client                             |
| **Lucide React**            | Icon library                            |
| **JSZip**                   | ZIP file generation for order downloads |

### Backend (`/server`)

| Technology              | Purpose                         |
| ----------------------- | ------------------------------- |
| **Node.js + Express 5** | REST API server                 |
| **MongoDB + Mongoose**  | Database & ODM                  |
| **Stripe**              | Payment processing & webhooks   |
| **Nodemailer**          | Transactional emails            |
| **bcryptjs**            | Password hashing                |
| **jsonwebtoken**        | JWT-based auth tokens           |
| **Multer**              | File upload handling            |
| **cookie-parser**       | HTTP cookie management          |
| **dotenv**              | Environment variable management |

---

## Project Structure

```
GoldenArtFrames/
├── client/                  # React frontend (Vite)
│   ├── public/              # Static assets (logo, icons, etc.)
│   └── src/
│       ├── App.jsx          # Root component with all routes
│       ├── main.jsx         # React app entry point
│       ├── components/      # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── UploadWizardModal.jsx
│       │   ├── MultiUploadWizardModal.jsx
│       │   ├── RequireAuth.jsx
│       │   ├── auth/        # Role-based guards
│       │   ├── home/        # Homepage section components
│       │   └── ...
│       ├── pages/           # Full page components (lazy-loaded)
│       │   ├── HomePage.jsx
│       │   ├── ProductsPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── Editor*.jsx  # All product editor pages
│       │   ├── Admin*.jsx   # Admin-only pages
│       │   └── ...
│       ├── context/         # React context providers
│       └── lib/             # Shared utilities
│           ├── api.js       # Axios instance with base URL
│           ├── cropImage.js # Canvas-based image crop util
│           ├── cloudinaryUpload.js
│           ├── frameStyles.js
│           ├── ratios.js
│           └── usePageTracker.js
│
├── server/                  # Express backend
│   └── src/
│       ├── index.js         # App entry point — mounts all routes
│       ├── config/          # DB connection (db.js)
│       ├── controllers/     # Route handler logic
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express route definitions
│       ├── middleware/      # Auth middleware, etc.
│       ├── utils/           # Helper functions (email, etc.)
│       └── seed/            # DB seed scripts for products/pricing
│
├── package.json             # Root scripts: build & start
└── README.md
```

---

## How It Works

### Customer Flow

1. **Browse Products** — The customer lands on the **Home Page**, which showcases all available product categories (prints, frames, canvas, wedding, etc.).
2. **Select a Product** — From the **Products Page**, the customer picks a product type which opens the corresponding **Editor**.
3. **Customize in the Editor** — The customer uploads their photo, crops/zooms it, picks a size/orientation and add-ons (frame, mount, mat, material), and previews a live render.
4. **Add to Cart** — The configured item is saved to the **Cart** (persisted via the API on the server).
5. **Checkout** — The customer fills in shipping details, selects a shipping method, and pays via **Stripe**.
6. **Order Confirmation** — On successful payment (via Stripe Webhook), an order is created in the database and a confirmation email is sent via **Nodemailer**.
7. **Track Orders** — Customers can view order status and details from their **Account / My Orders** page.

---

### Editor Flow

Each product has its own dedicated editor page. The general editor flow is:

```
Upload Photo → Crop & Zoom → Select Size/Orientation
→ Choose Add-ons (Frame, Mount, Mat)
→ Live Preview → Price Calculation → Add to Cart
```

The **Upload Wizard Modal** (`UploadWizardModal.jsx`) handles:

- Filestack-powered photo upload
- In-browser crop using `react-easy-crop`
- Crop area stored as pixel coordinates for server-side processing
- Preview image generation via canvas

For **multi-image products** (e.g., Mini Frames, Collage Frames), `MultiUploadWizardModal.jsx` allows uploading and cropping multiple photos independently, each with its own transform saved separately.

---

### Checkout & Payment Flow

```
CartPage → CheckoutPage → Stripe Payment → Stripe Webhook → Order Created → Email Sent
```

1. **CheckoutPage** calls `POST /api/payments/create-payment-intent` to get a Stripe `clientSecret`.
2. The customer completes payment using the **Stripe Elements** UI (card details).
3. Stripe sends a `payment_intent.succeeded` webhook to `POST /api/stripe/webhook`.
4. The webhook handler:
   - Creates the immutable **Order** document from the current cart
   - Updates order status to `paid`
   - Sends a **confirmation email** to the customer
   - Sends a **fulfillment email** to the admin
5. The customer is redirected to the **Order Success Page**.

---

### Admin Flow

Admins and managers access the admin panel at `/admin`. Features include:

| Page                  | URL                                         | Access         |
| --------------------- | ------------------------------------------- | -------------- |
| Orders & Management   | `/admin`                                    | Admin, Manager |
| Dashboard & Analytics | `/admin/dashboard`                          | Admin only     |
| Blog Management       | `/admin/blogs`                              | Admin, Manager |
| Blog Editor           | `/admin/blogs/new`, `/admin/blogs/:id/edit` | Admin, Manager |
| Pricing Management    | `/admin/pricing`                            | Admin, Manager |

**Admin Dashboard** shows:

- Total revenue, orders, customers (with trend vs. prior period)
- Orders & Revenue chart (daily breakdown)
- Top products by revenue
- Recent orders table
- Page view analytics

**Admin Orders Page** allows:

- View all orders with full details
- Update order status (paid → processing → shipped → completed)
- Add tracking number and carrier info
- Download all order images as a ZIP archive
- Send fulfillment emails

**Admin Pricing Page** allows dynamic price management for all products and variants without code changes.

---

## Pages & Routes

### Public Routes

| Route         | Page               | Description                                       |
| ------------- | ------------------ | ------------------------------------------------- |
| `/`           | `HomePage`         | Landing page with product sections & blog preview |
| `/products`   | `ProductsPage`     | All available products                            |
| `/cart`       | `CartPage`         | Shopping cart                                     |
| `/contact`    | `ContactPage`      | Contact form                                      |
| `/about`      | `AboutPage`        | About the brand                                   |
| `/delivery`   | `Delivery`         | Delivery information                              |
| `/blog`       | `BlogListPage`     | Blog article listing                              |
| `/blog/:slug` | `BlogPostPage`     | Individual blog post                              |
| `/order/:id`  | `OrderSuccessPage` | Post-payment confirmation                         |
| `/orders`     | `UserOrdersPage`   | My orders list                                    |

### Auth Routes (Guest only — redirect if logged in)

| Route              | Page                              |
| ------------------ | --------------------------------- |
| `/login`           | Login form                        |
| `/signup`          | Sign up form                      |
| `/forgot-password` | Request password reset            |
| `/reset-password`  | Set new password via emailed link |

### Protected Routes (Login required)

| Route       | Page                       |
| ----------- | -------------------------- |
| `/account`  | Account details & settings |
| `/checkout` | Checkout & payment         |

### Editor Routes

| Route                     | Editor                    |
| ------------------------- | ------------------------- |
| `/editor/print-frame`     | Print & Frame (portrait)  |
| `/editor/print`           | Print only                |
| `/editor/canvas`          | Canvas stretched print    |
| `/editor/mini-frames`     | Mini frames (multi-photo) |
| `/editor/collage-frame`   | Collage frame             |
| `/editor/wedding-frame`   | Wedding frame             |
| `/editor/wedding-print`   | Wedding print             |
| `/editor/fine-art-print`  | Fine art print            |
| `/editor/multiple-prints` | Multiple prints           |

### Admin Routes (Role-protected)

| Route                   | Role Required  |
| ----------------------- | -------------- |
| `/admin`                | Admin, Manager |
| `/admin/dashboard`      | Admin only     |
| `/admin/blogs`          | Admin, Manager |
| `/admin/blogs/new`      | Admin, Manager |
| `/admin/blogs/:id/edit` | Admin, Manager |
| `/admin/pricing`        | Admin, Manager |

---

## Product Editors

Each editor is a self-contained React page that:

1. **Fetches product data** from `/api/products/:slug` to get available variants and options
2. **Fetches pricing** from `/api/pricing` to calculate live prices
3. **Handles image upload** via the `UploadWizardModal` (or `MultiUploadWizardModal`)
4. **Renders a live preview** using product-specific preview components:
   - `PrintPreview.jsx` — flat print
   - `FramePreview.jsx` — framed portrait/landscape
   - `CanvasStretchedPreview.jsx` — canvas wrap effect
   - `MiniFramePreview.jsx` — mini frame grid
   - `CollagePreview.jsx` — collage layout
   - `WeddingFramePreview.jsx` — wedding frame design
   - `WeddingPrintPreview.jsx` — wedding print layout
5. **Calculates price** based on selected variant, quantity, and chosen add-ons
6. **Submits to cart** via `POST /api/cart/add`

---

## Backend API

The Express server runs on port `5000` (default) and exposes the following routes:

| Prefix             | Router File        | Description                    |
| ------------------ | ------------------ | ------------------------------ |
| `/api/health`      | inline             | Server health check            |
| `/api/products`    | `products.js`      | Fetch product catalog          |
| `/api/pricing`     | `pricing.js`       | Dynamic pricing rules          |
| `/api/cart`        | `cart.js`          | Cart CRUD operations           |
| `/api/orders`      | `order.js`         | User order history             |
| `/api/payments`    | `payments.js`      | Stripe payment intent creation |
| `/api/stripe`      | `stripeWebhook.js` | Stripe webhook handler         |
| `/api/auth`        | `auth.js`          | Login, signup, token refresh   |
| `/api/users`       | `users.js`         | User profile & account         |
| `/api/newsletter`  | `newsletter.js`    | Newsletter subscriptions       |
| `/api/blogs`       | `blog.js`          | Public blog posts              |
| `/api/admin`       | `admin.js`         | Admin order management         |
| `/api/admin/blogs` | `admin.blog.js`    | Admin blog CRUD                |
| `/api/analytics`   | `analytics.js`     | Dashboard analytics data       |

In production, the server also serves the compiled React app from `/client/dist`.

---

## Database Models

### `User`

Stores customer accounts — name, email, hashed password, role (`user` / `admin` / `manager`), and password reset tokens.

### `Product`

Defines each product type with:

- **Variants** — SKU, orientation (portrait/landscape/square), size, base price
- **Options** — available mounts, frames, mats, materials, frame colours
- **Purchase Config** — quantity settings, upload count rules, pricing model (per unit or tiered)
- **Personalization Config** — custom fields customers fill in (e.g. bride's name for wedding products)

### `Cart`

A persistent server-side cart per session, storing item configs, uploads (URLs + crop transforms), and quantities.

### `Order`

An immutable snapshot of the cart at checkout time. Stores:

- Customer info & shipping address
- Order items (product slug, variant SKU, config, image URLs, crop transform)
- Totals (subtotal, shipping, tax, grand total)
- Stripe payment details
- Order status lifecycle: `requires_payment → paid → processing → shipped → completed`
- Tracking info (carrier, tracking number, shipped/delivered dates)
- Email confirmation flags

### `Blog`

Blog posts with title, slug, content (rich HTML), cover image, author, tags, and published status.

### `PageView`

Records page-level view events used by the analytics dashboard.

### `NewsletterSubscriber`

Email addresses of newsletter subscribers.

### `Counter`

Auto-incrementing counter used to generate sequential, human-readable order numbers.

---

## Authentication & Authorization

- **JWT tokens** are issued on login and stored in **HTTP-only cookies** for security.
- `RequireAuth` component — redirects unauthenticated users to `/login`.
- `GuestRoute` component — redirects already-logged-in users away from auth pages.
- `RequireRole` component — restricts pages to specific roles (`admin`, `manager`). Unauthorized users see a 403 screen.
- Server-side middleware validates JWT on all protected routes.
- **Password reset** uses a time-limited token sent via email (Nodemailer).

---

## Third-Party Integrations

| Service        | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| **Stripe**     | Secure payment processing; webhook-driven order creation      |
| **Filestack**  | Photo upload widget for customers                             |
| **Cloudinary** | Image storage & serving for uploaded photos                   |
| **Nodemailer** | Order confirmation and fulfillment emails to customer & admin |

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **Stripe account** (for payments)
- **Cloudinary account** (for image hosting)
- **Filestack account** (for upload widget)
- **Email SMTP credentials** (for Nodemailer)

---

### Environment Variables

#### `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
ADMIN_EMAIL=admin@yourdomain.com
```

#### `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
VITE_FILESTACK_API_KEY=your_filestack_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

### Running Locally

**1. Install dependencies:**

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

**2. Start the backend:**

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**3. Start the frontend:**

```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

---

### Building for Production

From the root directory:

```bash
npm run build
# Installs all deps and builds the React app into client/dist
```

Then start the server (it will serve the built frontend):

```bash
npm start
```

The app will be available on port `5000` (or `$PORT`).

---

> Built With ❤️ by Fazeel Khan.
