# ImpactQuest System Architecture

## Overview
ImpactQuest is architected as a decoupled Client-Server system with a modular AI Intelligence Layer.

## 1. Frontend (Client)
- **Framework**: React 18 with Vite.
- **State Management**: Context API (Theme, Language, Termination).
- **Styling**: Tailwind CSS with custom HSL variables.
- **Animations**: Framer Motion for high-fidelity tactical feel.
- **Routing**: React Router DOM v6.

## 2. Backend (API)
- **Runtime**: Node.js with Express.
- **Database**: MongoDB (Mongoose ORM).
- **Authentication**: Firebase Admin SDK + JWT (JSON Web Tokens).
- **Middleware**: 
  - `auth.middleware`: Handles JWT verification and RBAC.
  - `error.middleware`: Standardized error catching.

## 3. AI Intelligence Layer (The "Core")
Located in `backend/ai/`, this layer consists of specialized engines:
- **Matching Engine**: Evaluates volunteer-task synergy.
- **Planning Engine**: Generates hierarchical mission steps.
- **Summaries Engine**: Synthesizes operational data into briefings.
- **Insights Engine**: Predicts resource bottlenecks.
- **Copilot Engine**: Generates strategic communications.

## 4. Deployment Strategy
- **Client**: Hosted on Vercel.
- **API**: Hosted on Railway/Render.
- **Storage**: Cloudinary for tactical assets/PFPs.
- **Database**: MongoDB Atlas.

## 5. Environment Variables
Standardized `.env` handling across environments. See `.env.example` for required keys.
