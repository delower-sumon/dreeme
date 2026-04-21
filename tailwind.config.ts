import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dream: {
          purple: '#a855f7',
          cyan: '#06b6d4',
          sky: '#0ea5e9',
        },
      },
      backgroundImage: {
        'dream-gradient': 'radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 55%), linear-gradient(to bottom, #f5e3e6, #d9e4f5)',
        'dream-gradient-dark': 'radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 55%), radial-gradient(circle at bottom, rgba(129,140,248,0.25), transparent 60%), linear-gradient(to bottom, #020617, #020617, #030712)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
export default config
