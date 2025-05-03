# 🚀 Bunker Drive

A **Google Drive clone** built with **Next.js**, **Express.js**, **MongoDB**, **AWS S3**, and **Google OAuth**.  
Upload, store, and manage your files securely in the cloud! 🔥

---

## 📦 Project Structure

```
/frontend   → Next.js frontend (Vercel deployment)
/backend    → Express.js backend (Render depoyment)
```

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AMS003010/Bunker-Drive.git
cd Bunker-Drive
```

### 2. Backend Setup (Express.js)

Navigate to backend:

```bash
cd backend
```

Create a `.env` file:

```plaintext
PORT=5000
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
npm run start
```

Your backend will run on `http://localhost:5000`.

---

### 3. Frontend Setup (Next.js)

Navigate to frontend:

```bash
cd ../frontend
```

Create a `.env.local` file:

```plaintext
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_next_auth_secret
NEXTAUTH_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Install dependencies:

```bash
npm install
```

Start the frontend server:

```bash
npm run dev
```

Your frontend will run on `http://localhost:3000`.

---

## 🚀 Deployment Instructions

### 1. Deploy Backend (Express.js)

You can deploy the backend to platforms like **Render** or **Railway**.

Set the start command to:

```bash
npm install && npm run start
```

Set environment variables (same as your local `.env`) in the Render dashboard.

Expose the correct port (Render automatically handles `PORT`).

Ensure CORS settings allow frontend domain requests.

---

### 2. Deploy Frontend (Next.js)

Deploy frontend to **Vercel**:

- Push `/frontend` folder to a separate GitHub repo (or set project root as `/frontend` in Vercel).
- In Vercel dashboard:
  - Set root directory = `frontend`
  - Set environment variables (same as your `.env.local`, but change URLs!):

```plaintext
NEXTAUTH_URL=https://your-vercel-frontend-url.vercel.app
BACKEND_URL=https://your-backend-service-url.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service-url.onrender.com
```

- Set build command:

```bash
npm run build
```

- Set output directory:

```bash
.next
```

Vercel will auto-deploy after every push.

---

### 3. Setup Google OAuth

- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Create a project → OAuth consent screen → Create OAuth credentials.
- Add **Authorized Redirect URIs**:

  - Backend: `https://your-backend-service-url.onrender.com/auth/google/callback`
  - Frontend (NextAuth): `https://your-vercel-frontend-url.vercel.app/api/auth/callback/google`

- Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into your environment variables.

---

### 4. Setup MongoDB (Atlas)

- Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Create a database and user.
- Whitelist your backend server IP.
- Get the connection string, put it in your backend `.env` as `MONGO_URI`.

---

### 5. Setup AWS S3

- Go to [AWS Console](https://aws.amazon.com/).
- Create an S3 bucket (example: `bunker-drive-storage`).
- Create an IAM user with S3 permissions (Programmatic Access).
- Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` into your backend `.env`.

Important: Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-vercel-frontend-url.vercel.app"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, NextAuth.js, Tailwind CSS
- **Backend**: Express.js, MongoDB, Mongoose
- **Authentication**: Google OAuth, JWT
- **Storage**: AWS S3
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## ✨ Features

- Google Authentication
- Secure JWT-based API authentication
- File Upload/Download/Delete
- AWS S3 Secure Storage
- Protected Routes
- Scalable Cloud Deployment

---

## 🧑‍💻 Developer

Made with ❤️ by **Abhijith**

---

## 📢 Happy Uploading!!

