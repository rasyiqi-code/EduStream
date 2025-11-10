# 🚀 Deploy Firestore Rules - Quick Guide

## ⚡ OPSI 1: Via Firebase Console (TERMUDAH - 2 Menit)

### Step 1: Deploy Rules

1. **Buka link ini:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules

2. **Delete semua** yang ada di editor

3. **Copy file** `firestore.rules` dari project (atau buka file tersebut)

4. **Paste** ke Firebase Console editor

5. **Click "Publish"** (button biru di atas)

6. **Wait** 10-20 detik untuk propagation

### Step 2: Set User Role

1. **Buka link ini:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers

2. **Find document** dengan email Anda (check di Authentication tab jika perlu)

3. **Click document** tersebut

4. **Find field** `role`

5. **Click icon pensil** (edit)

6. **Change value** dari `student` ke `admin`

7. **Click "Update"**

8. **Refresh** aplikasi di browser

✅ **DONE! Sekarang Anda bisa add video!**

---

## 🖥️ OPSI 2: Via Command Line

Jika lebih suka CLI:

### Step 1: Login
```powershell
firebase login
```
- Browser akan terbuka
- Login dengan Google account yang sama dengan Firebase project
- Kembali ke terminal

### Step 2: Deploy
```powershell
firebase deploy --only firestore:rules
```

### Step 3: Set Role
Tetap perlu via Console (Step 2 di Opsi 1)

---

## 🔍 Verify Setup

Setelah deploy, verify di browser console (F12):

```javascript
// Check your user role
firebase.firestore()
  .collection('users')
  .doc(firebase.auth().currentUser.uid)
  .get()
  .then(doc => console.log('Your role:', doc.data().role));
```

Should show: `Your role: admin`

---

## ✅ Test Add Video

1. Refresh aplikasi
2. Go to Dashboard
3. Click "Tambah Video"
4. Fill form:
   - Title: "Test Video"
   - URL: https://www.youtube.com/watch?v=LyqdYUI2Yv4
5. Click "Add Video"
6. **Should work!** ✅

---

## 🐛 Still Getting Permission Error?

### Check These:
1. ✅ Rules deployed? (Check Firebase Console)
2. ✅ User role = admin? (Check Firestore data)
3. ✅ Waited 20 seconds after deploy? (Propagation time)
4. ✅ Refreshed browser? (Clear cache)

### Debug Commands:
```javascript
// In browser console (F12)
// Check current user
console.log('UID:', firebase.auth().currentUser.uid);
console.log('Email:', firebase.auth().currentUser.email);

// Try reading user profile
firebase.firestore()
  .collection('users')
  .doc(firebase.auth().currentUser.uid)
  .get()
  .then(doc => {
    if (doc.exists) {
      console.log('✅ Profile exists:', doc.data());
    } else {
      console.log('❌ Profile not found - need to create');
    }
  });
```

---

## 📞 Quick Links

- **Firestore Rules:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
- **Firestore Data:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data
- **Authentication:** https://console.firebase.google.com/project/studio-6945435693-50081/authentication/users

---

**Recommendation:** Gunakan **Opsi 1** (via Console) - lebih cepat dan simple! 

Total waktu: ~2 menit ⚡

