import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MockNewsPost } from "@/app/(public)/news/mock-data";

export function NewsCard({ post }: { post: MockNewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group block rounded-xl border border-border bg-bg-secondary p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
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

      <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--kf-blue)] transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">By {post.author}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--kf-blue)] group-hover:gap-2 transition-all">
          Read more <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
