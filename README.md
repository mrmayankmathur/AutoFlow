# 🚀 AutoFlow — AI-Native SaaS for Intelligent Workflows

<img width="3168" height="1344" alt="banner" src="https://github.com/user-attachments/assets/7f4a7702-93a7-46a4-ac7b-5d0fee82e24e" />

<div align="center">

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)

</div>

## 📋 Table of Contents

- 🤖 Introduction
- 🧠 Philosophy & Architecture
- ⚙️ Tech Stack
- 🔋 Core Features
- 🧩 System Design Highlights
- 🤸 Quick Start
- 🧪 Environment Setup
- 🕸️ License
- 🔗 Contact
- 🚀 Acknowledgements

---

## 🤖 Introduction

**AutoFlow** is a production-grade, event-driven SaaS platform designed to democratize workflow automation. Built to rival industry giants like Zapier and N8N, it empowers users to design complex, multi-step automations using a visual drag-and-drop canvas.

Unlike traditional tools, it combines **reliability** with **aesthetics**. Under the hood, it runs on a high-performance execution engine powered by **Inngest**, ensuring 100% reliable background job processing, retries, & flow control. The user experience is elevated by a cutting-edge interface inspired by **Aceternity UI**, featuring parallax effects, 3D visualizations, and glassmorphism that makes automation feel magical.

Whether you are chaining AI agents (OpenAI, Gemini), listening for Webhooks, or managing subscriptions via Polar, AutoFlow offers a seamless, type-safe, and visually immersive environment for modern developers and creators.

---

## 🧠 Philosophy & Architecture

AutoFlow is built around three core principles:

- **Separation of Concerns** — UI, business logic, and background workflows are clearly isolated
- **Event-Driven Design** — async workflows using Inngest instead of cron-based hacks
- **Production-First Thinking** — patterns that scale, are observable, and are easy to debug

Every architectural decision is intentional and explainable.

---

## ⚙️ Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Aceternity UI

### Backend & Infrastructure

- PostgreSQL (Neon)
- Inngest
- Better Auth

### AI & Tooling

- OpenAI APIs
- Modular AI service layers
- Typed, reusable inference logic

---

## 🔋 Core Features

- **Production-Grade Authentication** using Better Auth
- **Event-Driven Background Jobs** with Inngest
- **Clean Backend Architecture** using PostgreSQL
- **Modern Landing Page**
- **Scalable Data Models** designed for real growth
- **AI-First System Design** (not bolted-on APIs)
- **Reusable, Typed Codebase** for long-term maintainability
- **Fully Responsive UI** across all screen sizes

---

## 🧩 System Design Highlights

- Async-first architecture for heavy operations
- End-to-end type safety
- Reusable UI and backend utilities
- Observable background workflows
- Senior-level code readability and structure

---

## 🤸 Quick Start

### Prerequisites

- Git
- Node.js (18+)
- npm / pnpm / yarn

---

### Clone the Repository

```bash
git clone https://github.com/mrmayankmathur/autoflow.git
cd autoflow
```

---

### Install Dependencies

```bash
npm install
```

---

## 🧪 Environment Setup

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Google Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenAI
OPENAI_API_KEY=
```

Replace the values with your actual credentials from the Database provider, Better Auth, Google Cloud, and OpenAI.

---

### Run the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🕸️ License

Distributed under the **MIT License**.
See the `LICENSE` file for more information.

---

## 🔗 Contact

- **Name:** Mayank Mathur
- **Email:** [mrmayankmathur@gmail.com](mailto:mrmayankmathur@gmail.com)
- **Repository:** [https://github.com/mrmayankmathur/autoflow](https://github.com/mrmayankmathur/AutoFlow)

---

## 🚀 Acknowledgements

- Next.js
- Convex
- Inngest
- Clerk
- OpenAI
- ShadCN UI
- Aceternity UI

---

⭐ Star the repository if you find this project useful.
Contributions, issues, and feature requests are welcome.

Happy building.
