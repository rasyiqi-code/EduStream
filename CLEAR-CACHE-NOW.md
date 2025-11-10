# 🔄 Clear Cache & Fix Permission Error

## 🚀 **QUICK FIX (2 minutes):**

### **Step 1: Clear Browser Cache Completely**

**Chrome/Edge:**
```
1. Press Ctrl + Shift + Delete
2. Select "All time"
3. Check:
   - ✅ Browsing history
   - ✅ Cookies and other site data  
   - ✅ Cached images and files
4. Click "Clear data"
5. Close browser completely
6. Reopen browser
```

---

### **Step 2: Clear Site Data (Alternative)**

```
1. Press F12 (Developer Tools)
2. Go to "Application" tab
3. Left sidebar → Click "Storage"
4. Click "Clear site data" button
5. Confirm
6. Close DevTools
7. Hard refresh: Ctrl + Shift + R
```

---

### **Step 3: Reload App**

```
1. Go to: http://localhost:9002/dashboard
2. Should load without permission error
```

---

## ✅ **RULES YANG SUDAH DI-DEPLOY:**

```javascript
match /users/{userId} {
  allow get: if isOwner(userId) || isAdmin();
  allow list: if isAdmin(); // ✅ FIXED - Admin bisa list users
  allow create: if isOwner(userId);
  allow update: if isExistingOwner(userId) || isAdmin();
  allow delete: if isExistingOwner(userId) || isAdmin();
}
```

**Changes:** `allow list: if false` → `allow list: if isAdmin()`

---

## 🔍 **IF STILL ERROR:**

### **Check Your Role:**
1. Go to: https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers
2. Find document: `OldwR0Kw9MOcDNn95yrNvbggpyd2`
3. Verify field `role` = `admin` (not `student`)
4. If wrong, click field → Edit → Change to `admin` → Save

---

### **Force Logout & Login:**
```
1. Click avatar → Logout
2. Close ALL browser tabs
3. Reopen browser
4. Go to http://localhost:9002/login
5. Login again
```

---

### **Nuclear Option (If Above Fails):**

**Clear EVERYTHING:**
```powershell
# In PowerShell:
Remove-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Service Worker" -Recurse -Force -ErrorAction SilentlyContinue
```

Then restart browser.

---

## ✅ **VERIFICATION:**

After clearing cache, dashboard should:
- ✅ Load without errors
- ✅ Show stats cards
- ✅ Show "Continue Watching" (if you have progress)
- ✅ Show courses grid
- ✅ Bell icon works
- ✅ All features accessible

---

**Try the cache clear now and report back!** 🚀

