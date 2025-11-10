# 🧪 EduStream - Comprehensive Testing Guide

**Date:** November 10, 2024  
**Features to Test:** 15 major features  
**Estimated Testing Time:** 2-3 hours

---

## 🚀 **PRE-TESTING SETUP (10 minutes):**

### **Step 1: Deploy Firestore Rules**

**Link:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules

1. Open `firestore.rules` in your editor
2. Select All (Ctrl+A) → Copy (Ctrl+C)
3. Paste in Firebase Console
4. Click **Publish**
5. Wait for "Rules deployed successfully" message

---

### **Step 2: Verify Your Admin Role**

**Link:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers

1. Find your user document (UID: `OldwR0Kw9MOcDNn95yrNvbggpyd2`)
2. Verify field `role` = `admin`
3. If not, click field and change to `admin`

---

### **Step 3: Hard Refresh App**

```
http://localhost:9002

1. Press Ctrl + Shift + R (hard refresh)
2. Or press F12 → Application → Clear storage → Clear site data
3. Reload page
```

---

## ✅ **TESTING CHECKLIST (15 Features):**

### **🎬 FEATURE 1: Video Progress Tracking**

**Test Steps:**
1. **Watch a video partially**
   - Go to http://localhost:9002/dashboard
   - Click any video
   - Watch for 30 seconds
   - Close the tab

2. **Verify resume works**
   - Re-open the same video
   - ✅ **Expected:** Resume dialog appears
   - ✅ **Expected:** Shows correct timestamp (e.g., "0:30")
   - Click "Lanjutkan"
   - ✅ **Expected:** Video resumes from that position

3. **Check progress bar**
   - Go back to Dashboard
   - ✅ **Expected:** Video card shows progress bar (blue bar at bottom)

4. **Check Continue Watching**
   - Still on Dashboard
   - ✅ **Expected:** "Lanjutkan Menonton" section appears at top
   - ✅ **Expected:** Shows the video you watched

**Status:** [ ] Pass [ ] Fail

---

### **🔔 FEATURE 2: Notification System**

**Test Steps:**
1. **Check bell icon**
   - Look at header (top right)
   - ✅ **Expected:** Bell icon visible (next to heart icon)

2. **Add a new video** (creates notification)
   - Click "+" button in header or dashboard
   - Fill form and submit
   - ✅ **Expected:** Success toast appears

3. **Check notifications**
   - Click bell icon
   - ✅ **Expected:** Dropdown opens with notifications list
   - ✅ **Expected:** Shows "Video Baru Tersedia!" notification
   - ✅ **Expected:** Red badge shows unread count

4. **Mark as read**
   - Click on a notification
   - ✅ **Expected:** Navigates to video
   - Return and click bell again
   - ✅ **Expected:** Unread badge count decreased

5. **Delete notification**
   - Hover over notification → Click trash icon
   - ✅ **Expected:** Notification removed

**Status:** [ ] Pass [ ] Fail

---

### **👥 FEATURE 3: User Management**

**Test Steps:**
1. **Access admin page**
   - Go to Dashboard
   - Click "Total Pengguna" card OR
   - Go to http://localhost:9002/admin/users
   - ✅ **Expected:** User management page loads
   - ✅ **Expected:** Shows all users in table

2. **Search users**
   - Type your name in search box
   - ✅ **Expected:** Filters to matching users

3. **Filter by role**
   - Select "Admin" from role dropdown
   - ✅ **Expected:** Shows only admin users

4. **Change user role** (CAREFUL!)
   - Create a test user first (login with different Google account) OR skip this
   - Click "..." menu → "Change Role"
   - Select different role → Confirm
   - ✅ **Expected:** Role updated, toast appears

**Status:** [ ] Pass [ ] Fail

---

### **📊 FEATURE 4: Analytics Dashboard**

**Test Steps:**
1. **Access analytics**
   - From Dashboard → Click "Analytics Dashboard" card OR
   - Go to http://localhost:9002/admin/analytics
   - ✅ **Expected:** Page loads with charts

2. **Check metrics**
   - ✅ **Expected:** Shows Total Views, Videos, Duration, Users

3. **View charts**
   - ✅ **Expected:** "Videos per Month" bar chart displays
   - ✅ **Expected:** "User Roles" pie chart displays
   - Switch tabs (Overview, Videos, Users, Engagement)
   - ✅ **Expected:** All tabs work

**Status:** [ ] Pass [ ] Fail

---

### **📝 FEATURE 5: Quiz System**

**Test Steps:**
1. **Create a quiz** (Instructor/Admin only)
   - You'll need to manually create one in Firestore OR
   - Use quiz builder component (not yet integrated in UI)
   - Skip for now - can test later

