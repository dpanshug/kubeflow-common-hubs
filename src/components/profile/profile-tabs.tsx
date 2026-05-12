"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ProfileTabsProps {
  tabs: Tab[];
  children: Record<string, React.ReactNode>;
}

export function ProfileTabs({ tabs, children }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <div>
      <div className="border-b border-border mb-6" role="tablist" aria-label="Profile sections">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-text-primary border-[var(--kf-blue)]"
                  : "text-text-muted border-transparent hover:text-text-secondary hover:border-border-strong"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-bg-tertiary text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={tab.id}
          hidden={activeTab !== tab.id}
        >
          {activeTab === tab.id && children[tab.id]}
        </div>
      ))}
    </div>
  );
}
