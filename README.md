# 🚀 KriyaLabs — AI-Native SaaS for Intelligent Workflows


<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/77d1d7f8-19da-4485-8f3d-93d54fee0d0f" />

<div align="center">

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)

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

**KriyaLabs** is a modern, AI-native SaaS application built to demonstrate how real-world, production-ready systems are engineered—not just demo applications.

It combines a robust backend architecture, event-driven workflows, and a polished, high-impact UI. The backend architecture and async workflows follow Antonio’s engineering-first approach, while the UI and landing experience draw inspiration from Web Prodigies and Aceternity UI.

This project is designed to hold up during senior-level technical deep dives, with an emphasis on scalability, maintainability, and clean abstractions.

---

## 🧠 Philosophy & Architecture

KriyaLabs is built around three core principles:

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
- Convex
- Inngest
- Clerk

### AI & Tooling
- OpenAI APIs
- Modular AI service layers
- Typed, reusable inference logic

---

## 🔋 Core Features

- **Production-Grade Authentication** using Clerk  
- **Event-Driven Background Jobs** with Inngest  
- **Clean Backend Architecture** using Convex functions  
- **Modern Landing Page** inspired by Web Prodigies  
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
git clone https://github.com/your-username/kriyalabs.git
cd kriyalabs

---

### Install Dependencies

```bash
npm install
```

---

## 🧪 Environment Setup

Create a `.env` file in the project root:

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# OpenAI
OPENAI_API_KEY=
```

Replace the values with your actual credentials from Convex, Clerk, and OpenAI.

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

* **Name:** Mayank Mathur
* **Email:** [mrmayankmathur@gmail.com](mailto:mrmayankmathur@gmail.com)
* **Repository:** [https://github.com/your-username/kriyalabs](https://github.com/your-username/kriyalabs)

---

## 🚀 Acknowledgements

* Next.js
* Convex
* Inngest
* Clerk
* OpenAI
* ShadCN UI
* Aceternity UI

---

⭐ Star the repository if you find this project useful.
Contributions, issues, and feature requests are welcome.

Happy building.
