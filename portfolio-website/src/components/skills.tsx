'use client';

import { motion } from 'motion/react';
import { Card } from './ui/card';

const skillCategories = [
  {
    category: 'Languages',
    skills: ['Java', 'Python', 'C++', 'JavaScript', 'SQL', 'C#', 'HTML', 'CSS']
  },
  {
    category: 'Frameworks & Libraries',
    skills: ['React', 'Node.js', 'Spring Boot', 'Django', '.NET', 'Laravel']
  },
  {
    category: 'Tools & DevOps',
    skills: ['Git', 'GitHub', 'Docker', 'Linux/Unix', 'Jira', 'REST APIs']
  },
  {
    category: 'Databases',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB']
  },
  {
    category: 'Specializations',
    skills: ['Data Structures & Algorithms', 'Full-Stack Development', 'Software Architecture', 'Cloud Computing', 'IoT Integration']
  }
];

export function Skills() {
  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Technical Skills</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of languages, frameworks, tools, and specializations I've developed throughout my studies and projects
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                <h3 className="text-lg font-bold mb-4 text-blue-500">
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
