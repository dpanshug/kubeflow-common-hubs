import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    slug: z
      .string()
      .min(3)
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
      .optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    shortDescription: z.string().max(300).optional(),
    location: z.string().max(200).optional(),
    city: z.string().optional(),
    eventDate: z.string().min(1, "Event date is required"),
    eventEndDate: z.string().optional(),
    type: z.enum(["meetup", "conference", "workshop", "hackathon", "webinar"]),
    status: z.enum(["draft", "upcoming", "live", "completed", "cancelled"]),
    bannerUrl: z.string().url().optional().or(z.literal("")),
    rsvpUrl: z.string().url().optional().or(z.literal("")),
    maxAttendees: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.eventEndDate && data.eventDate) {
        return new Date(data.eventEndDate) > new Date(data.eventDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["eventEndDate"] }
  );

export const updateEventSchema = createEventSchema;

export type CreateEventInput = z.infer<typeof createEventSchema>;
