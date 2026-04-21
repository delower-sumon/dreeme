'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-8 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100 block">dreeme</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Dream Journal & oracle</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your personal dream companion</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/#features" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link href="/journal" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Journal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/about" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="#" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Dreeme. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