2. **Take a quiz**
   - Go to http://localhost:9002/quiz/[quizId]
   - (Need to create quiz first)
   - Skip for now

**Status:** [ ] Pass [ ] Fail [ ] Skip

---

### **🏆 FEATURE 6: Certificates**

**Test Steps:**
1. **View certificates page**
   - Go to http://localhost:9002/certificates
   - ✅ **Expected:** Page loads (may show "No certificates yet")

2. **Verify certificate** (if you have one)
   - If no certificates, skip
   - Otherwise, click "Download PDF"
   - ✅ **Expected:** PDF downloads with beautiful template

**Status:** [ ] Pass [ ] Fail [ ] Skip

---

### **📝 FEATURE 7: Interactive Notes**

**Test Steps:**
1. **Open a video**
   - Go to any video watch page
   - ✅ **Expected:** Notes panel visible in right sidebar

2. **Create a note**
   - Click "+" button in Notes panel
   - Type some text (try formatting: bold, italic, list)
   - Click "Save Note"
   - ✅ **Expected:** Note appears in list
   - ✅ **Expected:** Shows timestamp badge

3. **Edit note**
   - Click "..." menu on note → Edit
   - Change text → Save
   - ✅ **Expected:** Note updated

4. **Highlight note**
   - Click "..." → Highlight
   - ✅ **Expected:** Note gets yellow background

5. **View all notes**
   - Go to http://localhost:9002/notes
   - ✅ **Expected:** All your notes displayed
   - ✅ **Expected:** Grouped by video

6. **Export notes**
   - Click "Export All" button
   - ✅ **Expected:** Downloads .txt file with all notes

**Status:** [ ] Pass [ ] Fail

---

### **📱 FEATURE 8: PWA Enhanced**

**Test Steps:**
1. **Check manifest**
   - Open http://localhost:9002
   - Press F12 → Application tab → Manifest
   - ✅ **Expected:** Manifest loads
   - ✅ **Expected:** Shows shortcuts (Dashboard, Browse, Favorites, Notes)

2. **Install PWA** (Desktop Chrome/Edge)
   - Look for install button in address bar
   - Click to install
   - ✅ **Expected:** App installs as standalone app

**Status:** [ ] Pass [ ] Fail

---

### **💬 FEATURE 9: Discussion Forum**

**Test Steps:**
1. **Open a video**
   - Scroll down below video description
   - ✅ **Expected:** "Diskusi" section visible

2. **Post a comment**
   - Type in text area
   - Click "Post Comment"
   - ✅ **Expected:** Comment appears immediately

3. **Reply to comment**
   - Click "Reply" on your comment
   - Type reply → Submit
   - ✅ **Expected:** Reply appears indented

4. **Vote on comment**
   - Click thumbs up icon
   - ✅ **Expected:** Upvote count increases

5. **Edit comment**
   - Click "..." → Edit
   - Change text → Save
   - ✅ **Expected:** Comment updated with "Edited" badge

6. **Delete comment**
   - Click "..." → Delete
   - ✅ **Expected:** Comment removed

**Status:** [ ] Pass [ ] Fail

---

### **👤 FEATURE 10: User Profiles**

**Test Steps:**
1. **View your profile**
   - Click your avatar → Should have link (or manually go to)
   - Go to http://localhost:9002/profile/[YOUR_UID]
   - ✅ **Expected:** Profile page loads
   - ✅ **Expected:** Shows stats (certificates, completed, in progress, watch time)

2. **Edit profile**
   - Go to http://localhost:9002/profile/edit
   - Change display name
   - Add bio
   - Click "Save Changes"
   - ✅ **Expected:** Profile updated
   - ✅ **Expected:** Redirects to profile page

**Status:** [ ] Pass [ ] Fail

---

### **🏆 FEATURE 11: Gamification & Leaderboard**

**Test Steps:**
1. **View leaderboard**
   - Go to http://localhost:9002/leaderboard
   - ✅ **Expected:** Page loads
   - ✅ **Expected:** Shows "No data yet" OR list of users with points

2. **Check if stats created**
   - Open Firestore → `/user-stats` collection
   - ✅ **Expected:** May be empty (populated when users complete actions)

**Status:** [ ] Pass [ ] Fail

---

### **📚 FEATURE 12: Course Management**

**Test Steps:**
1. **Check course rating fields**
   - Go to any playlist/course page
   - In Firestore, check `/playlists/[id]`
   - ✅ **Expected:** Has `status`, `rating`, `ratingCount` fields (may be empty)

