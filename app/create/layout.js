import Link from "next/link";

export const metadata = {
  title: "Create - Storyboard",
  description: "Create your comic with AI",
};

export default function CreateLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Create page header */}
      <div className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="font-medium text-sm text-gray-900">
              Storyboard
            </Link>
            <Link 
              href="/docs" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
}