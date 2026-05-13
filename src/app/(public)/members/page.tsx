import type { Metadata } from "next";
import { MembersClient } from "./members-client";

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
  return <MembersClient members={mockMembers} />;
}
