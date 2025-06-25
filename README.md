# DevForum - Developer Community Platform

## Features

- **User Authentication**: Secure registration and login with Formik and Yup validation
- **Question & Answer System**: Post questions, provide answers, and engage with the community
- **Voting System**: Like/dislike questions and answers to promote quality content
- **Tag-based Organization**: Categorize questions with tags for easy discovery
- **Search Functionality**: Advanced search with suggestions and filters
- **User Profiles**: Manage your profile, track reputation, and view activity
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refreshes

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Formik & Yup** for form handling and validation
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with native MongoDB driver
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** and **Helmet** for security

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** (for cloud database)
- **Git** (for cloning the repository)

## Getting Started

Follow these steps to get the project running on your local machine:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd devforum
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
npm install

cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following environment variables to `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://saimonaspocepko:Gufa123@cluster0.seznfpf.mongodb.net/devforum

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=1d

# Client Configuration
CLIENT_URL=http://localhost:5173
```

**Important**: Replace `your-super-secret-jwt-key-here-make-it-long-and-random` with a secure, random string for production use.

### 4. Seed the Database (Optional)

To populate the database with sample data for testing:

```bash
cd backend
npm run seed
cd ..
```

This will create sample users, questions, and answers. You can use these demo credentials:
- **Email**: john@example.com
- **Password**: password123

### 5. Start the Development Servers

You need to run both the backend and frontend servers. Open **two separate terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Terminal 2 - Frontend Server
```bash
npm run dev
```

The frontend server will start on `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```