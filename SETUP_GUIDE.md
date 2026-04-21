# dreeme - Dream Journal & Interpretation Platform

A beautiful, fast, and intuitive web application for dreamers to log, analyze, interpret, and share their dreams. Built with Next.js, React, TypeScript, and Tailwind CSS.

## 🌙 Features

### Core Features
- **Dream Journal**: Capture dreams with text input or voice recording
- **AI Interpretation**: Get angelic, human-centered AI interpretations of your dreams
- **Dream Tracking**: Visualize patterns and trends over time with interactive charts
- **DreamSpace Community**: Share dreams and read articles about dream science
- **Mood & Sleep Tracking**: Record moods and sleep hours for deeper insights

### Technical Features
- **Beautiful UI**: Gradient backgrounds, animations, and dreamy effects
- **Light/Dark Theme**: Toggle between themes with persistent storage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Voice Recording**: Use browser speech recognition for voice input
- **Real-time Updates**: Instant dream saving and interpretation generation

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui principles + Lucide React icons
- **State Management**: React Hooks
- **API Routes**: Next.js API endpoints

## 📋 Project Structure

```
DreamV1/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with theme management
│   │   ├── page.tsx                # Home page with hero section
│   │   ├── globals.css             # Global styles and animations
│   │   ├── journal/
│   │   │   └── page.tsx            # Dream journal page
│   │   ├── dreamspace/
│   │   │   └── page.tsx            # Shared dreams & articles
│   │   ├── tracker/
│   │   │   └── page.tsx            # Analytics & visualizations
│   │   ├── pricing/
│   │   │   └── page.tsx            # Pricing page
│   │   ├── about/
│   │   │   └── page.tsx            # About page
│   │   └── api/
│   │       └── interpret/
│   │           └── route.ts        # Dream interpretation API
│   ├── components/
│   │   ├── Header.tsx              # Navigation header
│   │   └── Footer.tsx              # Footer component
│   └── ...
├── public/                          # Static assets
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind configuration
└── next.config.js                   # Next.js configuration
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd DreamV1
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## 📖 Pages Overview

### Home Page (`/`)
- Hero section with compelling copy
- Feature cards highlighting core capabilities
- Call-to-action buttons for getting started

### Journal Page (`/journal`)
- **Dream Input**: Text area or voice input for dream description
- **Date Selection**: Calendar picker for dream date
- **Mood Selection**: Up to 3 moods (Calm, Anxious, Inspired, etc.)
- **Sleep Hours**: Track how many hours you slept
- **Interpretation**: AI-powered dream analysis with positive vibes
- **Save Dream**: Store dreams with auto-generated names
- **Saved Dreams List**: View and manage all saved dreams

### DreamSpace Page (`/dreamspace`)
- **Shared Dreams Tab**: Browse community dream submissions
- **Articles Tab**: Read about dream science and psychology
- **Interactions**: Like (❤️) and comment on shared content
- **Discovery**: Explore other dreamers' experiences

### Tracker Page (`/tracker`)
- **Statistics**: Total dreams, average sleep, weekly count
- **Weekly Frequency Chart**: Bar chart of dreams by day
- **Mood Distribution**: Mood patterns over time
- **Sleep vs Dreams**: Correlation between sleep hours and dream count
- **Blog Section**: 9 sleep & dream science articles

### Pricing Page (`/pricing`)
- **Three Tiers**: Free (Dreamer), $3/mo (Lucid), $9/mo (Oracle)
- **Feature Comparison**: Clear feature matrix
- **FAQ Section**: Common questions about plans and billing

### About Page (`/about`)
- **Mission Statement**: Platform purpose and vision
- **Values**: Human-centered, Beautiful, Community-first, Private
- **Team Section**: Meet the founders
- **Contact**: Email and social links

## 🎨 Design System

### Colors
- **Primary**: Violet (#a855f7)
- **Secondary**: Sky (#0ea5e9), Cyan (#06b6d4)
- **Background**: Gradient from #f5e3e6 to #d9e4f5 (light), dark slate (dark)

### Components
- **Glow Button**: Animated border glow on hover
- **Dream Border**: Rotating gradient border animation
- **Cards**: Rounded with border/shadow on hover
- **Charts**: Bar charts with gradient fills

### Animations
- **Glowing**: Conic gradient animation (6s)
- **Border Flow**: Rotating gradient (10s)
- **Dreams Pulse**: Title text color shift (5s)
- **Shimmer**: Loading animation effect

## 🔌 API Endpoints

### POST /api/interpret
Generates AI dream interpretation

**Request:**
```json
{
  "dreamText": "I was walking through a glowing city..."
}
```

**Response:**
```json
{
  "interpretation": "Your dream suggests...",
  "success": true
}
```

## 🔐 Authentication & Database

> **Note**: Authentication with Clerk.js and database integration are planned for the next phase. Currently using mock data.

### Planned Implementation:
- **Auth**: Clerk.js for user management
- **Database**: MySQL on Lightspeed server (phpmyadmin)
- **ORM**: Prisma for database access
- **Protected Routes**: /journal, /dreamspace, /tracker require login

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎯 Next Steps & TODOs

### Immediate (Phase 2)
- [ ] Integrate Clerk.js for authentication
- [ ] Connect to phpmyadmin MySQL database
- [ ] Implement actual AI API (OpenAI/Anthropic)
- [ ] Add dream sharing with privacy controls
- [ ] Implement payment processing with Stripe

### Medium Term (Phase 3)
- [ ] Admin dashboard for article management
- [ ] User profile and settings page
- [ ] Dream search and filtering
- [ ] Export dream journal (PDF, JSON)
- [ ] Email notifications for community engagement

### Future Enhancements
- [ ] Mobile apps (React Native)
- [ ] Dream-based recommendations
- [ ] Recurring dream detection
- [ ] Dream group discussions
- [ ] Integration with sleep tracking devices

## 🚨 Important Notes

### Database Integration
When you provide the phpmyadmin database credentials, update:
1. Environment variables with database connection string
2. Prisma schema (`schema.prisma`) for models
3. API routes to use Prisma client instead of mock data

### AI Integration
Replace mock interpretations in `/api/interpret/route.ts` with actual API calls to:
- OpenAI GPT-4
- Anthropic Claude
- Other LLM providers

### Authentication Setup
1. Sign up at [Clerk.js](https://clerk.com)
2. Get API keys and add to `.env.local`
3. Implement Clerk middleware in `middleware.ts`
4. Add authentication to protected routes

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts` to change the color scheme

### Fonts
Currently using system fonts. To customize:
1. Add font imports to `app/layout.tsx`
2. Update `tailwind.config.ts` font-family

### Animations
Modify keyframe animations in `app/globals.css`

## 📞 Support

For issues or questions:
- Email: hello@dreeme.app
- Discord: [Community Link]
- Twitter: [@dreemeapp](https://twitter.com)

## 📄 License

MIT License - Feel free to use and modify for your projects

## 🙏 Acknowledgments

- Inspired by the intersection of technology, psychology, and spirituality
- Dream interpretation methodology based on modern psychology
- Design principles from beautiful SaaS platforms
- Community of dreamers who shared their experiences

---

**Built with ✨ and 🌙 for dreamers everywhere**
