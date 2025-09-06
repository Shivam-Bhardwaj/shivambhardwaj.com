export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Contact</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get in touch for collaborations and opportunities.
          </p>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Email</h2>
              <a href="mailto:curious.antimony@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                curious.antimony@gmail.com
              </a>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">GitHub</h2>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                github.com/yourusername
              </a>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">LinkedIn</h2>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                linkedin.com/in/shivambhardwaj
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}