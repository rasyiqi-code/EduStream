# 🔄 Flow & Terminology Refactoring Complete

## 📋 Perubahan Konsep

### **Sebelum:**
- ❌ Video bisa standalone (tidak harus dalam playlist)
- ❌ Playlist optional
- ❌ Terminology unclear

### **Sesudah:**
- ✅ **Playlist = Kursus/Materi** (Course package)
- ✅ **Video = Bab/Seri/Episode** (Chapter dalam kursus)
- ✅ **Setiap video WAJIB masuk kursus**
- ✅ **Auto-numbering episodes** (Bab 1, 2, 3...)

---

## 🎯 New Flow

### **Workflow Instruktur:**

#### 1️⃣ **Buat Kursus Dulu**
```
Dashboard → "Buat Kursus" → Fill form:
- Nama: "Aljabar Dasar"
- Deskripsi: "Pelajari dasar-dasar aljabar..."
→ Save
```

#### 2️⃣ **Tambah Bab/Seri ke Kursus**
```
Dashboard → "Tambah Bab/Seri" → Fill form:
- Pilih Kursus: "Aljabar Dasar" (dropdown - WAJIB)
- Judul: "Bab 1 - Pengenalan Aljabar"
- Deskripsi: (optional, bisa generate AI)
- Video Source: YouTube/MP4
- URL: https://...
→ Add Bab/Seri
```

**Result:** Video otomatis:
- Masuk ke kursus yang dipilih
- Dapat episode number (Bab 1, 2, 3...)
- Muncul di playlist/course page

#### 3️⃣ **Ulangi untuk Bab Lainnya**
```
"Tambah Bab/Seri" lagi:
→ Pilih kursus yang sama
→ "Bab 2 - Persamaan Linear"
→ Auto-assigned as Episode 2
```

---

## 🎨 UI Changes

### **Dashboard (Instructor):**

**Buttons:**
- ❌ "Create New Playlist"
- ✅ **"Buat Kursus"**

- ❌ "Add Video"  
- ✅ **"Tambah Bab/Seri"**

**Tabs:**
- ✅ **"Kursus Saya"** (My Courses)
- ✅ **"Bab/Seri Saya"** (My Episodes)

**Stats:**
- ✅ **"Total Kursus"** (was: Total Playlist)
- ✅ **"Total Bab/Seri"** (was: Total Video)

### **Add Video Dialog:**

**Title:**
- ❌ "Add a New Video"
- ✅ **"Tambah Bab/Seri Baru"**

**Fields:**
1. **Kursus/Materi*** (Required dropdown)
2. **Judul Bab/Seri** (was: Title)
3. Deskripsi (optional)
4. Video Source
5. URL

**Validation:**
- ❌ Can't submit without selecting course
- ✅ Button disabled until course selected
- ✅ Auto-assign episode number

### **Video Cards:**

**Badge:**
- ❌ "Playlist"
- ✅ **"Bab 1", "Bab 2", etc.**

### **Empty States:**

**No Courses:**
```
"Belum Ada Kursus"
"Mulai dengan membuat kursus/materi pertama Anda."
```

**No Episodes:**
```
"Belum Ada Bab/Seri"
"Buat kursus terlebih dahulu, lalu tambahkan bab/seri di dalamnya."
```

---

## 📊 Data Structure Changes

### **Video Type (Updated):**
```typescript
type Video = {
  id: string;
  title: string; // Episode title
  description: string;
  playlistId: string; // REQUIRED - Course ID
  episodeNumber?: number; // Auto-assigned (1, 2, 3...)
  // ... other fields
}
```

### **Playlist Type (Updated):**
```typescript
type Playlist = {
  id: string;
  name: string; // Course name
  description: string;
  videoIds: string[]; // Episodes in order
  episodeCount?: number; // Number of episodes
  totalDuration?: number; // Total course duration
  // ... other fields
}
```

---

## 🔄 User Journey Examples

### **Scenario 1: Buat Kursus Matematika**

1. **Buat Kursus:**
   - Nama: "Matematika Dasar"
   - Deskripsi: "Kursus matematika untuk pemula"

