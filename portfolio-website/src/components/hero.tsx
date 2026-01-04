'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowRight, Code2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          {/* Animated greeting badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span className="text-foreground/80">Welcome to my portfolio</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          >
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Habib Ahmed Wasi
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto"
          >
            Software Engineering Student | Full-Stack Developer
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed"
          >
            BSc Software Engineering student at the University of Southern Denmark. 
            Passionate about building scalable applications, algorithmic efficiency, and solving real-world problems 
            with clean, maintainable code.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <a href="#projects">
                View My Projects <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <a href="#contact">
                Get in Touch
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto"
          >
            {[
              { value: '3+', label: 'Major Projects' },
              { value: '8+', label: 'Technologies' },
              { value: '2027', label: 'Graduation' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-blue-500">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
