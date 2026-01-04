# Habib Ahmed Wasi - Developer Portfolio

A modern, attractive, and fully responsive portfolio website built with Next.js 16, TypeScript, Tailwind CSS, and Shadcn UI components.

## 🎨 Features

✨ **Modern Design**
- Responsive design that works on all devices (mobile, tablet, desktop)
- Dark/Light mode toggle with smooth transitions
- Gradient text and backgrounds for visual appeal
- Beautiful animations using Framer Motion

📱 **Sections**
- **Hero**: Eye-catching introduction with CTAs
- **About**: Your background, education, and key strengths
- **Projects**: Showcase of your 3 major academic projects with descriptions, tech stacks, and links
- **Skills**: Organized by categories (Languages, Frameworks, Tools, Databases, Specializations)
- **Work Experience**: Timeline of professional experience
- **Contact**: Contact information and functional contact form
- **Footer**: Quick navigation and social links

🚀 **Functional Features**
- Dark/Light theme toggle
- Smooth scroll navigation
- Animated components with Framer Motion
- Working contact form with email notifications
- Social links (GitHub, LinkedIn, Email)
- SEO optimized metadata
- Fast performance with Next.js optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (React), TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes (Dark mode support)
- **Email**: Nodemailer (Contact form)
- **Deployment**: Vercel (Recommended)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Gmail account with 2FA enabled (for contact form emails)

## 🚀 Getting Started

### Installation

1. **Install dependencies** (already done)
```bash
npm install
```

2. **Configure Email (Optional)**
   - If you want the contact form to send emails, set up Gmail credentials:
   - Enable 2-Factor Authentication on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Add to `.env.local`:
     ```
     EMAIL_USER=habibwasi9@gmail.com
     EMAIL_PASSWORD=your_app_password_here
     ```

3. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your portfolio in action!

## 📦 Build and Production

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest way to deploy your portfolio:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and select your repository
4. Set environment variables:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail App Password
5. Click Deploy!

Vercel will automatically build and deploy your site with optimal performance.

## 🎯 Customization

### Update Your Information

Edit these files to customize content:

1. **Navbar** - `src/components/navbar.tsx`
   - Update name, social links

2. **Hero Section** - `src/components/hero.tsx`
   - Change headline, description, stats

3. **About** - `src/components/about.tsx`
   - Update education, background, features

4. **Projects** - `src/components/projects.tsx`
   - Edit project details, add/remove projects
   - Update GitHub repo links

5. **Skills** - `src/components/skills.tsx`
   - Add/remove technologies
   - Modify categories
   - Update work experience

6. **Contact** - `src/components/contact.tsx`
   - Update contact information
   - Change email recipient

7. **Footer** - `src/components/footer.tsx`
   - Update links and information

### Styling

- **Colors**: Edit Tailwind config in `tailwind.config.ts`
- **Fonts**: Change in `src/app/layout.tsx` (currently using Geist family)
- **Components**: Use Shadcn UI library for consistent styling

## 📞 Contact Form Setup

The contact form sends emails to `habibwasi9@gmail.com`. For this to work:

1. Generate a Gmail App Password (requires 2FA)
2. Add credentials to `.env.local`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
3. The form will send both:
   - Admin notification to you
   - Confirmation email to the visitor

## 🔒 Security

- Never commit `.env.local` to version control (already in `.gitignore`)
- Use Gmail App Passwords, not your regular password
- Enable 2FA on your Gmail account
- For sensitive data, use Vercel's environment variables

## 📊 Performance Optimization

- Optimized images with Next.js Image component
- Code splitting and lazy loading
- Minified CSS and JavaScript
- Fast API routes for contact form
- SEO optimized with meta tags

## 🎓 Academic Projects

The portfolio showcases your 3 major academic projects:

1. **Undershelf** - Intelligent Book Search & Recommendation System
2. **Heat.IT** - District Heating Optimization Application
3. **Deskinct** - IoT Smart Desk Management System

Each project includes:
- Detailed description
- Tech stack used
- Key highlights and achievements
- Links to GitHub repositories

## 📈 Future Enhancements

Potential additions:
- Blog section for technical articles
- GitHub activity feed integration
- Project demo videos or screenshots
- Testimonials section
- Resume/CV download
- Analytics integration
- Newsletter signup

## 📝 License

This portfolio is open source and available for personal use.

## 👤 Author

**Habib Ahmed Wasi**
- 📧 Email: habibwasi9@gmail.com
- 💼 LinkedIn: [linkedin.com/in/habib-ahmed-wasi-4985091b8](https://linkedin.com/in/habib-ahmed-wasi-4985091b8)
- 🐙 GitHub: [github.com/Habibwasi](https://github.com/Habibwasi)
- 📍 Location: Kolding, Denmark

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Components from [Shadcn UI](https://ui.shadcn.com)
- Animations with [Framer Motion](https://www.framer.com/motion)
- Icons from [Lucide React](https://lucide.dev)

---

**Happy coding! 🚀**

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
