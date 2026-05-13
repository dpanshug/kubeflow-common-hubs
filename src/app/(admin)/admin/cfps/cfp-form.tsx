"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCfpSchema, type CreateCfpInput } from "@/lib/validations/cfp-admin";
import { createCfp, updateCfp } from "@/lib/admin/cfps";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/admin-toast";
import { X } from "lucide-react";

interface Props {
  cfpId?: string;
  initialValues?: CreateCfpInput;
  events?: { id: string; title: string }[];
}

export function CfpForm({ cfpId, initialValues, events = [] }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [topics, setTopics] = useState<string[]>(initialValues?.topics ?? []);
  const [topicInput, setTopicInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCfpInput>({
    resolver: zodResolver(createCfpSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      guidelines: "",
      deadline: "",
      status: "draft",
      eventId: "",
    },
  });

  function addTopic() {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
    }
    setTopicInput("");
  }

  function removeTopic(t: string) {
    setTopics(topics.filter((x) => x !== t));
  }

  function onSubmit(data: CreateCfpInput) {
    const payload = { ...data, topics, eventId: data.eventId || "" };
    startTransition(async () => {
      const result = cfpId
        ? await updateCfp(cfpId, payload)
        : await createCfp(payload);

      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: cfpId ? "CFP updated" : "CFP created" });
        router.push("/admin/cfps");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Title" error={errors.title?.message}>
        <input
          {...register("title")}
          className="form-input"
          placeholder="CFP for KubeflowCon 2026"
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          className="form-input min-h-[120px] resize-y"
          placeholder="What is this CFP about?"
        />
      </FormField>

      <FormField label="Guidelines" error={errors.guidelines?.message}>
        <textarea
          {...register("guidelines")}
          className="form-input min-h-[80px] resize-y"
          placeholder="Submission guidelines..."
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Deadline" error={errors.deadline?.message}>
          <input
            {...register("deadline")}
            type="datetime-local"
            className="form-input"
          />
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <select {...register("status")} className="form-input">
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="reviewing">Reviewing</option>
            <option value="finalized">Finalized</option>
          </select>
        </FormField>
      </div>

      <FormField label="Linked Event" error={errors.eventId?.message}>
        <select {...register("eventId")} className="form-input">
          <option value="">None</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </FormField>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Topics
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="form-input flex-1"
            placeholder="Add a topic"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTopic();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTopic}>
            Add
          </Button>
        </div>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-1 text-xs text-text-secondary"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTopic(t)}
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
          onClick={() => router.push("/admin/cfps")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : cfpId ? "Update CFP" : "Create CFP"}
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