2. **Tambah Bab 1:**
   - Pilih kursus: "Matematika Dasar"
   - Judul: "Bab 1 - Pengenalan Angka"
   - URL: (YouTube link)
   - **Auto-assigned:** Episode 1

3. **Tambah Bab 2:**
   - Pilih kursus: "Matematika Dasar"
   - Judul: "Bab 2 - Operasi Hitung Dasar"
   - **Auto-assigned:** Episode 2

4. **Student View:**
   ```
   Kursus: Matematika Dasar
   ├── Bab 1 - Pengenalan Angka
   └── Bab 2 - Operasi Hitung Dasar
   ```

### **Scenario 2: Buat Kursus Fisika**

Same pattern:
- Buat kursus "Fisika Dasar"
- Tambah bab 1, 2, 3, dst.
- Auto-organized

---

## 💡 Benefits

### **For Instructors:**
✅ Lebih terorganisir (kursus → bab-bab)  
✅ Auto-numbering episodes  
✅ Clear structure  
✅ Easy to manage  

### **For Students:**
✅ Clear learning path  
✅ See progress (Bab 1/10 complete)  
✅ Better organization  
✅ Easier to follow  

### **For Platform:**
✅ Better data structure  
✅ Enforced organization  
✅ Scalable system  
✅ Professional UX  

---

## 🚀 Next Steps for You

### 1. **Deploy Firestore Rules** (PENTING!)

Karena types berubah, rules perlu di-update di Firebase:

**Manual via Console (2 menit):**
1. Buka: https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules
2. Copy dari `firestore.rules`
3. Paste & Publish

**Or via CLI:**
```powershell
# Di PowerShell/Terminal baru:
cd "C:\Users\Retas Lintas Batas\Desktop\EduStream"
firebase login
firebase deploy --only firestore:rules
```

### 2. **Set Role Anda ke Admin**

1. Buka: https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers
2. Find document dengan email Anda
3. Edit field `role` → `admin`
4. Save

### 3. **Test New Flow**

1. Refresh app: http://localhost:9002
2. Login (atau logout/login lagi)
3. Go to Dashboard
4. Click **"Buat Kursus"** → Create course first
5. Click **"Tambah Bab/Seri"** → Add episodes
6. Select course dari dropdown (REQUIRED)
7. Fill form & submit
8. **Success!** ✅

---

## 📝 Migration Notes

### **Existing Data:**

Jika sudah ada videos di database (dari testing sebelumnya):

**Option 1: Clean slate (Recommended)**
- Delete semua videos & playlists via Firestore Console
- Start fresh dengan new flow

**Option 2: Migrate existing data**
- Manual update each video document
- Add `playlistId` field
- Add `episodeNumber` field
- Remove `playlistIds` array (old structure)

---

## 🎓 Example: Create Complete Course

### Course: "Aljabar SMA Kelas 10"

**Step 1: Create Course**
```
Nama: Aljabar SMA Kelas 10
Deskripsi: Materi aljabar lengkap untuk siswa SMA kelas 10
```

**Step 2: Add Episodes**
```
Bab 1: Pengenalan Aljabar
Bab 2: Bentuk Aljabar
Bab 3: Operasi Aljabar
Bab 4: Persamaan Linear
Bab 5: Pertidaksamaan Linear
Bab 6: Sistem Persamaan
```

**Result:** Beautiful course structure dengan 6 episodes terorganisir!

---

## ✅ Checklist

Sebelum test:
- [ ] Firestore rules deployed
- [ ] User role set to admin/instructor
- [ ] App refreshed
- [ ] Logged out & logged in again

Untuk test:
- [ ] Can create course ✅
- [ ] Can add episode to course ✅
- [ ] Episode auto-numbered ✅
- [ ] Can't add episode without course ✅
- [ ] Shows "Bab 1", "Bab 2" badges ✅

---

**Status:** ✅ **READY TO TEST!**

Setelah deploy rules, platform siap dengan flow baru yang lebih terstruktur! 🎉

