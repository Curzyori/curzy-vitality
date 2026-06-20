<p align="center">
  <img src="images/dashboard1.png" alt="Header Banner" width="100%"/>
</p>

<h1 align="center">Curzy Vitality</h1>
<p align="center">
  <strong>Background productivity tracker & Life OS daemon</strong>
</p>

<div align="center">

[![Stars](https://img.shields.io/github/stars/Curzyori/curzy-vitality?style=for-the-badge&color=crimson)](https://github.com/Curzyori/curzy-vitality/stargazers)
[![Forks](https://img.shields.io/github/forks/Curzyori/curzy-vitality?style=for-the-badge&color=crimson)](https://github.com/Curzyori/curzy-vitality/network/members)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Linux-black?style=for-the-badge)](#)

</div>

<p align="center">
  <a href="#-why-curzy-vitality">Why This</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#%EF%B8%8F-architecture">Architecture</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-screens">Screens</a>
</p>

---

## 🕒 Why Curzy Vitality?

A high-performance background activity tracker for Curzy Vitality Life OS. It silently monitors your active applications to log work sessions, calculate burnout warnings, and reward daily progression metrics.

|                               |                                                              |
| ----------------------------- | ------------------------------------------------------------ |
| 🧠 **Burnout Guard**           | Keeps track of active continuous development hours, warning you at >3h limits. |
| 💾 **WAL SQLite Logger**       | Fast local state storage using `better-sqlite3` with Write-Ahead Logging. |
| 🎮 **Gamification Engine**     | Gamifies daily coding tasks with XP and unique achievement simulations. |

---

## 🎯 Key Features

### Sentinel Core Features

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Activity Tracking** | ✅ | Silent system process logging categorized dynamically via mappings. |
| **Burnout Warning** | ✅ | Returns active warning structures when continuous deep work crosses 3h. |
| **Process Logs** | ✅ | Saves unknown/unmatched window titles to a file for regex tuning. |
| **internal REST API** | ✅ | Express backend listener bound to localhost for dashboard integration. |

### Technical Capabilities

| Capability | Status | Description |
| :--- | :---: | :--- |
| **Multi-Process dev** | ✅ | Concurrently runs background daemon & frontend development bundle. |
| **Fast SQLite Persistence**| ✅ | Extremely fast atomic logging using pre-compiled sqlite statements. |
| **PM2 Orchestration** | ✅ | PM2 ready using `ecosystem.config.js` for lightweight local runs. |

---

## 🏗️ Architecture

```text
curzy-vitality/
├── data/
│   └── sentinel.db        # SQLite persistence store
├── logs/
│   └── unknown_processes.log # List of uncategorized system names
├── src/
│   ├── config/            # Process category mapping JSON templates
│   ├── database/          # Database table initializations
│   ├── server/            # Local HTTP controller listener
│   └── services/          # Sentinel core polling & tracking classes
├── ecosystem.config.js    # PM2 production runner config
└── package.json           # Monorepo concurrency script configuration
```

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Curzyori/curzy-vitality.git
cd curzy-vitality

# Install required dependencies
npm install

# Run concurrently in development (Sentinel + Dashboard)
npm run dev

# Or run in production background via PM2
pm2 start ecosystem.config.js
```

---

## 🖼️ Screens

<p align="center">
  <img src="images/dashboard1.png" alt="Top Dashboard View" width="48%"/>
  <img src="images/dashboard2.png" alt="Bottom Dashboard View" width="48%"/>
</p>

---

## 📄 License
This project is released under the **MIT License** — free for educational, personal, and research purposes.

<sub>Built with passion as the 3rd Project of the 50 Projects Challenge by **@curzyori**</sub>
