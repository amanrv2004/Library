# Deployment Guide (Vercel)

This project is configured for production-level deployment on Vercel.

## 1. Backend Deployment

1.  Push the code to a GitHub repository.
2.  Import the repository to Vercel.
3.  Set the **Root Directory** to `backend`.
4.  Configure the following **Environment Variables** in Vercel:
    *   `MONGODB_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A strong secret key for authentication.
    *   `ADMIN_URL`: The URL of your Admin Portal (e.g., `http://localhost:5173` or production URL).
    *   `STUDENT_URL`: The URL of your Student Portal (e.g., `http://localhost:5174` or production URL).
    *   `FRONTEND_URL`: The URL of your Admin Portal (after it is deployed).
    *   `STUDENT_PORTAL_URL`: The URL of your Student Portal (after it is deployed).
    *   `NODE_ENV`: Set to `production`.

## 2. Admin Portal Deployment

1.  Create a new project in Vercel pointing to the same repository.
2.  Set the **Root Directory** to `admin-portal`.
3.  Select **Vite** as the Framework Preset.
4.  Configure the following **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://your-backend.vercel.app/api`).

## 3. Student Portal Deployment

1.  Create another project in Vercel pointing to the same repository.
2.  Set the **Root Directory** to `student-portal`.
3.  Select **Vite** as the Framework Preset.
4.  Configure the following **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://your-backend.vercel.app/api`).

## Important Notes:

*   **File Uploads**: This project uses `multer` with local storage (`uploads/`). Vercel's serverless functions are ephemeral, meaning uploaded files will be lost after the function instance shuts down. For a true production setup, you should use a cloud storage provider like **Cloudinary** or **AWS S3** for the `multer` configuration.
*   **Database**: Ensure your MongoDB Atlas IP Whitelist allows access from "Everywhere" (0.0.0.0/0) or use Vercel's static IP if you have a paid plan.
