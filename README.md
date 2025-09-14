# NotesApp - Multi-Tenant SaaS Platform

A secure, scalable note-taking solution for teams built with Next.js, featuring tenant isolation, role-based access control, and subscription management.

## 🚀 Features

- **Multi-Tenancy**: Strict tenant isolation with shared schema approach
- **Authentication**: JWT-based authentication with role-based access control
- **Subscription Plans**: Free (3 notes) and Pro (unlimited) plans
- **Modern UI**: Responsive design with smooth animations using Framer Motion
- **TypeScript**: Full type safety throughout the application
- **Database**: PostgreSQL via Vercel Postgres (configured in Module 3)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Database**: Prisma + PostgreSQL (Vercel Postgres)
- **Deployment**: Vercel
- **Authentication**: JWT + bcrypt

## 🧪 Test Accounts

Use these predefined accounts to test the multi-tenant functionality:

### Acme Corporation
- `admin@acme.test` / `password` (Admin)
- `user@acme.test` / `password` (Member)

### Globex Inc
- `admin@globex.test` / `password` (Admin)
- `user@globex.test` / `password` (Member)

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   └── login/         # Login page
│   ├── dashboard/         # Dashboard page
│   ├── api/              # API routes (Module 4+)
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   └── ui/               # Reusable UI components
└── lib/                  # Utilities and configurations
```

## 🚢 Deployment

This application is configured for deployment on Vercel:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

## 📋 Development Roadmap

- ✅ **Module 1**: UI Design & Project Setup
- 🚧 **Module 2**: Vercel Deployment
- ⏳ **Module 3**: Database Schema & Vercel Postgres Setup
- ⏳ **Module 4**: Authentication System
- ⏳ **Module 5**: Multi-Tenancy Implementation
- ⏳ **Module 6**: Notes CRUD API
- ⏳ **Module 7**: Subscription Management
- ⏳ **Module 8**: Frontend-Backend Integration
- ⏳ **Module 9**: Health Monitoring & CORS
- ⏳ **Module 10**: Production Optimization
- ⏳ **Module 11**: Testing & Quality Assurance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
