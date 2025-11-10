# 🔥 Firestore Setup Guide

## Step 1: Deploy Firestore Rules

### Option A: Via Firebase Console (Easiest)
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Go to **Firestore Database**
4. Click tab **"Rules"**
5. Copy isi file `firestore.rules` dari project
6. Paste ke Firebase Console
7. Click **"Publish"**

### Option B: Via Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (jika belum)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## Step 2: Set User Role

Secara default, semua user baru memiliki role **'student'**. Untuk menambah video, user perlu role **'instructor'** atau **'admin'**.

### Change User Role via Firebase Console:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Go to **Firestore Database**
3. Find collection **`users`**
4. Click document dengan UID Anda (cek di app atau Authentication tab)
5. Edit field **`role`**
6. Change dari `student` ke:
   - **`instructor`** - Untuk mengelola video & playlist sendiri
   - **`admin`** - Untuk full access (manage semua content)
7. Click **Save**

### Find Your User ID:

**Option 1 - Via App:**
- Login ke aplikasi
- Open browser DevTools (F12)
- Console tab
- Type: `firebase.auth().currentUser.uid`
- Copy UID

**Option 2 - Via Firebase Console:**
- Go to **Authentication** tab
- Find your email
- Copy UID dari kolom "User UID"

---

## Step 3: Verify Setup

### Check Firestore Rules:
```javascript
// Should allow admin/instructor to create videos
match /videos/{videoId} {
  allow get, list: if true;
  allow create: if isAdminOrInstructor();
  allow update: if isAdminOrInstructor() && resource != null;
  allow delete: if isAdminOrInstructor() && resource != null;
}
```

### Check User Profile:
```javascript
/users/{your-uid}
{
  uid: "your-uid",
  email: "your-email@gmail.com",
  displayName: "Your Name",
  photoURL: "...",
  role: "instructor"  // or "admin"
}
```

---

## Common Issues & Solutions

### ❌ "Permission Denied" Error

**Cause:** User role is 'student' or not set

**Fix:**
1. Go to Firestore Console
2. Find your user document in `/users/{uid}`
3. Change `role` to `instructor` or `admin`
4. Refresh app

---

### ❌ "User Profile Not Found"

**Cause:** User document belum dibuat

**Fix:**
1. Logout dari app
2. Login lagi (akan auto-create profile)
3. Or manually create document di Firestore:
   ```
   Collection: users
   Document ID: {your-uid}
   Fields:
     - uid: {your-uid}
     - email: your-email@gmail.com
     - displayName: Your Name
     - photoURL: (optional)
     - role: instructor
   ```

---

### ❌ Rules Not Applied

**Cause:** Rules belum di-deploy

**Fix:**
1. Deploy rules via Console atau CLI
2. Wait 1-2 minutes untuk propagation
3. Refresh app

---

## Quick Setup Script

Untuk **Admin** (full access):

```javascript
// Run in Firestore Console > Rules playground
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Testing Permissions

### Test 1: Read Videos (Should work for everyone)
```javascript
// In browser console
firebase.firestore().collection('videos').get()
  .then(snap => console.log('✅ Read success:', snap.size, 'videos'))
  .catch(err => console.error('❌ Read failed:', err.message));
```

### Test 2: Create Video (Requires instructor/admin role)
```javascript
// In browser console
firebase.firestore().collection('videos').add({
  title: 'Test',
  description: 'Test',
  channel: 'Test',
  thumbnailUrl: 'https://picsum.photos/640/360',
  youtubeId: 'test123',
  duration: 100,
  uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
  authorId: firebase.auth().currentUser.uid,
  channelAvatarUrl: 'https://picsum.photos/48/48',
  playlistIds: [],
})
  .then(() => console.log('✅ Create success'))
  .catch(err => console.error('❌ Create failed:', err.message));
```

---

## 🎯 RECOMMENDED SETUP

### For Development/Testing:

1. **First User (You):**
   - Role: `admin`
   - Full access untuk setup platform

2. **Test Instructor:**
   - Role: `instructor`
   - Can create/edit own content

3. **Test Student:**
   - Role: `student`
   - Can only view content

---

## 📞 Need Help?

Jika masih ada permission error:
1. Check user role di Firestore Console
2. Verify rules deployed
3. Check browser console untuk detailed error
4. Try logout/login again

---

**Quick Fix untuk Development:**

Jika ingin **disable rules temporarily** untuk testing:

```javascript
// DEVELOPMENT ONLY - NEVER USE IN PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING:** This allows anyone to read/write everything. Only for local testing!

