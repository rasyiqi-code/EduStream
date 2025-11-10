# 🚀 DEPLOY FIRESTORE RULES - QUICK GUIDE

## ⚡ STEP 1: Copy Rules (30 detik)

1. **Open:** `firestore.rules` di editor
2. **Select All:** Ctrl+A
3. **Copy:** Ctrl+C

---

## 🔥 STEP 2: Paste & Publish di Firebase Console (1 menit)

### **Link Langsung:**
```
https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
```

### **Steps:**
1. Click link di atas
2. **DELETE** semua rules yang ada
3. **PASTE** rules baru (Ctrl+V)
4. Click **"Publish"** (tombol biru di kanan atas)
5. Confirm publish

---

## ✅ STEP 3: Verify Role (30 detik)

### **Link Langsung:**
```
https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers
```

### **Steps:**
1. Click link di atas
2. Cari document dengan ID = **your UID**
3. Click document tersebut
4. Cari field `role`
5. Pastikan value = `admin` (bukan `student`)
6. Jika masih `student`, click field dan ubah ke `admin`
7. Save

---

## 🎯 STEP 4: Test (1 menit)

### **Di Browser:**
1. Refresh app: http://localhost:9002/dashboard
2. Hard refresh: `Ctrl+Shift+R`
3. Clear cache: `Ctrl+Shift+Delete` → Clear cache
4. Login ulang jika perlu

### **Expected Result:**
- ✅ Dashboard loads tanpa permission error
- ✅ Bisa lihat stats (Total Kursus, Total Bab/Seri)
- ✅ Bisa add video/playlist

---

## 🐛 If Still Error:

### **Check Browser Console:**
```javascript
// Press F12, then in Console tab:
firebase.auth().currentUser.uid  // Get your UID
```

### **Verify in Firestore:**
1. Go to: `https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers/[YOUR_UID]`
2. Check field `role` = `admin`

### **Logout & Login:**
```
http://localhost:9002/login
```

---

## 📝 Notes:

- Rules deployment kadang butuh 1-2 menit propagation
- Jika masih error, wait 2 menit & hard refresh
- Clear browser cache if needed

---

**Total Time:** ~3 menit
**Difficulty:** Easy ⭐⭐☆☆☆

