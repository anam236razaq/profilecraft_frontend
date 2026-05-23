import { Link } from "react-router-dom";
import { TwitterIcon, GitHubIcon, LinkedInIcon } from "../assets/icons";

export default function Footer() {
  return (
    <footer className="bg-gray-900 mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <span className="font-semibold text-white">ProfileCraft</span>
            <span className="text-sm text-gray-400 ml-2">
              © 2026 All rights reserved.
            </span>
          </div>

          {/* Right Side Content */}
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400">
              Create your portfolio in minutes
            </span>
            <div className="flex items-center gap-4">
              <Link
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </Link>
              <Link
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </Link>
              <Link
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
