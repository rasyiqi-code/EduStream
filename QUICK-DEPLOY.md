# ⚡ Quick Deploy Guide

## 🎯 FASTEST WAY (2 Minutes via Console)

### 1️⃣ Deploy Rules (30 seconds)

**Copy link ini dan buka di browser:**
```
https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
```

**Actions:**
- Delete all text in editor
- Open file `firestore.rules` from project
- Copy ALL contents
- Paste in Firebase Console
- Click **"Publish"** button (blue button at top)

✅ Done!

---

### 2️⃣ Set Your Role to Admin (30 seconds)

**Copy link ini dan buka di browser:**
```
https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers
```

**Actions:**
- Find document with YOUR email
- Click on that document
- Find field `role`
- Click pencil icon (edit)
- Change value to: `admin`
- Click **"Update"**

✅ Done!

---

### 3️⃣ Test (30 seconds)

1. Refresh aplikasi: http://localhost:9002
2. Go to Dashboard
3. Click "Tambah Video"
4. Fill form and submit
5. **Should work!** ✅

---

## 🖥️ Alternative: Via CLI

Jika prefer command line, run this in PowerShell:

```powershell
# Navigate to project
cd "C:\Users\Retas Lintas Batas\Desktop\EduStream"

# Run deployment script
.\deploy-firestore.ps1
```

Or manually:

```powershell
# Login (browser will open)
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Check status
firebase deploy --only firestore:rules --project studio-6945435693-50081
```

**Note:** Tetap perlu set role via Console (Step 2 above)

---

## 🆘 Troubleshooting

### Error: "Permission Denied"
➡️ Rules belum deployed atau role masih 'student'

### Error: "Cannot read properties of undefined"
➡️ User profile belum dibuat - logout/login untuk auto-create

### Error: "Invalid API key"
➡️ Check `.env.local` file ada dan correct

---

## 📞 Quick Links

- **Rules:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
- **Data:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data
- **Auth:** https://console.firebase.google.com/project/studio-6945435693-50081/authentication/users

---

**Total Time: ~2 minutes** ⚡

Saya recommend **via Console** karena lebih cepat dan tidak perlu CLI setup!

