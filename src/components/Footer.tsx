import { siteConfig } from "@/data/site";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 mt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto text-center">
        <p className="space-x-3">
          <span>
            &copy; {new Date().getFullYear()} • {siteConfig.name} — {siteConfig.role}
          </span>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            LinkedIn
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
