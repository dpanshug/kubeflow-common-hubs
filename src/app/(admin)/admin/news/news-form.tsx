"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewsSchema, type CreateNewsInput } from "@/lib/validations/news";
import { createNews, updateNews } from "@/lib/admin/news";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/admin-toast";
import { X, Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  newsId?: string;
  initialValues?: CreateNewsInput;
}

export function NewsForm({ newsId, initialValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateNewsInput>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: initialValues ?? {
      title: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      status: "draft",
    },
  });

  const contentValue = watch("content");

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function onSubmit(data: CreateNewsInput) {
    const payload = { ...data, tags };
    startTransition(async () => {
      const result = newsId
        ? await updateNews(newsId, payload)
        : await createNews(payload);

      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: newsId ? "Post updated" : "Post created" });
        router.push("/admin/news");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Title" error={errors.title?.message}>
        <input
          {...register("title")}
          className="form-input"
          placeholder="Kubeflow 2.0 Released"
        />
      </FormField>

      {newsId && (
        <FormField label="Slug" error={errors.slug?.message}>
          <input {...register("slug")} className="form-input" />
        </FormField>
      )}

      <FormField label="Excerpt" error={errors.excerpt?.message}>
        <textarea
          {...register("excerpt")}
          className="form-input min-h-[60px] resize-y"
          placeholder="Brief summary for cards..."
        />
      </FormField>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-text-primary">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            {previewMode ? (
              <><Edit3 className="size-3" /> Edit</>
            ) : (
              <><Eye className="size-3" /> Preview</>
            )}
          </button>
        </div>
        {previewMode ? (
          <div className="rounded-lg border border-border bg-bg-secondary p-4 prose prose-sm prose-invert max-w-none min-h-[200px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentValue || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            {...register("content")}
            className="form-input min-h-[300px] resize-y font-mono text-sm"
            placeholder="Write your article in Markdown..."
          />
        )}
        {errors.content?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Status" error={errors.status?.message}>
          <select {...register("status")} className="form-input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>

        <FormField label="Cover Image URL" error={errors.coverImageUrl?.message}>
          <input
            {...register("coverImageUrl")}
            className="form-input"
            placeholder="https://..."
          />
        </FormField>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="form-input flex-1"
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-1 text-xs text-text-secondary"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="hover:text-text-primary"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : newsId ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
