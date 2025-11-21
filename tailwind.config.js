/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "*.html",
    "./app/src/**/*.rs",
    "./frontend/src/**/*.rs"
  ],
  // Safelist all classes that might be used to avoid missing styles
  safelist: [
    'text-white', 'font-mono', 'bg-black', 'text-green-400', 'hover:text-green-400',
    'hover:text-white', 'text-gray-500', 'text-gray-300', 'text-gray-400',
    'bg-black/50', 'bg-black/20', 'bg-black/40', 'bg-black/80',
    'backdrop-blur-sm', 'border-white/5', 'border-green-900/30',
    'min-h-screen', 'relative', 'fixed', 'absolute', 'z-10', 'z-20',
    'pointer-events-none', 'pointer-events-auto', 'mix-blend-difference',
    'p-6', 'p-8', 'p-12', 'pt-24', 'px-4', 'mb-1', 'mb-2', 'mb-4', 'mb-8', 'mt-8',
    'flex', 'flex-col', 'grid', 'justify-between', 'justify-center', 'items-center',
    'text-center', 'text-left', 'text-2xl', 'text-4xl', 'text-xl', 'text-xs', 'text-sm',
    'font-bold', 'font-light', 'tracking-tighter', 'tracking-widest',
    'gap-4', 'gap-6', 'space-y-6', 'max-w-2xl',
    'rounded-lg', 'border', 'border-b', 'border-l-2',
    'grid-cols-1', 'md:grid-cols-3', 'md:text-6xl', 'md:text-base',
    'text-transparent', 'bg-clip-text', 'bg-gradient-to-r',
    'from-white', 'via-gray-200', 'to-gray-500',
    'h-px', 'w-24', 'w-full', 'mx-auto',
    'min-h-[80vh]', 'cursor-pointer'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

