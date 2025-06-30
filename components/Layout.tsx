"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}


const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();

  const getBackgroundClass = () => {
    if (pathname.startsWith("/issue")) {
      return "bg-gradient-to-br from-blue-50 to-blue-100";
    } else if (pathname.startsWith("/verify")) {
      return "bg-gradient-to-br from-purple-50 to-purple-200";
    }
    return "bg-gradient-to-br from-gray-50 to-gray-200";
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-gray-500 text-xs sm:text-sm">
            Powered by AIR Credential SDK
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
