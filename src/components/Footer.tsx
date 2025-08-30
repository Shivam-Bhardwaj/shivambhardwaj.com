import { siteConfig } from "@/data/site";
import VersionInfo from "./VersionInfo";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-gray-700 p-4 mt-8 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="flex flex-wrap justify-center items-center gap-3">
            <span>
              &copy; {new Date().getFullYear()} • {siteConfig.name} — {siteConfig.role}
            </span>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              GitHub
            </a>
          </p>
          <div className="mt-2 flex justify-center relative">
            <VersionInfo />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
