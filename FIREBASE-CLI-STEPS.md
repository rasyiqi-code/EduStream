# 🔥 Firebase CLI Deployment - Step by Step

## 📋 Prerequisites

✅ Firebase CLI sudah terinstall  
✅ File `firebase.json` sudah ada  
✅ File `.firebaserc` sudah ada  
✅ File `firestore.rules` sudah ready  

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Buka PowerShell

**Windows:**
- Press `Win + X`
- Pilih "Windows PowerShell" atau "Terminal"
- Atau search "PowerShell" di Start Menu

### Step 2: Navigate ke Project

```powershell
cd "C:\Users\Retas Lintas Batas\Desktop\EduStream"
```

### Step 3: Firebase Login

```powershell
firebase login
```

**Yang akan terjadi:**
1. Terminal akan show: "Waiting for authentication..."
2. Browser otomatis terbuka dengan Firebase login page
3. **Login** dengan Google account Anda (yang punya access ke project)
4. Klik **"Allow"** untuk give Firebase CLI permissions
5. Browser akan show success message
6. **Kembali ke terminal** - akan show "✔ Success!"

**Troubleshooting:**
- Jika browser tidak auto-open, copy URL dari terminal dan buka manual
- Gunakan account yang sama dengan Firebase project owner

### Step 4: Verify Login

```powershell
firebase projects:list
```

**Should show:**
```
│ studio-6945435693-50081 │ studio-6945435693-50081 │ ...
```

### Step 5: Deploy Firestore Rules

```powershell
firebase deploy --only firestore:rules
```

**Expected output:**
```
=== Deploying to 'studio-6945435693-50081'...

i  deploying firestore
i  firestore: reading rules from firestore.rules...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

**Time:** ~10-20 seconds

### Step 6: Verify Deployment

```powershell
firebase firestore:rules:get
```

Should show your deployed rules.

---

## 🎯 After Deployment

### Set Your Role to Admin:

**Via Firebase Console (Easiest):**

1. Buka: https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers

2. Find document dengan **email Anda**

3. Click document tersebut

4. Find field `role` → Click edit (pencil icon)

5. Change value: `student` → `admin`

6. Click **"Update"**

---

## ✅ Test Application

1. Refresh aplikasi: http://localhost:9002
2. Logout dan Login lagi (untuk refresh role)
3. Go to Dashboard
4. Click "Buat Kursus" (Create Course first!)
5. Then click "Tambah Bab/Seri" (Add Episode)
6. Select course dari dropdown
7. Fill form and submit
8. **Should work!** ✅

---

## 🐛 Common Errors

### "Error: Not logged in"
```powershell
firebase login
```

### "Error: Permission denied"
➡️ Login dengan correct account (project owner)

### "Error: Project not found"
```powershell
firebase use studio-6945435693-50081
```

### "Cannot run login in non-interactive mode"
➡️ Run command di PowerShell biasa (bukan via automation)

---

## 📝 Quick Commands Reference

```powershell
# Login
firebase login

# List projects
firebase projects:list

# Select project
firebase use studio-6945435693-50081

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# View current rules
firebase firestore:rules:get

# Logout
firebase logout
```

---

## 💡 Alternative: Via Console (If CLI Fails)

Jika CLI bermasalah, gunakan Console (2 menit):

1. **Deploy Rules:**
   - https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
   - Copy paste dari `firestore.rules`
   - Click "Publish"

2. **Set Role:**
   - https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers
   - Edit your user document
   - Set `role` to `admin`

✅ **Sama efektifnya dan lebih cepat!**

---

**Need Help?** Check console output untuk specific error messages.

