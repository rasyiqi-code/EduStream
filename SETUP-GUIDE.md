# 🚀 EduStream - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment Variables

File `.env.local` sudah dibuat dengan default values. Untuk production:

#### **Firebase Setup:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project atau buat baru
3. Go to **Project Settings** > **Your Apps** > **Web App**
4. Copy configuration values
5. Update `.env.local` dengan values Anda:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### **Gemini AI Setup:**
1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API Key
3. Update di `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase Setup

#### **Enable Authentication:**
1. Firebase Console > **Authentication** > **Get Started**
2. Enable **Google** sebagai Sign-in provider
3. Add authorized domain: `localhost` dan domain production Anda

#### **Create Firestore Database:**
1. Firebase Console > **Firestore Database** > **Create Database**
2. Pilih location (asia-southeast2 untuk Indonesia)
3. Start in **production mode**

#### **Deploy Firestore Rules:**
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

Atau copy manual dari `firestore.rules` ke Firebase Console.

### 4. Run Development Server

```bash
bun run dev
```

Open http://localhost:9002

---

## 🔧 Available Commands

### Development:
```bash
bun run dev              # Start dev server
bun run typecheck        # TypeScript check
bun run lint             # Run ESLint
```

### Testing:
```bash
bun test                 # Run tests
bun test:watch           # Watch mode
bun test:coverage        # Coverage report
```

### Performance:
```bash
bun run analyze          # Bundle size analysis
```

### Production:
```bash
bun run build            # Build for production
bun run start            # Start production server
```

### AI/Genkit:
```bash
bun run genkit:dev       # Genkit dev UI
bun run genkit:watch     # Genkit watch mode
```

---

## 🌟 New Features Walkthrough

### **Dark Mode** 🌓
1. Click Sun/Moon icon di header
2. Pilih Light, Dark, atau System
3. Preference tersimpan di localStorage

### **Favorites** ❤️
1. Click Heart icon di header untuk lihat favorites
2. Di video page, click Bookmark button
3. Video tersimpan dan sync real-time

### **Keyboard Shortcuts** ⌨️
- Press `Shift + ?` untuk lihat semua shortcuts
- Press `/` untuk focus search
- Press `H` untuk dashboard
- Press `F` untuk favorites
- Press `Esc` untuk close modals

### **Email Verification** 📧
- Banner muncul jika email belum verified
- Click "Kirim Ulang Email" untuk resend
- Check email dan click verification link
- Click "Sudah Verifikasi" untuk refresh status

### **Breadcrumbs** 🍞
- Auto-generated navigation path
- Appears at top of pages
- Click untuk navigate back

### **Share Video** 🔗
- Click "Bagikan" button di watch page
- Uses native share API (mobile)
- Fallback: copy link to clipboard

### **Enhanced Search** 🔍
- Debounced search (500ms)
- URL synchronization
- Clear button (X)
- Indonesian interface

---

## 🎨 UI/UX Features

### **Modern Design System:**
- ✅ Clean white background
- ✅ Professional color palette
- ✅ Gradient effects
- ✅ Glass-morphism
- ✅ Shimmer loading
- ✅ Smooth animations

### **Component Enhancements:**
- ✅ Video cards: hover effects, play button, duration badge
- ✅ Playlist cards: stats, modern hero
- ✅ Dashboard: gradient stat cards
- ✅ Toast: icons untuk variants
- ✅ Skeleton: shimmer animation

---

## 🛡️ Security Features

### **Rate Limiting:**
- AI generation: 10 requests/hour
- Automatic reset
- User feedback

### **Content Moderation:**
- Profanity filter
- URL validation
- Suspicious pattern detection

### **Audit Logging:**
- All CRUD operations tracked
- User activity logged
- Admin review ready

---

## 📊 Performance Features

### **Offline Support:**
- Firestore offline persistence
- Multi-tab support
- 50-70% less Firestore reads

### **Image Optimization:**
- Next.js Image component
- Automatic WebP conversion
- Lazy loading

### **Bundle Optimization:**
- Code splitting
- Tree shaking
- Analysis tools ready

---

## 🧪 Testing

### Run Tests:
```bash
bun test
```

### Test Coverage:
```bash
bun test:coverage
```

### Sample Tests Included:
- Utils functions
- Content moderation
- Component tests ready

---

## 🚀 Deployment

### Vercel (Recommended):
1. Push to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_FIREBASE_*` (all Firebase vars)
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_BASE_URL`
4. Deploy!

### Firebase Hosting:
```bash
firebase init hosting
firebase deploy
```

---

## ⚙️ Configuration Files

- `.env.local` - Environment variables (local)
- `.env.example` - Template untuk setup
- `next.config.ts` - Next.js config
- `tailwind.config.ts` - Tailwind config
- `tsconfig.json` - TypeScript config
- `jest.config.js` - Jest config
- `firestore.rules` - Firestore security rules

---

## 📚 Documentation

- `README.md` - Getting started
- `CHANGELOG.md` - Version history
- `FULL-IMPLEMENTATION-SUMMARY.md` - Complete feature list
- `PERFORMANCE-OPTIMIZATION.md` - Performance guide
- `REMAINING-IMPROVEMENTS.md` - Future enhancements

---

## 🐛 Troubleshooting

### Port already in use:
```bash
# Kill process on port 9002 (Windows)
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# Or change port in package.json
"dev": "next dev -p 3000"
```

### ChunkLoadError:
```bash
Remove-Item -Recurse -Force .next
bun run dev
```

### Firebase connection error:
- Check internet connection
- Verify Firebase config in `.env.local`
- Check Firebase Console for project status

### Build errors:
```bash
bun run typecheck        # Check TypeScript errors
bun run lint             # Check ESLint errors
```

---

## 💡 Tips

### Development:
- Use `Shift + ?` untuk keyboard shortcuts
- Press `/` untuk quick search
- Use dark mode untuk better visibility
- Check PWA install prompt

### Production:
- Always set environment variables
- Enable analytics tracking
- Monitor error rates
- Regular backups
- Check bundle size

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 📞 Support

Jika ada masalah:
1. Check console untuk errors
2. Review documentation files
3. Check GitHub issues (if applicable)
4. Review FULL-IMPLEMENTATION-SUMMARY.md

---

**Happy Coding! 🎉**

Made with ❤️ for MA Alhuda Pangabasen

