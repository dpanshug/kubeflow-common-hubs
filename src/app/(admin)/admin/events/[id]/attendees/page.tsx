import { notFound } from "next/navigation";
import { getEventById, listEventAttendees } from "@/lib/admin/events";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event ? `Attendees: ${event.title}` : "Not Found" };
}

export default async function EventAttendeesPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const attendees = await listEventAttendees(id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Attendees</h1>
        <p className="text-sm text-text-muted mt-1">{event.title}</p>
      </div>

      {attendees.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          No attendees yet.
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  RSVP
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Checked In
                </th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {a.userName}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {a.userEmail}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        a.rsvpStatus === "going"
                          ? "success"
                          : a.rsvpStatus === "maybe"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {a.rsvpStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {a.checkedInAt
                      ? new Date(a.checkedInAt).toLocaleString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