**Status:** [ ] Pass [ ] Fail

---

### **📈 FEATURE 13: Learning Analytics**

**Test Steps:**
1. **View my learning**
   - Go to http://localhost:9002/my-learning
   - ✅ **Expected:** Page loads
   - ✅ **Expected:** Shows stats: Watch Time, Completed, In Progress, Completion Rate
   - ✅ **Expected:** Stats reflect your actual progress

**Status:** [ ] Pass [ ] Fail

---

### **🎬 FEATURE 14: Video Player Enhanced**

**Test Steps:**
1. **Speed control (MP4 videos)**
   - Upload an MP4 video OR use existing
   - Play video
   - Hover over player
   - ✅ **Expected:** Speed buttons appear (0.5x, 0.75x, 1x, etc.)
   - Click different speed
   - ✅ **Expected:** Video playback speed changes

2. **YouTube player**
   - Play a YouTube video
   - ✅ **Expected:** Player loads
   - Use YouTube's built-in speed controls (gear icon)
   - ✅ **Expected:** Speed changes work

**Status:** [ ] Pass [ ] Fail

---

### **✅ FEATURE 15: Content Approval**

**Test Steps:**
- Course status fields added ✅
- Full workflow can be tested later

**Status:** [ ] Pass [ ] Fail [ ] Skip

---

## 🔍 **QUICK TEST ROUTE (30 minutes):**

### **Path 1: Student Journey**
1. Login → Dashboard loads ✅
2. See "Continue Watching" section
3. Click Browse → Filters work
4. Watch video → Progress saves
5. Close & reopen → Resume dialog
6. Add note while watching
7. Post comment
8. View notifications (bell icon)
9. Check My Learning stats
10. View profile

**Time:** 20 min

---

### **Path 2: Admin Journey**
1. Dashboard → See admin stats
2. Click Total Pengguna → User management
3. Search/filter users
4. Click Analytics → View charts
5. Create new video → Students get notified

**Time:** 10 min

---

## 🐛 **COMMON ISSUES & FIXES:**

### **Issue 1: Permission Denied**
**Symptom:** FirebaseError: Missing or insufficient permissions  
**Fix:**
1. Deploy Firestore rules (see Step 1 above)
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear localStorage (F12 → Application → Local Storage → Clear)

---

### **Issue 2: Resume Dialog Doesn't Appear**
**Symptom:** Video auto-plays without asking  
**Fix:**
- Watch more of the video (>5% required)
- Progress saves every 5 seconds, wait a bit
- Close tab and reopen

---

### **Issue 3: Notifications Not Showing**
**Symptom:** Bell icon has no badge  
**Fix:**
1. Add a new video (triggers notification)
2. Wait 2-3 seconds for real-time update
3. Click bell icon manually

---

### **Issue 4: Continue Watching Empty**
**Symptom:** Section doesn't appear  
**Fix:**
- Watch multiple videos partially (>5% each)
- Don't complete them (stay below 95%)
- Reload dashboard

---

### **Issue 5: Charts Not Loading**
**Symptom:** Analytics shows empty  
**Fix:**
- Add some videos first
- Charts need data to display
- "No data" is normal for new platform

---

## 📊 **TEST RESULTS TEMPLATE:**

Copy this to track your testing:

```
=== TESTING SESSION ===
Date: [DATE]
Tester: [YOUR NAME]
Duration: [TIME]

QUICK WINS:
[ ] Pagination - Load more works
[ ] Filters - Category/level filters work
[ ] Search - Finds videos correctly
[ ] Speed control - Changes playback
[ ] Onboarding - Tour appears for new users

SPRINT 1:
[ ] Progress - Resume dialog works
[ ] Progress - Continue Watching shows
[ ] Notifications - Bell icon + badge
[ ] Notifications - Click navigates correctly
[ ] User Management - Search/filter works
[ ] User Management - Role change works
[ ] Analytics - Charts display

SPRINT 2:
[ ] Quiz - Can create quiz
[ ] Quiz - Can take quiz
[ ] Quiz - Auto-grading works
[ ] Certificates - Can view gallery
[ ] Certificates - PDF downloads
[ ] Notes - Can create/edit/delete
[ ] Notes - Export works
[ ] PWA - Manifest loads

SPRINT 3:
[ ] Comments - Can post
[ ] Comments - Can reply
[ ] Comments - Voting works
[ ] Profile - View page loads
[ ] Profile - Edit saves
[ ] Leaderboard - Page loads
[ ] Gamification - Stats track

SPRINT 4:
[ ] Learning Analytics - Stats correct
[ ] My Learning - Page loads

ISSUES FOUND:
- [List any bugs here]

OVERALL SCORE: [X/15 features working]
```

