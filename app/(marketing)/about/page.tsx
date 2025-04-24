import { type ReactNode } from "react";

const mockData = {
  timeline: [
    {
      year: "2023",
      title: "Company Founded",
      description:
        "BuildTrack Pro was established to revolutionize construction management.",
    },
    {
      year: "2024",
      title: "Major Platform Launch",
      description: "Released our comprehensive project management suite.",
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanded operations to serve clients worldwide.",
    },
  ],
  values: [
    {
      title: "Innovation",
      description:
        "Continuously pushing boundaries to deliver cutting-edge solutions.",
      icon: "🚀",
    },
    {
      title: "Quality",
      description: "Maintaining the highest standards in everything we do.",
      icon: "⭐",
    },
    {
      title: "Collaboration",
      description: "Working together to achieve exceptional results.",
      icon: "🤝",
    },
  ],
  team: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former construction executive with 15 years of industry experience.",
      image: "/placeholder.jpg",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech innovator with a background in construction software.",
      image: "/placeholder.jpg",
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Product",
      bio: "Product strategist focused on user-centric solutions.",
      image: "/placeholder.jpg",
    },
  ],
};

export default function AboutPage(): ReactNode {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 animate-fade-in">
        <h1 className="text-5xl font-bold text-[rgb(24,62,105)] text-center mb-6 animate-fade-in">
          About BuildTrack Pro
        </h1>
        <p className="text-xl text-[rgb(24,62,105)] text-center max-w-3xl mx-auto mb-12 animate-fade-in animation-delay-200">
          Revolutionizing construction management with innovative technology
          solutions.
        </p>
        <div className="mt-12 space-x-6">
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(24,62,105)] transition-colors font-medium animate-fade-in animation-delay-400"
          >
            Get Started
          </a>
          <a
            href="#learn-more"
            className="inline-block px-8 py-3 text-[rgb(24,62,105)] hover:bg-[rgb(24,62,105)] transition-colors font-medium animate-fade-in animation-delay-600"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="max-w-5xl mx-auto py-20 px-6" id="learn-more">
        <h2 className="text-3xl font-bold mb-16 text-[rgb(24,62,105)] text-center animate-fade-in">
          Our Story
        </h2>
        <div className="space-y-12">
          {mockData.timeline.map((item, index) => (
            <div
              key={item.year}
              className="flex items-center gap-8 animate-slide-in-right animation-delay-[calc(200ms*${index})]"
              style={{ "--index": index } as React.CSSProperties}
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-[rgb(24,62,105)] shadow-lg flex items-center justify-center text-white font-bold text-xl">
                  {item.year}
                </div>
              </div>
              <div
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-8 flex-grow hover:shadow-xl transition-shadow border border-white/20 animate-fade-in animation-delay-[calc(200ms*${index})]"
                style={{ "--index": index } as React.CSSProperties}
              >
                <h3 className="text-xl font-bold text-[rgb(236,107,44)] mb-3">
                  {item.title}
                </h3>
                <p className="text-[rgb(24,62,105)] text-lg">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 animate-fade-in">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 animate-fade-in animation-delay-200">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[rgb(24,62,105)] w-8 h-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className="text-[rgb(24,62,105)]"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="6"
                      className="text-[rgb(236,107,44)]"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="2"
                      className="text-[rgb(236,107,44)]"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <h3 className="text-2xl font-bold text-[rgb(24,62,105)]">
                  Our Mission
                </h3>
              </div>
              <p className="text-lg text-[rgb(24,62,105)] leading-relaxed">
                To empower construction professionals with innovative tools that
                streamline project management and enhance collaboration.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 animate-fade-in animation-delay-400">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[rgb(24,62,105)] w-8 h-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      className="text-[rgb(24,62,105)]"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      className="text-[rgb(236,107,44)]"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <h3 className="text-2xl font-bold text-[rgb(24,62,105)]">
                  Our Vision
                </h3>
              </div>
              <p className="text-lg text-[rgb(24,62,105)] leading-relaxed">
                To be the leading platform for digital transformation in the
                construction industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white animate-fade-in">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center text-[rgb(24,62,105)]">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {mockData.values.map((value, index) => (
              <div
                key={value.title}
                className="bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 animate-fade-in animation-delay-[calc(200ms*${index})]"
                style={{ "--index": index } as React.CSSProperties}
              >
                <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                  {value.title === "Innovation" ? (
                    <svg
                      className="w-12 h-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                        className="text-[rgb(24,62,105)]"
                      />
                      <polyline
                        points="22 4 12 14.01 9 11.01"
                        className="text-[rgb(236,107,44)]"
                        fill="none"
                      />
                    </svg>
                  ) : value.title === "Quality" ? (
                    <svg
                      className="w-12 h-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        className="text-[rgb(236,107,44)]"
                        fill="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        className="text-[rgb(24,62,105)]"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        className="text-[rgb(24,62,105)]"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        className="text-[rgb(236,107,44)]"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        className="text-[rgb(236,107,44)]"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-[rgb(24,62,105)]">
                  {value.title}
                </h3>
                <p className="text-[rgb(24,62,105)] text-lg text-center leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center text-[rgb(24,62,105)]">
            Our Leadership Team
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {mockData.team.map((member, index) => (
              <div
                key={member.name}
                className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 animate-fade-in-up animation-delay-[calc(200ms*${index})]"
                style={{ "--index": index } as React.CSSProperties}
              >
                <div className="w-32 h-32 mx-auto mb-8">
                  <div className="w-full h-full rounded-full bg-[rgb(236,107,44)] bg-opacity-10 shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-[rgb(236,107,44)]">
                      {member.name[0]}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[rgb(24,62,105)]">
                  {member.name}
                </h3>
                <p className="text-[rgb(236,107,44)] text-lg mb-4 font-medium">
                  {member.role}
                </p>
                <p className="text-[rgb(24,62,105)] text-lg leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
