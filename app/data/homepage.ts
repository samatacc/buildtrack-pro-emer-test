export const clientLogos = [
  {
    name: "ABC Construction",
    src: "/logos/client1.png",
    width: 120,
    height: 40,
  },
  {
    name: "BuildMaster Inc",
    src: "/logos/client2.png",
    width: 120,
    height: 40,
  },
  {
    name: "Construction Elite",
    src: "/logos/client3.png",
    width: 120,
    height: 40,
  },
  {
    name: "Global Builders",
    src: "/logos/client4.png",
    width: 120,
    height: 40,
  },
  {
    name: "Modern Construction Co",
    src: "/logos/client5.png",
    width: 120,
    height: 40,
  },
];

export const testimonials = [
  {
    quote:
      "BuildTrack Pro has transformed how we manage our construction projects. The efficiency gains are remarkable, and our team loves using it.",
    author: "Sarah Johnson",
    role: "Project Manager",
    company: "ABC Construction",
    avatarUrl: "/avatars/sarah.jpg",
  },
  {
    quote:
      "The ROI was immediate. We've cut project management time by 30% and improved our client communication significantly.",
    author: "Michael Chen",
    role: "Operations Director",
    company: "BuildMaster Inc",
    avatarUrl: "/avatars/michael.jpg",
  },
  {
    quote:
      "Finally, a construction management platform that understands the real needs of the industry. The mobile features are a game-changer.",
    author: "David Rodriguez",
    role: "Site Supervisor",
    company: "Construction Elite",
    avatarUrl: "/avatars/david.jpg",
  },
];

export const metrics = [
  {
    label: "Projects Managed",
    value: 25000,
    suffix: "+",
  },
  {
    label: "Hours Saved Monthly",
    value: 100000,
    suffix: "hrs",
  },
  {
    label: "Active Users",
    value: 10000,
    suffix: "+",
  },
  {
    label: "Client Satisfaction",
    value: 98,
    suffix: "%",
  },
];

export const trustBadges = [
  {
    name: "ISO 9001:2015",
    src: "/badges/iso.png",
    width: 80,
    height: 80,
    tooltip: "ISO 9001:2015 Certified Quality Management",
  },
  {
    name: "GDPR Compliant",
    src: "/badges/gdpr.png",
    width: 80,
    height: 80,
    tooltip: "Fully GDPR Compliant",
  },
  {
    name: "SOC 2",
    src: "/badges/soc2.png",
    width: 80,
    height: 80,
    tooltip: "SOC 2 Type II Certified",
  },
  {
    name: "Cloud Security",
    src: "/badges/security.png",
    width: 80,
    height: 80,
    tooltip: "Enterprise-Grade Security",
  },
];

export const featureTabs = [
  {
    id: "planning",
    label: "Planning",
    icon: "📋",
    content: {
      title: "Project Planning & Scheduling",
      description:
        "Streamline your project planning with powerful tools designed specifically for construction.",
      features: [
        {
          title: "Timeline Planning",
          description:
            "Create and manage project timelines with interactive Gantt charts.",
          icon: "📅",
        },
        {
          title: "Resource Management",
          description: "Optimize resource allocation across multiple projects.",
          icon: "👥",
        },
        {
          title: "Budget Tracking",
          description: "Real-time budget monitoring and cost control.",
          icon: "💰",
        },
      ],
    },
  },
  {
    id: "execution",
    label: "Execution",
    icon: "🏗️",
    content: {
      title: "Project Execution & Monitoring",
      description:
        "Keep your projects on track with real-time monitoring and control tools.",
      features: [
        {
          title: "Task Management",
          description: "Assign and track tasks with real-time updates.",
          icon: "✅",
        },
        {
          title: "Quality Control",
          description: "Built-in quality checklists and inspection tools.",
          icon: "🎯",
        },
        {
          title: "Progress Tracking",
          description: "Visual progress tracking with photo documentation.",
          icon: "📸",
        },
      ],
    },
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: "🤝",
    content: {
      title: "Team Collaboration & Communication",
      description: "Keep everyone aligned with integrated communication tools.",
      features: [
        {
          title: "Document Sharing",
          description: "Centralized document management and version control.",
          icon: "📑",
        },
        {
          title: "Team Chat",
          description:
            "Built-in messaging and @mentions for quick communication.",
          icon: "💬",
        },
        {
          title: "Mobile Access",
          description: "Full-featured mobile app for on-site updates.",
          icon: "📱",
        },
      ],
    },
  },
];

export const demoHotspots = [
  {
    id: "dashboard",
    x: 25,
    y: 30,
    title: "Interactive Dashboard",
    description:
      "Get a real-time overview of all your projects, tasks, and team performance.",
  },
  {
    id: "gantt",
    x: 75,
    y: 30,
    title: "Interactive Gantt Chart",
    description: "Drag-and-drop timeline management with dependency tracking.",
  },
  {
    id: "reports",
    x: 50,
    y: 70,
    title: "Visual Reports",
    description: "Generate custom reports with interactive charts and filters.",
  },
];
