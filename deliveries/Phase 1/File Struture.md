# 📂 voicedot-platform — Project Structure & Overview

This document provides a complete breakdown of the **VoiceDOT platform** directory structure, file purpose, and setup commands.

---

## 📁 Root Directory Layout

voicedot-platform/
├── 📄 README.md # Main documentation
├── 📄 SPEC.md # Project specification
├── 📄 LICENSE # MIT License
├── 📄 CONTRIBUTING.md # Contribution guidelines
├── 📄 .gitignore # Git ignore rules
├── 📄 .env.example # Environment variables template
├── 📄 package.json # Dependencies and scripts
├── 📄 wrangler.toml # Cloudflare Workers configuration
├── 📄 tsconfig.json # TypeScript configuration
├── 📄 drizzle.config.ts # Database configuration
├── 📁 src/ # Source code directory
│ ├── 📄 index.ts # Main API (4,800+ lines)
│ └── 📁 db/ # Database directory
│ └── 📄 schema.ts # Database schema definitions
├── 📁 drizzle/ # Database migrations (auto-generated)
│ └── 📄 *.sql # Migration files
├── 📁 node_modules/ # Dependencies (auto-generated)

---

## 📜 Detailed File & Folder Contents

### **`src/` — Main Source Code**
src/
├── index.ts # 4,800+ lines - Complete API
│ ├── 🎤 Multi-language voice processing
│ ├── 🔗 Blockchain integration
│ ├── 🌐 Frontend demo interface
│ ├── 🤖 MCP server implementation
│ ├── 💰 Multi-currency support
│ ├── 🔐 Security & authentication
│ └── 📊 Transaction management
│
└── db/
└── schema.ts # 300+ lines - Database sc
ema ├── 👥
Users table ├── �
Transactions table
── 🎙️ Voice sessions table
├── 🔗 Wallet c
nnections table ├──
🪙 Tokens table
├── 📝 Voice commands table


---

## ⚙️ Configuration Files
| File                | Lines  | Purpose                                  |
|--------------------|-------|------------------------------------------|
| `package.json`     | ~40   | Dependencies & scripts                   |
| `wrangler.toml`    | ~20   | Cloudflare Workers configuration         |
| `tsconfig.json`    | ~20   | TypeScript compiler settings              |
| `drizzle.config.ts`| ~10   | Database migration config                 |

---

## 📄 Documentation Files
| File                | Lines  | Purpose                                  |
|--------------------|-------|------------------------------------------|
| `README.md`        | 400+  | Complete documentation                   |
| `SPEC.md`          | 200+  | Technical specification                  |
| `CONTRIBUTING.md`  | ~50   | Contribution guidelines                  |
| `LICENSE`          | ~20   | MIT License                              |

---

## 🔑 Environment & Setup Files
| File           | Lines  | Purpose                                      |
|---------------|-------|----------------------------------------------|
| `.env.example`| ~15   | Environment variables template               |
| `.gitignore`  | 100+  | Ignore unwanted files in version control      |

---

## 🗄 Directory Purposes
| Directory         | Purpose                        | Auto-Generated |
|-------------------|--------------------------------|----------------|
| `src/`            | Main source code               | ❌ Manual       |
| `src/db/`         | Database schemas               | ❌ Manual       |
| `drizzle/`        | Database migration files       | ✅ Auto         |
| `node_modules/`   | Dependency packages            | ✅ Auto         |
| `.wrangler/`      | Cloudflare Workers cache       | ✅ Auto         |

---

## 💻 Setup Commands

### Create Directory Structure

Create main directory
mkdir voicedot-platform
cd voicedot-platform

Create subdirectories
mkdir -p src/db
mkdir -p docs

Create all files
touch README.md SPEC.md LICENSE CONTRIBUTING.md
touch .gitignore .env.example
touch package.json wrangler.toml tsconfig.json drizzle.config.ts
touch src/index.ts src/db/schema.ts

---

## 📂 File Creation Order
1. **Configuration first**:  
   `package.json`, `tsconfig.json`, `wrangler.toml`  
2. **Database schema**:  
   `src/db/schema.ts`  
3. **Main application**:  
   `src/index.ts`  
4. **Documentation**:  
   `README.md`, `SPEC.md`  
5. **Environment setup**:  
   `.env.example`, `.gitignore`

---

## 🎯 Key Features by File

### **`src/index.ts` — Main API**
- 🎤 Voice processing endpoints  
- 🔗 Blockchain integration  
- 🌐 Frontend interface  
- 🤖 MCP server implementation  
- 🌍 Multi-language support  
- 💰 Payment processing  
- 🔐 Security & authentication  

### **`src/db/schema.ts` — Database Schema**
- 9 relational tables  
- Complete relationships  
- Type-safe schema definitions  
- Migration-ready

---
