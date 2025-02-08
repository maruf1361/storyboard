import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="py-8 sm:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 leading-tight">
              AI-powered comic creation for everyone
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Turn text into stunning comic panels in seconds. Professional-quality artwork, 
              consistent characters, and dynamic storytelling—all powered by AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-2">
              <Button 
                className="bg-black hover:bg-gray-900 text-white px-5 py-4 rounded w-full sm:w-auto
                          transition-colors duration-200"
                asChild
              >
                <Link href="/create" className="flex items-center justify-center">
                  Create your first comic <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link href="/examples" className="text-sm text-gray-600 hover:text-gray-900">
                View examples →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-20 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Intelligent Panel Generation</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Describe your scene in natural language. Our AI understands context, 
                character consistency, and visual storytelling principles.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Style Control</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Choose from manga, western comics, or realistic styles. Maintain consistent 
                aesthetics across your entire story.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Professional Output</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Export in print-ready quality. Perfect for webcomics, graphic novels, 
                storyboards, or social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 sm:py-20 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="py-4 sm:py-0">
              <div className="font-medium text-xl sm:text-2xl text-gray-900">50K+</div>
              <div className="text-sm sm:text-base text-gray-600 mt-1">Comics created</div>
            </div>
            <div className="py-4 sm:py-0">
              <div className="font-medium text-xl sm:text-2xl text-gray-900">10K+</div>
              <div className="text-sm sm:text-base text-gray-600 mt-1">Active creators</div>
            </div>
            <div className="py-4 sm:py-0">
              <div className="font-medium text-xl sm:text-2xl text-gray-900">1M+</div>
              <div className="text-sm sm:text-base text-gray-600 mt-1">Panels generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-20 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
              Start creating your comic
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md">
              No credit card required. Generate your first 50 panels free.
            </p>
            <Button 
              className="bg-black hover:bg-gray-900 text-white px-5 py-4 rounded w-full sm:w-auto
                        transition-colors duration-200"
              asChild
            >
              <Link href="/create" className="flex items-center justify-center">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
