"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/events";
import { createEvent, updateEvent } from "@/lib/admin/events";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/admin-toast";
import { INDIAN_CITIES } from "@/lib/constants";

interface Props {
  eventId?: string;
  initialValues?: CreateEventInput;
}

export function EventForm({ eventId, initialValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      shortDescription: "",
      location: "",
      city: "",
      eventDate: "",
      eventEndDate: "",
      type: "meetup",
      status: "draft",
      bannerUrl: "",
      rsvpUrl: "",
    },
  });

  function onSubmit(data: CreateEventInput) {
    const cleaned = {
      ...data,
      maxAttendees: Number.isNaN(data.maxAttendees) ? undefined : data.maxAttendees,
    };
    startTransition(async () => {
      const result = eventId
        ? await updateEvent(eventId, cleaned)
        : await createEvent(cleaned);

      if ("error" in result && typeof result.error === "string") {
        toast({ title: result.error, variant: "error" });
      } else {
        toast({ title: eventId ? "Event updated" : "Event created" });
        router.push("/admin/events");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Title" error={errors.title?.message}>
        <input
          {...register("title")}
          className="form-input"
          placeholder="KubeflowCon India 2026"
        />
      </FormField>

      {eventId && (
        <FormField label="Slug" error={errors.slug?.message}>
          <input {...register("slug")} className="form-input" />
        </FormField>
      )}

      <FormField label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          className="form-input min-h-[120px] resize-y"
          placeholder="Event description..."
        />
      </FormField>

      <FormField label="Short Description" error={errors.shortDescription?.message}>
        <input
          {...register("shortDescription")}
          className="form-input"
          placeholder="Brief one-liner"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Type" error={errors.type?.message}>
          <select {...register("type")} className="form-input">
            <option value="meetup">Meetup</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
            <option value="webinar">Webinar</option>
          </select>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <select {...register("status")} className="form-input">
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start Date & Time" error={errors.eventDate?.message}>
          <input
            {...register("eventDate")}
            type="datetime-local"
            className="form-input"
          />
        </FormField>

        <FormField label="End Date & Time" error={errors.eventEndDate?.message}>
          <input
            {...register("eventEndDate")}
            type="datetime-local"
            className="form-input"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Location" error={errors.location?.message}>
          <input
            {...register("location")}
            className="form-input"
            placeholder="Venue name & address"
          />
        </FormField>

        <FormField label="City" error={errors.city?.message}>
          <select {...register("city")} className="form-input">
            <option value="">Select city</option>
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="RSVP URL" error={errors.rsvpUrl?.message}>
          <input
            {...register("rsvpUrl")}
            className="form-input"
            placeholder="https://..."
          />
        </FormField>

        <FormField label="Max Attendees" error={errors.maxAttendees?.message}>
          <input
            {...register("maxAttendees", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
            type="number"
            className="form-input"
            placeholder="Leave empty for unlimited"
          />
        </FormField>
      </div>

      <FormField label="Banner Image URL" error={errors.bannerUrl?.message}>
        <input
          {...register("bannerUrl")}
          className="form-input"
          placeholder="https://..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : eventId
              ? "Update Event"
              : "Create Event"}
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
