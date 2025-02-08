'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop & Mobile Header */}
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-medium text-sm text-gray-900">
            Storyboard
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 -mr-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            <Link 
              href="/examples" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Examples
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            
            <Button 
              size="sm" 
              variant="outline"
              className="text-sm border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-black hover:bg-gray-900 text-white text-sm rounded"
              asChild
            >
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link 
                href="/examples" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                Examples
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                Pricing
              </Link>
              <Link 
                href="/docs" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                Docs
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="outline"
                  className="w-full text-sm border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button 
                  className="w-full bg-black hover:bg-gray-900 text-white text-sm rounded"
                  asChild
                >
                  <Link href="/signup">Start free</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 