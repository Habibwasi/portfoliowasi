'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/Habibwasi',
      label: 'GitHub'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/habib-ahmed-wasi-4985091b8',
      label: 'LinkedIn'
    },
    {
      icon: Mail,
      href: 'mailto:habibwasi9@gmail.com',
      label: 'Email'
    }
  ];

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Habib Ahmed Wasi
            </h3>
            <p className="text-sm text-foreground/60">
              Software Engineering Student | Full-Stack Developer
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#about" className="hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-foreground transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-foreground transition-colors">
                  Skills
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-center text-sm text-foreground/60"
        >
          <p>
            © {currentYear} Habib Ahmed Wasi. All rights reserved.
          </p>
          <p className="flex items-center gap-1 mt-4 sm:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500" /> using Next.js & Tailwind CSS
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
