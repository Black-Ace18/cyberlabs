# CYBER LABS | Interactive Cybersecurity Training Simulator

### Overview

Cyber Labs is an **interactive cybersecurity training simulator** built around realistic terminal environments, offensive security scenarios, defensive operations, and hands-on investigation.

Instead of presenting cybersecurity concepts through traditional quizzes or passive learning cards, Cyber Labs puts the user inside simulated environments where they can **execute commands, investigate systems, analyze vulnerabilities, and respond to security incidents**.

The experience is divided into two operational paths:

- **Red Pill** — Offensive Cyber Operations
- **Blue Pill** — Defensive SOC & Incident Response

The entire experience runs in the browser, making it possible to explore cybersecurity workflows without requiring real targets, external infrastructure, or a backend.

---

### Project Status

- **Stability**: Production-ready
- **Deployment**: Live
- **Hosting**: Vercel
- **Architecture**: Frontend-only
- **Persistence**: Browser LocalStorage

---

### Core Capabilities

#### Interactive Terminal Environment

- Command-driven cybersecurity simulations
- Simulated Linux terminal workflows
- Command parsing and validation
- Dynamic terminal responses
- Realistic system feedback
- Mission-specific command environments

#### Dual Cybersecurity Tracks

**Red Pill — Offensive Operations**

- Linux permissions
- Network reconnaissance
- Web application security
- Privilege escalation
- Wireless security

**Blue Pill — Defensive Operations**

- Linux system hardening
- Firewall configuration
- Input and application defense
- SUID lockdown
- SOC investigation and packet analysis

#### Progressive Mission System

- Structured mission progression
- Independent Red and Blue progression
- Mission completion states
- Persistent progress
- Replayable scenarios
- Final missions designed as larger multi-stage simulations

#### Intel Manual

Every mission includes an integrated educational guidance system.

- Contextual cybersecurity guidance
- Progressive hints
- No automatic command execution
- No automatic mission completion
- Designed to assist without removing the challenge

#### Superuser Mode

A dedicated testing and evaluation environment allows access to the complete mission library without altering authentic user progression.

This makes it possible to demonstrate the entire simulator while keeping normal progression data isolated.

#### Responsive Cybersecurity Interface

- Desktop and mobile support
- Terminal-inspired interfaces
- Cybersecurity dashboards
- Mission-specific visual environments
- Responsive layouts
- High-contrast information displays
- Cyberpunk-inspired HUD elements

---

### Technology Stack

#### Frontend

- React 18
- TypeScript
- Vite

#### UI & Styling

- Tailwind CSS
- Lucide Icons
- Responsive CSS architecture

#### Application Architecture

- Client-side simulation engine
- Deterministic mission logic
- Local state management
- Browser LocalStorage persistence

#### Deployment

- Vercel

---

### Architecture

Cyber Labs is intentionally built as a **frontend-only application**.

There is no backend, database, authentication service, or AI API required to operate the simulator.

Mission states, command validation, progression, simulated environments, and user data are handled locally within the application.

```text
User
  |
  v
Cyber Labs Interface
  |
  +-------------------+
  |                   |
  v                   v
Red Pill            Blue Pill
  |                   |
  v                   v
Offensive           Defensive
Simulations         Simulations
  |                   |
  +---------+---------+
            |
            v
      Mission Engine
            |
            v
       LocalStorage
