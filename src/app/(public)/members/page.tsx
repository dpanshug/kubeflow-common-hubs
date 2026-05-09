import type { Metadata } from "next";
import { Search, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Members",
  description: "Meet the members of the Kubeflow community in India.",
};

const mockMembers = [
  { name: "Rahul Sharma", username: "rahulsharma", title: "ML Engineer", company: "Google", level: 6, badges: 14, location: "Bangalore" },
  { name: "Priya Patel", username: "priyap", title: "Data Scientist", company: "Microsoft", level: 5, badges: 11, location: "Mumbai" },
  { name: "Amit Kumar", username: "amitkumar", title: "Platform Engineer", company: "Flipkart", level: 5, badges: 10, location: "Delhi NCR" },
  { name: "Sneha Reddy", username: "snehar", title: "MLOps Engineer", company: "Amazon", level: 5, badges: 9, location: "Hyderabad" },
  { name: "Vikram Singh", username: "vikrams", title: "SDE III", company: "Razorpay", level: 5, badges: 8, location: "Bangalore" },
  { name: "Deepika Nair", username: "deepikan", title: "Research Engineer", company: "IISc", level: 4, badges: 7, location: "Bangalore" },
  { name: "Arjun Mehta", username: "arjunm", title: "DevOps Lead", company: "Zomato", level: 4, badges: 6, location: "Delhi NCR" },
  { name: "Kavita Joshi", username: "kavitaj", title: "ML Researcher", company: "TCS Research", level: 4, badges: 5, location: "Pune" },
];

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Users className="size-8 text-[var(--kf-blue)]" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Members
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl">
          Meet the developers building the Kubeflow community in India.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search members..."
          aria-label="Search members"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)]/50 focus:border-transparent transition-all"
        />
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockMembers.map((member) => (
          <a
            key={member.username}
            href={`/members/${member.username}`}
            className="group flex flex-col items-center p-6 rounded-xl border border-border bg-bg-secondary text-center transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-lg hover:border-border-strong"
          >
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="size-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] flex items-center justify-center text-white font-bold text-lg">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              {/* Level ring */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-bg-primary border border-border text-[10px] font-medium text-text-muted">
                Lv.{member.level}
              </div>
            </div>

            <h3 className="font-semibold text-sm group-hover:text-[var(--kf-blue)] transition-colors">
              {member.name}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">{member.title}</p>
            <p className="text-xs text-text-muted">{member.company}</p>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border w-full justify-center">
              <span className="text-xs text-text-muted">
                <span className="font-medium text-text-secondary">{member.badges}</span> badges
              </span>
              <span className="text-xs text-text-muted">
                {member.location}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