---

## 🚨 **CRITICAL TESTS (Must Pass):**

### **1. Authentication Flow**
- [ ] Login works
- [ ] Logout works
- [ ] Role-based redirects work

### **2. Video Playback**
- [ ] YouTube videos play
- [ ] MP4 videos play
- [ ] Progress saves

### **3. Data Persistence**
- [ ] Notes save to Firestore
- [ ] Comments save to Firestore
- [ ] Progress saves to Firestore

### **4. Permissions**
- [ ] Students can't access admin pages
- [ ] Users can only edit own content
- [ ] Admin can manage all users

---

## 🎯 **SUCCESS CRITERIA:**

| Metric | Target | Status |
|--------|--------|--------|
| **Critical Features Working** | 13/15 | [ ] |
| **No Permission Errors** | 0 errors | [ ] |
| **Page Load Time** | <2s | [ ] |
| **Mobile Responsive** | All pages | [ ] |
| **Dark Mode** | Works | [ ] |

**Pass:** ≥ 13/15 features work perfectly  
**Acceptable:** ≥ 11/15 features work  
**Needs Work:** < 11/15 features work

---

## 🔧 **TESTING TOOLS:**

### **Browser DevTools:**
```
F12 → Open DevTools

Console Tab:
- Check for errors (red text)
- Should be mostly clean

Network Tab:
- Check Firebase requests
- Should see 200 status codes

Application Tab:
- Check Service Worker (PWA)
- Check LocalStorage (progress data)
- Check Manifest
```

### **Firestore Console:**
**Link:** https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data

**Check these collections:**
- `/user-progress/[YOUR_UID]/videos` - Progress data
- `/notifications` - Your notifications
- `/user-notes/[YOUR_UID]/notes` - Your notes
- `/comments` - Video comments
- `/user-stats/[YOUR_UID]` - Your gamification stats

---

## 📱 **MOBILE TESTING (Optional):**

### **Responsive Design:**
1. Press F12 → Click device toolbar icon
2. Select "iPhone 12 Pro" or "iPad"
3. Test key pages:
   - Dashboard
   - Watch page
   - Browse page
   - Profile

✅ **Expected:** All pages look good on mobile

---

## 🎬 **QUICK VIDEO TEST SCRIPT:**

```
1. Login ✅
2. Dashboard loads ✅
3. Click any video ✅
4. Video plays ✅
5. Watch 30 seconds ✅
6. Add a note ✅
7. Post a comment ✅
8. Close tab ✅
9. Reopen video ✅
10. Resume dialog appears ✅
11. Continue from where left off ✅
12. Bell icon shows notification ✅
```

**Total Time:** 5 minutes  
**If this works:** Platform is ready! 🎉

---

## 📋 **POST-TESTING ACTIONS:**

### **If All Tests Pass:** ✅
1. ✅ Platform is production-ready!
2. Deploy to Vercel
3. Share with test users
4. Collect feedback
5. Iterate based on feedback

### **If Some Tests Fail:** ⚠️
1. Note which features failed
2. Share error messages
3. I'll fix immediately
4. Re-test

### **If Major Issues:** 🔴
1. Share screenshots/errors
2. Check Firestore rules deployed
3. Check browser console errors
4. I'll debug and resolve

---

## 🚀 **READY TO TEST?**

### **Start Testing Now:**

1. **Quick Test (5 min):**
   - Run the Quick Video Test Script above

2. **Full Test (30 min):**
   - Test Path 1 (Student Journey)
   - Test Path 2 (Admin Journey)

3. **Comprehensive Test (2-3 hours):**
   - Go through all 15 features
   - Fill out testing checklist
   - Report results

---

## 💬 **REPORT RESULTS:**

After testing, tell me:

**Format:**
```
Test Duration: [X minutes]
Features Tested: [X/15]
Pass Rate: [X/15]

Working Great:
- [List]

Issues Found:
- [List with details]

Questions:
- [List]
```

---

## 🎯 **NEXT AFTER TESTING:**

Based on test results:

1. **All Pass (13-15/15):** → Deploy to production! 🚀
2. **Mostly Pass (10-12/15):** → Fix bugs, then deploy
3. **Some Issues (7-9/15):** → Debug together
4. **Major Issues (<7/15):** → Troubleshoot & fix

---

**Status:** ✅ **READY FOR TESTING**  
**Est. Time:** 5 min (quick) to 3 hours (comprehensive)  
**Your Choice:** Quick test first, then thorough later?

🧪 **Start testing! Laporkan hasilnya nanti!** 🚀

