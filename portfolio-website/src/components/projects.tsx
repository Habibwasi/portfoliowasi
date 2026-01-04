'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Github, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'Undershelf',
    subtitle: 'Intelligent Book Search & Recommendation System',
    description: 'Scalable web application solving inefficient book discovery using Python and Django. Features a three-layer architecture with Binary Search Trees for O(log n) search performance and a hybrid recommendation engine combining TF-IDF and graph traversal.',
    tags: ['Python', 'Django', 'React', 'PostgreSQL', 'Pytest', 'BST', 'BFS'],
    github: 'https://github.com/SP-SDU/Undershelf',
    highlights: [
      'O(log n) search performance with BST',
      '80%+ test coverage with Pytest',
      'Sub-second search response times',
      'Hybrid recommendation engine'
    ]
  },
  {
    title: 'Heat.IT',
    subtitle: 'District Heating Optimization Application',
    description: 'Desktop application for optimizing district heating networks using C# and .NET. Replaced manual scheduling with intelligent automation, featuring comprehensive Asset Manager module and extensive QA testing.',
    tags: ['C#', '.NET', 'Avalonia', 'XUnit', 'Jira', 'UML'],
    github: 'https://github.com/Bobike123/HeatIT',
    highlights: [
      'Asset Manager module for production tracking',
      'Comprehensive XUnit test coverage',
      'UML Sequence Diagrams for system design',
      'Pair programming & code reviews'
    ]
  },
  {
    title: 'Deskinct',
    subtitle: 'IoT Smart Desk Management System',
    description: 'Web-based IoT application using PHP and Laravel for tracking smart desk usage. Integrated REST APIs with IoT-enabled Linak desks for real-time height adjustment and comprehensive analytics dashboard.',
    tags: ['PHP', 'Laravel', 'REST APIs', 'MySQL', 'Chart.js', 'IoT', 'Linak'],
    github: 'https://github.com/Adymr/Desk-SemesterProject',
    highlights: [
      'REST API integration with IoT desks',
      'Real-time height adjustment monitoring',
      'Analytics dashboard with Chart.js',
      'User authentication with Laravel Breeze'
    ]
  }
];

export function Projects() {
  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Here are some of my most significant academic and personal projects that demonstrate my full-stack development capabilities
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="p-6 sm:p-8">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                      <p className="text-foreground/70 text-sm">{project.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/70 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold mb-3 text-foreground/80">Key Highlights:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-foreground/60 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
