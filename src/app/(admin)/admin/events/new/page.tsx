import { EventForm } from "../event-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Create Event" };

export default function NewEventPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create Event</h1>
        <p className="text-sm text-text-muted mt-1">
          Fill in the details to create a new community event.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
