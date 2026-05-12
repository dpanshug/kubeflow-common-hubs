import {
  Trophy,
  Calendar,
  FileText,
  Star,
  GitPullRequest,
  AlertCircle,
  Eye,
  Newspaper,
  ArrowUp,
  UserCheck,
} from "lucide-react";

type ActivityType =
  | "profile_completed"
  | "event_attended"
  | "cfp_submitted"
  | "cfp_approved"
  | "badge_earned"
  | "level_up"
  | "pr_merged"
  | "issue_filed"
  | "review_done"
  | "news_published";

interface ActivityItem {
  id: string;
  actionType: ActivityType;
  description: string;
  createdAt: Date | string;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  profile_completed: <UserCheck className="size-3.5" />,
  event_attended: <Calendar className="size-3.5" />,
  cfp_submitted: <FileText className="size-3.5" />,
  cfp_approved: <Star className="size-3.5" />,
  badge_earned: <Trophy className="size-3.5" />,
  level_up: <ArrowUp className="size-3.5" />,
  pr_merged: <GitPullRequest className="size-3.5" />,
  issue_filed: <AlertCircle className="size-3.5" />,
  review_done: <Eye className="size-3.5" />,
  news_published: <Newspaper className="size-3.5" />,
};

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const date = new Date(activity.createdAt);
          return (
            <div key={activity.id} className="relative flex gap-3 pl-0">
              <div className="relative z-10 flex items-center justify-center size-8 rounded-full bg-bg-secondary border border-border text-text-muted shrink-0">
                {ACTIVITY_ICONS[activity.actionType] || <Star className="size-3.5" />}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-text-primary">{activity.description}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {date.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
