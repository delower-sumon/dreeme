# 🌙 dreeme - Quick Start Guide

Welcome to dreeme! This guide will get you up and running in minutes.

## ✨ What's Already Built

Your dreeme application is fully functional with all core pages and features:

### ✅ Complete Pages
- **Home**: Beautiful landing page with hero section and features
- **Journal**: Capture dreams with text/voice input, mood selection, AI interpretation
- **DreamSpace**: Browse shared dreams and sleep science articles
- **Tracker**: Visualize patterns with charts and statistics
- **Pricing**: Three subscription tiers with features
- **About**: Mission, values, team, and contact information

### ✅ Features Ready to Use
- Dream input with text and voice recording
- AI dream interpretation (mock API, ready for real AI)
- Beautiful animations and gradient effects
- Light/dark theme toggle
- Responsive mobile design
- Chart visualizations (weekly dreams, mood distribution, sleep correlation)

## 🚀 Getting Started

### 1. Access the Application
```
http://localhost:3000
```

The development server is already running!

### 2. Explore Each Page

**Home (`/`)**
- Click "Start Dream Journal" or "DreamSpace" buttons
- Notice the animated hero section and feature cards

**Journal (`/journal`)**
- Type or speak a dream in the text area
- Select the date using the calendar
- Choose 1-3 moods from the available options
- Enter hours slept
- Click "Interpret Dream" to generate AI interpretation
- Click "Save Dream" to store it
- View your saved dreams list

**DreamSpace (`/dreamspace`)**
- Switch between "Shared Dreams" and "Articles" tabs
- Like (❤️) other dreamers' content
- Explore sleep science articles

**Tracker (`/tracker`)**
- View statistics about your dreams
- Analyze patterns with interactive charts
- Browse 9 sleep & dream science articles

**Pricing (`/pricing`)**
- Compare three subscription tiers
- Read FAQ about billing and features

**About (`/about`)**
- Learn about dreeme's mission
- Meet the team
- Get in touch

### 3. Toggle Theme
- Click the moon/sun icon in the header
- Your preference is saved!

### 4. Try Voice Recording
- Go to Journal page
- Click "Record Voice" button
- Speak your dream
- Your speech will be transcribed to text

## 📝 Next Steps: Connecting to Your Database

When you're ready to connect your phpmyadmin database:

1. **Read the guides**:
   - `SETUP_GUIDE.md` - Comprehensive project overview
   - `IMPLEMENTATION_GUIDE.md` - Step-by-step setup instructions

2. **Prepare your database credentials**:
   - Database name
   - Username
   - Password
   - Host (Lightspeed server address)
   - Port number

3. **Follow Phase 1-2 in IMPLEMENTATION_GUIDE.md**:
   - Set up Clerk.js authentication
   - Connect MySQL database with Prisma
   - Update API routes to use real database

4. **Integrate AI** (optional):
   - Connect OpenAI or Anthropic API
   - Replace mock interpretations with real AI responses

## 🔧 Customization

### Change Colors
Edit `src/app/globals.css` or `tailwind.config.ts`

### Modify Dream Moods
In `src/app/journal/page.tsx`, line with `availableMoods`:
```typescript
const availableMoods = ['Calm', 'Anxious', 'Inspired', 'Curious', 'Peaceful', 'Turbulent']
```

### Update Mock Data
In `src/app/dreamspace/page.tsx`, edit the `useState` initial values

### Change Pricing
In `src/app/pricing/page.tsx`, edit the `plans` array

## 📂 Project Structure Summary

```
src/
├── app/
│   ├── page.tsx              ← Home page
│   ├── journal/page.tsx      ← Dream journal
│   ├── dreamspace/page.tsx   ← Shared dreams
│   ├── tracker/page.tsx      ← Analytics
│   ├── pricing/page.tsx      ← Pricing
│   ├── about/page.tsx        ← About
│   ├── api/
│   │   └── interpret/        ← Dream interpretation API
│   ├── layout.tsx            ← Root layout
│   └── globals.css           ← Global styles
├── components/
│   ├── Header.tsx            ← Navigation
│   └── Footer.tsx            ← Footer
```

## 🐛 Troubleshooting

### Page not loading?
```bash
# Restart dev server
npm run dev
```

### Styles not showing?
```bash
# Rebuild Tailwind CSS
npm run dev
```

### Voice recording not working?
- Use a modern browser (Chrome, Edge, Firefox, Safari)
- Grant microphone permission when prompted

### Something looks broken?
- Check browser console for errors (F12)
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server

## 📞 Support

### Documentation Files
- `SETUP_GUIDE.md` - Full documentation
- `IMPLEMENTATION_GUIDE.md` - Integration instructions
- `.env.example` - Environment variables template
- `prisma_schema_template.txt` - Database schema

### File Locations
- Configuration: `package.json`, `tsconfig.json`, `tailwind.config.ts`
- Styles: `src/app/globals.css`
- API: `src/app/api/`
- Pages: `src/app/[page-name]/page.tsx`
- Components: `src/components/`

## 🎯 Development Workflow

### Make Changes
Edit any file in `src/` - Next.js will auto-reload

### Add New Page
1. Create folder: `src/app/new-page/`
2. Create file: `src/app/new-page/page.tsx`
3. Add to navigation in `src/components/Header.tsx`

### Test Locally
1. Visit `http://localhost:3000`
2. Open DevTools (F12)
3. Check console for errors

### Build for Production
```bash
npm run build
npm start
```

## 💡 Tips

- The app uses React hooks for state management (no Redux needed)
- API routes are in `src/app/api/`
- Styling uses Tailwind CSS utility classes
- Icons come from Lucide React
- Mock data is in component `useState` hooks

## 🎨 Design Features

- **Responsive**: Works on mobile, tablet, desktop
- **Animated**: Smooth transitions and micro-interactions
- **Themed**: Light and dark modes
- **Accessible**: Semantic HTML, ARIA labels
- **Fast**: Next.js optimizations built-in

## 📊 Production Checklist

Before deploying to production:
- [ ] Set up Clerk.js authentication
- [ ] Connect database
- [ ] Integrate AI API
- [ ] Set up Stripe for payments
- [ ] Configure environment variables
- [ ] Run production build: `npm run build`
- [ ] Test all features
- [ ] Set up monitoring and error tracking

## 🚀 Deployment

Ready to deploy? Options:
- **Vercel** (Recommended - free, made by Next.js creators)
- **Netlify** (Easy setup)
- **AWS** (More control)
- **DigitalOcean** (Affordable)

Connect your GitHub repo to Vercel/Netlify and deploy with one click!

---

**Happy dreaming! 🌙✨**

Questions? Check `SETUP_GUIDE.md` or `IMPLEMENTATION_GUIDE.md` for detailed information.
