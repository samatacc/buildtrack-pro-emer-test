'use client';

import { MockImage } from './components/ui/MockImage';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-5xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-bold text-[rgb(24,62,105)]">
            BuildTrack Pro
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-600 mt-4">
            Construction management made simple with AI-generated visualization
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-6">Project Features</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="relative h-40 w-full mb-4 overflow-hidden rounded-lg">
                <MockImage 
                  category="project" 
                  variant="blueprint" 
                  width={400} 
                  height={200}
                  alt="Multi-tenant Architecture" 
                  className="object-cover w-full"
                  showControls={true}
                />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">
                Multi-tenant Architecture
              </h3>
              <p className="text-gray-600 mt-2">
                Organization-based data isolation with Row Level Security
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="relative h-40 w-full mb-4 overflow-hidden rounded-lg">
                <MockImage 
                  category="material" 
                  variant="tools" 
                  width={400} 
                  height={200}
                  alt="Mobile-First Design" 
                  className="object-cover w-full"
                  showControls={true}
                />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">
                Mobile-First Design
              </h3>
              <p className="text-gray-600 mt-2">
                Device-specific layouts for mobile, tablet, and desktop
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="relative h-40 w-full mb-4 overflow-hidden rounded-lg">
                <MockImage 
                  category="project" 
                  variant="commercial" 
                  width={400} 
                  height={200}
                  alt="Customizable Dashboards" 
                  className="object-cover w-full"
                  showControls={true}
                />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">
                Customizable Dashboards
              </h3>
              <p className="text-gray-600 mt-2">
                Flexible widget system with role-based defaults
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="relative h-40 w-full mb-4 overflow-hidden rounded-lg">
                <MockImage 
                  category="report" 
                  variant="financial" 
                  width={400} 
                  height={200}
                  alt="Advanced Analytics" 
                  className="object-cover w-full"
                  showControls={true}
                />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 mt-2">
                Comprehensive reporting system with KPIs
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-6">
          <a
            href="https://github.com/Azend-studio/buildtrack-pro"
            className="inline-block px-6 py-3 bg-[rgb(236,107,44)] text-white font-medium rounded-lg hover:opacity-90 transition-all"
          >
            View Repository
          </a>
        </div>
      </div>
    </main>
  );
}
