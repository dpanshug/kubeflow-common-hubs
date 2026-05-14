import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronRight, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/common/share-button";
import { NewsCard } from "@/components/news/news-card";
import { SITE_URL } from "@/lib/constants";
import { getNewsBySlug, getRelatedNews } from "@/lib/public/news";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) return { title: "Article Not Found" };

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      url: `${SITE_URL}/news/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedNews(slug);
  const readTime = estimateReadTime(post.content);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href="/news" className="hover:text-text-primary transition-colors">
              News
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li className="text-text-secondary truncate max-w-[250px] sm:max-w-none" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <header className="mb-8">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {post.authorName || "Community"}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          <span>{readTime} min read</span>
        </div>
      </header>

      <div className="relative rounded-xl overflow-hidden mb-10">
        <div className="h-48 md:h-72 bg-gradient-to-br from-bg-tertiary to-bg-secondary">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kf-blue)]/5 to-[var(--kf-teal)]/5" />
        </div>
      </div>

      <article className="mb-12">
        <div className="max-w-3xl mx-auto space-y-5 text-text-secondary text-base leading-relaxed">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-bg-secondary p-5">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-gradient-to-br from-[var(--kf-blue)] to-[var(--kf-teal)] flex items-center justify-center text-white font-bold text-sm">
              {(post.authorName || "C")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-sm">{post.authorName || "Community"}</p>
              <p className="text-xs text-text-muted">Kubeflow Community</p>
            </div>
          </div>
          <ShareButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" /> Back to News
        </Link>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-border pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">More Articles</h2>
            <Link href="/news" className="text-sm font-medium text-[var(--kf-blue)] hover:underline underline-offset-4">
              View all news
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((related) => (
              <NewsCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
