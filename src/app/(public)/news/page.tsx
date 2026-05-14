import type { Metadata } from "next";
import { NewsCard } from "@/components/news/news-card";
import { getPublicNews } from "@/lib/public/news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates from the Kubeflow community in India.",
};

export default async function NewsPage() {
  const posts = await getPublicNews();

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

      {posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No news articles yet.</p>
          <p className="text-sm">Check back soon for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} featured />
          ))}
        </div>
      )}
    </div>
  );
}
