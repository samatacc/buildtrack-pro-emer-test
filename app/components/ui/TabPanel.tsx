"use client";

import { ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: {
    title: string;
    description: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

interface TabPanelProps extends ComponentProps<"div"> {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
}

export function TabPanel({
  tabs,
  defaultTabId = tabs[0]?.id,
  className = "",
  ...props
}: TabPanelProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId);

  return (
    <div className={twMerge("w-full", className)} {...props}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={twMerge(
              "px-6 py-3 text-base font-medium transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-offset-2",
              "hover:text-[rgb(24,62,105)]",
              activeTabId === tab.id
                ? "text-[rgb(24,62,105)] border-b-2 border-[rgb(24,62,105)] -mb-px"
                : "text-gray-600",
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={twMerge(
              "transition-all duration-300",
              activeTabId === tab.id
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute pointer-events-none",
            )}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
                {tab.content.title}
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {tab.content.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tab.content.features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {feature.icon && (
                      <span className="text-[rgb(236,107,44)] text-2xl mb-4">
                        {feature.icon}
                      </span>
                    )}
                    <h4 className="text-lg font-semibold text-[rgb(24,62,105)] mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
