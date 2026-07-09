# AdmitFlow — Uttarakhand College Admission Companion

**Never miss a college admission opportunity again.**

AdmitFlow collects, organizes, and displays admission-related information from all Uttarakhand government colleges in one place.

## ✨ Features

- **Dashboard** — Latest notices, upcoming deadlines, today's activities at a glance
- **College Profiles** — Dedicated pages for each college with courses, fees, contact, timeline
- **Notice Center** — Every notice from every college in one searchable place
- **Admission Timeline** — Know exactly where each college's admission process stands
- **Watchlist** — Mark favourite colleges and get priority updates
- **Smart Search** — Search across all notices, colleges, courses, and branches
- **AI Summaries** — Get AI-generated summaries of lengthy PDF notices
- **Calendar** — View all admission events, deadlines, and important dates
- **Analytics** — Track notice patterns, deadlines, and admission trends
- **Dark Mode** — Light, dark, and system theme support
- **Download History** — Keep track of all downloaded notices

## 🏫 Supported Colleges (v1)

| Type | Colleges |
|------|----------|
| **Universities** | Doon University, UKTech (VMSBUTU) |
| **Engineering** | GBPIET Pauri, THDC IHET Tehri, GIT Gopeshwar, GIT Uttarkashi, GIT Tanakpur, WIT Dehradun |

## 🚀 Getting Started

### Web Version
Visit **[admitflow.vercel.app](https://admitflow.vercel.app)** — no installation needed.

### Local Development

```bash
# Clone the repository
git clone https://github.com/AdmitFlow/admitflow.git
cd admission-hq

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Self-hosting

```bash
npm run build
npm start
```

The application runs on `http://localhost:3000` by default.

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [Lucide React](https://lucide.dev/) — Icons
- [next-themes](https://github.com/pacocoursey/next-themes) — Dark mode

## 📁 Project Structure

```
admitflow/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── dashboard/   # Dashboard page
│   │   ├── colleges/    # College profiles
│   │   ├── notices/     # Notice center
│   │   ├── search/      # Search functionality
│   │   ├── analytics/   # Statistics & insights
│   │   ├── calendar/    # Admission calendar
│   │   ├── watchlist/   # Favourite colleges
│   │   ├── settings/    # User preferences
│   │   └── about/       # About page
│   ├── components/      # Reusable UI components
│   ├── data/            # Seed data (colleges, notices)
│   ├── types/           # TypeScript type definitions
│   ├── lib/             # Utilities & localStorage store
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
└── package.json         # Dependencies & scripts
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/admission-hq.git
cd admission-hq

# Create a branch
git checkout -b feature/your-feature-name

# Make changes and commit
git commit -m "Add your feature"

# Push and create a pull request
git push origin feature/your-feature-name
```

## 📝 License

This project is licensed under the MIT License — see [LICENSE](LICENSE).

## 🎯 Vision

AdmitFlow aims to become the definitive admission companion for students across India. v1 focuses on Uttarakhand government colleges, with plans to expand to more states in future releases.

**What makes AdmitFlow different?**
- Not just a notice aggregator — it's a personal admission assistant
- Answers: *What changed today? What should I do? Which colleges are open?*
- AI summaries so you don't have to read 20-page PDFs
- Everything reachable within three clicks

---

Built with ❤️ for Uttarakhand students.
