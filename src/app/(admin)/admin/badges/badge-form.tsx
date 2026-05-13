"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBadgeSchema, type CreateBadgeInput } from "@/lib/validations/badges";
import { createBadge, updateBadge } from "@/lib/admin/badges";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/admin-toast";

interface Props {
  badgeId?: string;
  initialValues?: CreateBadgeInput;
}

export function BadgeForm({ badgeId, initialValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBadgeInput>({
    resolver: zodResolver(createBadgeSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      imageUrl: "",
      criteriaDescription: "",
      category: "community",
      tier: "bronze",
      isAuto: false,
      pointsValue: 10,
    },
  });

  function onSubmit(data: CreateBadgeInput) {
    startTransition(async () => {
      const result = badgeId
        ? await updateBadge(badgeId, data)
        : await createBadge(data);

      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: badgeId ? "Badge updated" : "Badge created" });
        router.push("/admin/badges");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} className="form-input" placeholder="First Contribution" />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          className="form-input min-h-[80px] resize-y"
          placeholder="Awarded when..."
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Category" error={errors.category?.message}>
          <select {...register("category")} className="form-input">
            <option value="contribution">Contribution</option>
            <option value="community">Community</option>
            <option value="engagement">Engagement</option>
            <option value="special">Special</option>
          </select>
        </FormField>

        <FormField label="Tier" error={errors.tier?.message}>
          <select {...register("tier")} className="form-input">
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Points Value" error={errors.pointsValue?.message}>
          <input
            {...register("pointsValue", { valueAsNumber: true })}
            type="number"
            className="form-input"
          />
        </FormField>

        <FormField label="Image URL" error={errors.imageUrl?.message}>
          <input
            {...register("imageUrl")}
            className="form-input"
            placeholder="https://..."
          />
        </FormField>
      </div>

      <FormField label="Criteria Description" error={errors.criteriaDescription?.message}>
        <textarea
          {...register("criteriaDescription")}
          className="form-input min-h-[60px] resize-y"
          placeholder="How to earn this badge..."
        />
      </FormField>

      <div className="flex items-center gap-3">
        <input
          {...register("isAuto")}
          type="checkbox"
          id="isAuto"
          className="size-4 rounded border-border"
        />
        <label htmlFor="isAuto" className="text-sm text-text-primary">
          Auto-award (badge engine will award this automatically based on rules)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/badges")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : badgeId ? "Update Badge" : "Create Badge"}
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
