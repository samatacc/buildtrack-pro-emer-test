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
      <section className="text-center py-24 bg-white">
        <h1 className="text-[48px] font-bold mb-8 text-[rgb(24,62,105)]">
          Streamline Your Construction Projects with BuildTrack Pro
        </h1>
        <p className="text-xl text-[rgb(24,62,105)] max-w-3xl mx-auto px-6 leading-relaxed">
          The comprehensive construction management solution that helps you
          manage projects, teams, and resources all in one place.
        </p>
        <div className="mt-12 space-x-6">
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(220,90,30)] transition-colors font-medium"
          >
            Get Started
          </a>
          <a
            href="#learn-more"
            className="inline-block px-8 py-3 text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)] transition-colors font-medium"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="max-w-5xl mx-auto py-20 px-6" id="learn-more">
        <h2 className="text-3xl font-bold mb-16 text-[rgb(24,62,105)] text-center">
          Our Story
        </h2>
        <div className="space-y-12">
          {mockData.timeline.map((item) => (
            <div key={item.year} className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-[rgb(236,107,44)] font-bold text-xl">
                  {item.year}
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-8 flex-grow hover:shadow-xl transition-shadow">
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
      <section className="bg-[rgb(24,62,105)] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">🎯</span>
                <h3 className="text-2xl font-bold text-[rgb(24,62,105)]">
                  Our Mission
                </h3>
              </div>
              <p className="text-lg text-[rgb(24,62,105)] leading-relaxed">
                To empower construction professionals with innovative tools that
                streamline project management and enhance collaboration.
              </p>
            </div>
            <div className="bg-white p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">🔭</span>
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center text-[rgb(24,62,105)]">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {mockData.values.map((value) => (
              <div
                key={value.title}
                className="bg-white p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-16 h-16 mx-auto mb-8 text-4xl flex items-center justify-center">
                  {value.icon}
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
      <section className="py-20 bg-[rgb(24,62,105)]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center text-white">
            Our Leadership Team
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {mockData.team.map((member) => (
              <div
                key={member.name}
                className="text-center bg-white p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
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
