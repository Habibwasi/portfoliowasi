'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Award, TrendingUp, Target, CheckCircle2 } from 'lucide-react';

export function Experience() {
  const utestStats = [
    {
      icon: Award,
      label: 'Current Rating',
      value: '74.26%',
      description: 'Proven Quality',
      color: 'text-blue-500'
    },
    {
      icon: CheckCircle2,
      label: 'Test Cycles',
      value: '86',
      description: 'Completed',
      color: 'text-green-500'
    },
    {
      icon: Target,
      label: 'Activity Score',
      value: '51',
      description: 'Active Tester',
      color: 'text-purple-500'
    },
    {
      icon: TrendingUp,
      label: 'Quality Score',
      value: '58',
      description: 'High Quality',
      color: 'text-orange-500'
    }
  ];

  const testingCategories = [
    { name: 'Functional', rating: 'P' },
    { name: 'Usability', rating: 'U' },
    { name: 'Load', rating: 'U' },
    { name: 'Security', rating: 'U' },
    { name: 'Localization', rating: 'U' },
    { name: 'Accessibility', rating: 'U' }
  ];

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Professional Experience</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Quality Assurance and Software Testing expertise gained through real-world projects
          </p>
        </motion.div>

        {/* Main Experience Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">QA Tester</h3>
                <p className="text-lg text-foreground/80 mb-1">uTest by Applause</p>
                <p className="text-sm text-foreground/60">Remote • 2024 - Present</p>
              </div>
              <Badge variant="secondary" className="self-start px-4 py-2 text-sm">
                Active Contributor
              </Badge>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-foreground/70 leading-relaxed">
                Professional crowdtesting platform where I conduct comprehensive quality assurance testing 
                across web, mobile, and desktop applications for global companies. Specialized in identifying 
                critical bugs, usability issues, and functionality problems before product releases.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground/90">Key Responsibilities:</h4>
                <ul className="space-y-2 text-foreground/70">
                  <li className="flex gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Execute test cases across multiple platforms and devices to ensure cross-platform compatibility</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Document and report bugs with detailed reproduction steps, screenshots, and technical analysis</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Perform exploratory testing to uncover edge cases and improve overall product quality</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Collaborate with development teams through structured feedback and regression testing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Maintain high-quality standards consistently achieving ratings in the Proven tier</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {utestStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs font-semibold text-foreground/80 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-foreground/60">
                        {stat.description}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Testing Categories */}
            <div>
              <h4 className="font-semibold text-foreground/90 mb-3">Testing Specializations:</h4>
              <div className="flex flex-wrap gap-2">
                {testingCategories.map((category, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-3 py-1"
                  >
                    {category.name}
                    <span className={`ml-2 font-bold ${
                      category.rating === 'P' ? 'text-blue-500' : 'text-foreground/60'
                    }`}>
                      [{category.rating}]
                    </span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-foreground/50 mt-3">
                P = Proven • U = Unrated
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Additional Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">76</div>
            <div className="text-sm font-semibold mb-1">Test Cases</div>
            <div className="text-xs text-foreground/60">Successfully Executed</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">36</div>
            <div className="text-sm font-semibold mb-1">Products Tested</div>
            <div className="text-xs text-foreground/60">Across Multiple Industries</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">12</div>
            <div className="text-sm font-semibold mb-1">Issues Reported</div>
            <div className="text-xs text-foreground/60">High-Impact Bugs Found</div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
