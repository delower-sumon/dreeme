'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Users, Zap, ChevronDown } from 'lucide-react'

// Types
interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

interface ValueItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Mock Data
const teamMembers: TeamMember[] = [
  { name: "Sarah Chen", role: "Dream Scientist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  { name: "Marcus Johnson", role: "AI Researcher", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  { name: "Emma Wilson", role: "UX Designer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  { name: "David Kim", role: "Sleep Specialist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
];

const values: ValueItem[] = [
  {
    title: "Understanding Dreams",
    description: "We believe dreams are gateways to our subconscious mind, offering insights into our deepest thoughts and emotions.",
    icon: <Brain size={32} className="text-purple-400" />
  },
  {
    title: "Personal Growth",
    description: "Our tools help you track patterns and gain self-awareness through dream analysis and interpretation.",
    icon: <Zap size={32} className="text-blue-400" />
  },
  {
    title: "Community Connection",
    description: "Share experiences and learn from others in our dream community to foster understanding and support.",
    icon: <Users size={32} className="text-cyan-400" />
  }
];

const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800" />
    <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 dark:opacity-30 animate-blob" />
    <div className="absolute top-40 right-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000" />
    <div className="absolute bottom-20 left-40 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000" />
  </div>
);

function HeroSection() {
  return (
    <section className="relative pt-20 pb-10 md:pt-32 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block mb-6 px-4 py-1 rounded-full bg-purple-100/50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-medium backdrop-blur-sm"
          >
            About Dreeme
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Understanding Your Dreams, One Night at a Time
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Dreeme is your personal dream companion, helping you record, analyze, and gain insights from your nightly adventures in the subconscious.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center"
          >
            <ChevronDown size={32} className="text-gray-400 animate-bounce" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Our Mission</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Making Dream Analysis Accessible</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              At Dreeme, we believe that understanding our dreams can lead to profound personal insights and improved mental well-being. Our mission is to make dream journaling and analysis accessible to everyone, regardless of their background or technical expertise.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Through our intuitive platform, advanced AI interpretation, and community features, we're creating a space where people can explore the fascinating world of dreams safely and effectively.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative h-[300px] rounded-xl overflow-hidden shadow-xl"
          >
            <img
              src="/images/about/dream_analogy.png"
              alt="Dream Analysis Analogy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
              <p className="text-white text-lg font-medium">"Dreams are the touchstones of our characters"</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Our Core Values</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 dark:border-gray-700/30"
            >
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Meet Our Team</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">The passionate people behind Dreeme who are dedicated to helping you understand your dreams</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">Have questions about Dreeme? We'd love to hear from you!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-glow-btn px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all relative"
          >
            <span>Contact Us</span>
            <span className="gradient-container">
              <span className="gradient"></span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      <Background />
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      <main className="relative z-10">
        <HeroSection />
        <MissionSection />
        <ValuesSection />
        <TeamSection />
        <ContactSection />
      </main>
    </div>
  );
}
