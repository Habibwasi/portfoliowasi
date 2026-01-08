'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Code2, Zap, Users } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: Code2,
      title: 'Full-Stack Development',
      description: 'Experienced building scalable applications with Python, C#, JavaScript, and modern frameworks like Django, .NET, and React.'
    },
    {
      icon: Zap,
      title: 'Algorithmic Efficiency',
      description: 'Passionate about data structures and algorithms, implementing optimized solutions like BSTs, Merge Sort, and graph traversal.'
    },
    {
      icon: Users,
      title: 'Collaborative Learner',
      description: 'Thrive in team environments through pair programming, code reviews, and collective problem-solving in agile settings.'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">About Me</h2>
            
            <p className="text-foreground/70 leading-relaxed">
              I'm a motivated BSc Software Engineering student at the University of Southern Denmark, 
              expected to graduate in January 2027. With a strong foundation in full-stack development, 
              I'm passionate about building scalable applications and solving real-world technical problems.
            </p>

            <p className="text-foreground/70 leading-relaxed">
              My academic journey has equipped me with expertise in multiple programming paradigms, 
              cloud computing, cybersecurity, and software architecture. I've applied this knowledge 
              to create three major projects showcasing different technology stacks and problem-solving approaches.
            </p>

            <p className="text-foreground/70 leading-relaxed">
              Beyond coding, I'm interested in open-source contributions, AI applications. 
              I value clean code, efficient algorithms, and collaborative development practices.
            </p>

            {/* Education Card */}
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
              <h3 className="font-bold mb-2">Education</h3>
              <p className="text-foreground/80">
                <strong>BSc in Software Engineering</strong>
              </p>
              <p className="text-foreground/60 text-sm">
                University of Southern Denmark
              </p>
              <p className="text-foreground/60 text-sm">
                Expected Graduation: January 2027
              </p>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500/10">
                          <Icon className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{feature.title}</h3>
                        <p className="text-sm text-foreground/60 mt-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
