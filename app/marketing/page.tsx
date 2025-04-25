export default function MarketingHome() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[rgb(24,62,105)] sm:text-5xl md:text-6xl">
              Build Better, Track Smarter
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The all-in-one construction management platform designed for builders who want to streamline their projects, reduce costs, and deliver exceptional results.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)] md:py-4 md:text-lg md:px-10"
                >
                  Start Free Trial
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#demo"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[rgb(24,62,105)] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip - Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base font-semibold uppercase text-gray-500 tracking-wider">
            Trusted by industry leaders
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-6">
            {['Westfield Construction', 'Harbor Builders', 'Alpine Homes', 'Urban Development', 'Skyline Contractors', 'Premier Properties'].map((client) => (
              <div key={client} className="col-span-1 flex justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <div className="h-12 px-6 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                  <span className="font-medium text-[rgb(24,62,105)]">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Display */}
      <section className="py-16 bg-[rgb(24,62,105)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '85%', description: 'Increase in project visibility' },
              { value: '35%', description: 'Reduction in administrative work' },
              { value: '50%', description: 'Fewer schedule overruns' },
              { value: '28%', description: 'Lower material wastage' }
            ].map((stat, index) => (
              <div key={index} className="bg-[rgb(19,49,84)] rounded-lg shadow px-5 py-6 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="mt-1 text-sm text-gray-300">{stat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[rgb(24,62,105)] sm:text-4xl">
              Powerful Tools for Every Construction Need
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Streamline your workflows with our comprehensive suite of integrated tools
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Project Management',
                description: 'Track projects from planning to completion with intuitive Kanban, Gantt, and Calendar views.',
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
              },
              {
                title: 'Materials Management',
                description: 'Manage inventory, track usage, optimize procurement, and reduce waste with real-time tracking.',
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
              },
              {
                title: 'Document Management',
                description: 'Centralize all project documents, drawings, contracts, and specifications in one secure location.',
                icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
              },
              {
                title: 'Financial Management',
                description: 'Monitor budgets, track expenses, manage invoices, and generate financial reports with ease.',
                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Communication Hub',
                description: 'Keep teams connected with integrated messaging, notifications, and real-time updates.',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              },
              {
                title: 'Mobile Field Access',
                description: 'Access critical information and capture data from the field with our mobile-optimized platform.',
                icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
              }
            ].map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[rgb(24,62,105)] rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-[rgb(24,62,105)] tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[rgb(24,62,105)] sm:text-4xl">
              Trusted by Construction Professionals
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              See what our customers are saying about BuildTrack Pro
            </p>
          </div>

          <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-8 md:flex md:items-center">
              <div className="md:flex-shrink-0 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[rgb(24,62,105)] text-white flex items-center justify-center font-bold text-xl">
                  MJ
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8">
                <div className="text-xl font-medium text-gray-900">
                  "BuildTrack Pro has transformed the way we manage our construction projects. We've reduced administrative time by 40% and have far fewer scheduling conflicts."
                </div>
                <div className="mt-3">
                  <p className="text-base font-medium text-[rgb(24,62,105)]">
                    Michael Johnson
                  </p>
                  <p className="text-base text-gray-500">
                    Project Manager, Westfield Construction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[rgb(24,62,105)]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your construction business?</span>
            <span className="block text-[rgb(236,107,44)]">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)]"
              >
                Get started
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[rgb(24,62,105)] bg-white hover:bg-gray-50"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
