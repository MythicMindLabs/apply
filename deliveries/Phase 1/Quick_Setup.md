# 🚀 Quick Setup Instructions — VoiceDOT Platform

Follow these steps to set up the **VoiceDOT** development environment quickly.

---

## 1️⃣ Create Project Directory

mkdir voicedot-platform
cd voicedot-platform

---

## 2️⃣ Create File Structure

mkdir -p src/db
touch package.json wrangler.toml tsconfig.json drizzle.config.ts
touch .gitignore .env.example LICENSE CONTRIBUTING.md
touch src/index.ts src/db/schema.ts


---

## 3️⃣ Copy All Files
- Copy the contents from the **documentation above** into each respective file.  
- Ensure that filenames and paths match exactly as specified.

---

## 4️⃣ Install Dependencies

npm install


---

## 5️⃣ Set Up Environment Variables

cp .env.example .env

Edit .env with your API keys


**Required Keys:**
- `ELEVENLABS_API_KEY`
- `PERPLEXITY_API_KEY`
- `POLKADOT_RPC_ENDPOINT`
- `ENCRYPTION_KEY`

---

## 6️⃣ Deploy the Project

npm run deploy


---

## 📋 File Summary

| File               | Purpose                         | Size Estimate |
|--------------------|---------------------------------|--------------|
| `src/index.ts`     | Main API with all features      | ~4,800 lines |
| `src/db/schema.ts` | Database schema definitions     | ~300 lines   |
| `SPEC.md`          | Project technical specification | ~200 lines   |
| `README.md`        | Project documentation           | ~400 lines   |
| `package.json`     | Dependencies & NPM scripts      | ~40 lines    |
| `wrangler.toml`    | Cloudflare Workers config       | ~20 lines    |
| `tsconfig.json`    | TypeScript compiler options     | ~20 lines    |
| `drizzle.config.ts`| Database migration config       | ~10 lines    |

---

✅ **Tip:** Once this setup is complete, you can proceed to development using:

npm run dev

to run locally, or:

wrangler deploy

to deploy to Cloudflare Workers.






