"use client";
import packageJson from "../../package.json";

export default function VersionDisplay() {
  return (
    <div className="fixed bottom-4 left-4 z-50 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
      v{packageJson.version}
    </div>
  );
}