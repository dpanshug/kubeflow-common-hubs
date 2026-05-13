import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/admin/news";
import { NewsForm } from "../news-form";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getNewsById(id);
  return { title: post ? `Edit: ${post.title}` : "Post Not Found" };
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const post = await getNewsById(id);

  if (!post) notFound();

  const initial = {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || "",
    coverImageUrl: post.coverImageUrl || "",
    tags: post.tags ?? [],
    status: post.status as "draft" | "published" | "archived",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit News Post</h1>
        <p className="text-sm text-text-muted mt-1">{post.title}</p>
      </div>
      <NewsForm newsId={id} initialValues={initial} />
    </div>
  );
}
