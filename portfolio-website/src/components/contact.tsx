'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'habibwasi9@gmail.com',
      href: 'mailto:habibwasi9@gmail.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+45 71857830',
      href: 'tel:+4571857830'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Kolding, Denmark',
      href: '#'
    }
  ];

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            I'm always interested in hearing about new opportunities and projects. Feel free to reach out!
          </p>
        </motion.div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.a
                key={index}
                href={info.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="block"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow text-center h-full">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="font-bold mb-2">{info.label}</h3>
                  <p className="text-foreground/60 text-sm">{info.value}</p>
                </Card>
              </motion.a>
            );
          })}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows={6}
                  required
                  className="bg-background resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                  I'll get back to you as soon as possible.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm"
                >
                  ✓ Message sent successfully! Thank you for reaching out.
                </motion.div>
              )}
            </form>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
