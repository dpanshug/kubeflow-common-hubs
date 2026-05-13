import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockPosts } from "./mock-data";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates from the Kubeflow community in India.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          News & Updates
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Stay up to date with the latest from the Kubeflow community in India.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockPosts.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="group block rounded-xl border border-border bg-bg-secondary p-6 md:p-8 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-[var(--kf-blue)] transition-colors">
              {post.title}
            </h2>
            <p className="text-text-secondary mb-4">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">By {post.author}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--kf-blue)] group-hover:gap-2 transition-all">
                Read more <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
