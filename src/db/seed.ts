import { db } from "./index";
import {
  users,
  profiles,
  events,
  badges,
  userBadges,
  newsPosts,
  cfps,
  activityLog,
} from "./schema";

const SEED_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", email: "rahul@example.com", name: "Rahul Sharma" },
  { id: "00000000-0000-0000-0000-000000000002", email: "priya@example.com", name: "Priya Patel" },
  { id: "00000000-0000-0000-0000-000000000003", email: "amit@example.com", name: "Amit Kumar" },
  { id: "00000000-0000-0000-0000-000000000004", email: "sneha@example.com", name: "Sneha Reddy" },
  { id: "00000000-0000-0000-0000-000000000005", email: "vikram@example.com", name: "Vikram Singh" },
  { id: "00000000-0000-0000-0000-000000000006", email: "deepika@example.com", name: "Deepika Nair" },
  { id: "00000000-0000-0000-0000-000000000007", email: "arjun@example.com", name: "Arjun Mehta" },
  { id: "00000000-0000-0000-0000-000000000008", email: "kavita@example.com", name: "Kavita Joshi" },
  { id: "00000000-0000-0000-0000-000000000009", email: "rohan@example.com", name: "Rohan Gupta" },
  { id: "00000000-0000-0000-0000-000000000010", email: "ananya@example.com", name: "Ananya Iyer" },
];

const SEED_PROFILES = [
  { userId: SEED_USERS[0].id, displayName: "Rahul Sharma", title: "ML Engineer", company: "Google", location: "Bangalore", githubUsername: "rahulsharma", points: 2800, level: 6, onboardingCompleted: true, bio: "Passionate about ML pipelines and model serving at scale.", skills: ["Python", "Kubernetes", "TensorFlow"], interests: ["ML Pipelines", "Model Serving"] },
  { userId: SEED_USERS[1].id, displayName: "Priya Patel", title: "Data Scientist", company: "Microsoft", location: "Mumbai", githubUsername: "priyap", points: 1200, level: 5, onboardingCompleted: true, bio: "Working on AutoML and responsible AI.", skills: ["PyTorch", "Kubeflow", "MLOps"], interests: ["AutoML", "Platform Engineering"] },
  { userId: SEED_USERS[2].id, displayName: "Amit Kumar", title: "Platform Engineer", company: "Flipkart", location: "Delhi NCR", githubUsername: "amitkumar", points: 1050, level: 5, onboardingCompleted: true, skills: ["Go", "Kubernetes", "Terraform"], interests: ["Platform Engineering", "CI/CD for ML"] },
  { userId: SEED_USERS[3].id, displayName: "Sneha Reddy", title: "MLOps Engineer", company: "Amazon", location: "Hyderabad", githubUsername: "snehar", points: 900, level: 5, onboardingCompleted: true, skills: ["AWS", "SageMaker", "Kubeflow"], interests: ["ML Pipelines", "Training Operators"] },
  { userId: SEED_USERS[4].id, displayName: "Vikram Singh", title: "SDE III", company: "Razorpay", location: "Bangalore", githubUsername: "vikrams", points: 700, level: 5, onboardingCompleted: true, skills: ["Java", "Kubernetes", "gRPC"], interests: ["Model Serving", "Security"] },
  { userId: SEED_USERS[5].id, displayName: "Deepika Nair", title: "Research Engineer", company: "IISc", location: "Bangalore", githubUsername: "deepikan", points: 500, level: 4, onboardingCompleted: true, skills: ["Python", "JAX", "Research"], interests: ["Notebooks", "AutoML"] },
  { userId: SEED_USERS[6].id, displayName: "Arjun Mehta", title: "DevOps Lead", company: "Zomato", location: "Delhi NCR", githubUsername: "arjunm", points: 420, level: 4, onboardingCompleted: true, skills: ["Docker", "ArgoCD", "Helm"], interests: ["CI/CD for ML", "Platform Engineering"] },
  { userId: SEED_USERS[7].id, displayName: "Kavita Joshi", title: "ML Researcher", company: "TCS Research", location: "Pune", githubUsername: "kavitaj", points: 300, level: 4, onboardingCompleted: true, skills: ["Python", "NLP", "Transformers"], interests: ["Training Operators", "Documentation"] },
  { userId: SEED_USERS[8].id, displayName: "Rohan Gupta", title: "Backend Engineer", company: "Swiggy", location: "Bangalore", githubUsername: "rohang", points: 150, level: 3, onboardingCompleted: true, skills: ["Go", "PostgreSQL", "Redis"], interests: ["Platform Engineering", "Security"] },
  { userId: SEED_USERS[9].id, displayName: "Ananya Iyer", title: "Data Engineer", company: "PhonePe", location: "Bangalore", githubUsername: "ananyai", points: 80, level: 2, onboardingCompleted: true, skills: ["Spark", "Airflow", "dbt"], interests: ["ML Pipelines", "Community Events"] },
];

const SEED_EVENTS = [
  { title: "KCD Bangalore 2026", slug: "kcd-bangalore-2026", description: "Kubernetes Community Day in Bangalore featuring talks on Kubeflow and MLOps.", shortDescription: "India's premier cloud-native conference", location: "NIMHANS Convention Centre", city: "Bangalore", eventDate: new Date("2026-07-15T09:00:00+05:30"), type: "conference" as const, status: "upcoming" as const, maxAttendees: 500 },
  { title: "Kubeflow Meetup Mumbai", slug: "kubeflow-meetup-mumbai-jun-2026", description: "Monthly meetup for Kubeflow users in Mumbai. Lightning talks and networking.", shortDescription: "Monthly Mumbai meetup", location: "WeWork BKC", city: "Mumbai", eventDate: new Date("2026-06-20T18:00:00+05:30"), type: "meetup" as const, status: "upcoming" as const, maxAttendees: 80 },
  { title: "MLOps Workshop Delhi", slug: "mlops-workshop-delhi-2026", description: "Hands-on workshop covering Kubeflow Pipelines and model serving with KServe.", shortDescription: "Hands-on MLOps workshop", location: "91springboard", city: "Delhi NCR", eventDate: new Date("2026-06-05T10:00:00+05:30"), type: "workshop" as const, status: "upcoming" as const, maxAttendees: 40 },
  { title: "Model Serving Webinar", slug: "model-serving-webinar-may-2026", description: "Deep dive into KServe and model serving patterns for production ML.", shortDescription: "KServe deep dive", location: "Virtual", city: "Virtual", eventDate: new Date("2026-05-28T19:00:00+05:30"), type: "webinar" as const, status: "upcoming" as const },
  { title: "Kubeflow Hackathon Bangalore", slug: "kubeflow-hackathon-blr-2026", description: "24-hour hackathon to build ML tools on top of Kubeflow platform.", shortDescription: "Build on Kubeflow", location: "Microsoft Reactor", city: "Bangalore", eventDate: new Date("2026-04-10T09:00:00+05:30"), eventEndDate: new Date("2026-04-11T09:00:00+05:30"), type: "hackathon" as const, status: "completed" as const, maxAttendees: 100 },
];

const SEED_BADGES = [
  { name: "First Contribution", description: "Merged your first PR to a Kubeflow repo", category: "contribution" as const, tier: "bronze" as const, pointsValue: 10, isAuto: true, isActive: true },
  { name: "Bug Hunter", description: "Filed 5 issues that were resolved", category: "contribution" as const, tier: "silver" as const, pointsValue: 25, isAuto: true, isActive: true },
  { name: "Code Reviewer", description: "Completed 10 code reviews on Kubeflow PRs", category: "contribution" as const, tier: "silver" as const, pointsValue: 25, isAuto: true, isActive: true },
  { name: "Pipeline Master", description: "Contributed to kubeflow/pipelines with 5+ merged PRs", category: "contribution" as const, tier: "gold" as const, pointsValue: 50, isAuto: true, isActive: true },
  { name: "Community Star", description: "Attended 5+ community events", category: "community" as const, tier: "bronze" as const, pointsValue: 10, isAuto: true, isActive: true },
  { name: "Speaker", description: "Delivered a talk at a Kubeflow event", category: "community" as const, tier: "gold" as const, pointsValue: 50, isAuto: false, isActive: true },
  { name: "Streak Master", description: "Contributed for 30 consecutive days", category: "engagement" as const, tier: "silver" as const, pointsValue: 25, isAuto: true, isActive: true },
  { name: "Founding Member", description: "Joined during the platform launch", category: "special" as const, tier: "platinum" as const, pointsValue: 100, isAuto: false, isActive: true },
];

const SEED_NEWS = [
  { title: "Kubeflow 2.0 Released with Enhanced Pipeline Support", slug: "kubeflow-2-released", content: "The Kubeflow community is thrilled to announce the release of Kubeflow 2.0...", excerpt: "Major release with pipeline improvements and better model serving.", tags: ["release", "pipelines"], status: "published" as const, publishedAt: new Date("2026-05-01") },
  { title: "KCD Bangalore 2026 CFP Now Open", slug: "kcd-bangalore-cfp-open", content: "We're excited to announce that the Call for Proposals for KCD Bangalore 2026 is now open...", excerpt: "Submit your talks for India's biggest cloud-native conference.", tags: ["events", "cfp"], status: "published" as const, publishedAt: new Date("2026-04-15") },
  { title: "Community Spotlight: Building ML Pipelines at Scale", slug: "community-spotlight-ml-pipelines", content: "In this spotlight, we feature how Flipkart's platform team uses Kubeflow Pipelines...", excerpt: "How Flipkart scaled their ML with Kubeflow.", tags: ["spotlight", "pipelines"], status: "published" as const, publishedAt: new Date("2026-03-20") },
];

const SEED_CFPS = [
  { title: "KCD Bangalore 2026 CFP", description: "Submit your talk proposals for KCD Bangalore 2026. We welcome talks on Kubeflow, MLOps, and cloud-native ML.", deadline: new Date("2026-06-30T23:59:59+05:30"), topics: ["Kubeflow", "MLOps", "KServe", "Pipelines", "Training Operators"], acceptedFormats: ["talk_30", "talk_45", "lightning_10", "workshop"], status: "open" as const },
  { title: "Model Serving Series - Guest Speakers", description: "We're looking for guest speakers for our webinar series on model serving patterns.", deadline: new Date("2026-06-15T23:59:59+05:30"), topics: ["KServe", "Model Serving", "Inference"], acceptedFormats: ["talk_30", "talk_45"], status: "open" as const },
  { title: "Community Blog Contributors", description: "Write for the Kubeflow Community Blog. Share your experiences, tutorials, or case studies.", deadline: new Date("2026-12-31T23:59:59+05:30"), topics: ["Tutorials", "Case Studies", "Best Practices"], acceptedFormats: ["talk_30"], status: "open" as const },
];

async function seed() {
  console.log("Seeding database...");

  // Users
  for (const user of SEED_USERS) {
    await db.insert(users).values(user).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_USERS.length} users`);

  // Profiles
  for (const profile of SEED_PROFILES) {
    await db.insert(profiles).values(profile).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_PROFILES.length} profiles`);

  // Events
  for (const event of SEED_EVENTS) {
    await db.insert(events).values(event).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_EVENTS.length} events`);

  // Badges
  for (const badge of SEED_BADGES) {
    await db.insert(badges).values(badge).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_BADGES.length} badges`);

  // Award some badges to users
  const allBadges = await db.select().from(badges);
  if (allBadges.length > 0) {
    const awards = [
      { userId: SEED_USERS[0].id, badgeId: allBadges[0].id },
      { userId: SEED_USERS[0].id, badgeId: allBadges[3].id },
      { userId: SEED_USERS[0].id, badgeId: allBadges[5].id },
      { userId: SEED_USERS[0].id, badgeId: allBadges[7].id },
      { userId: SEED_USERS[1].id, badgeId: allBadges[0].id },
      { userId: SEED_USERS[1].id, badgeId: allBadges[4].id },
      { userId: SEED_USERS[2].id, badgeId: allBadges[0].id },
      { userId: SEED_USERS[2].id, badgeId: allBadges[2].id },
    ];
    for (const award of awards) {
      await db.insert(userBadges).values(award).onConflictDoNothing();
    }
    console.log(`  ✓ ${awards.length} badge awards`);
  }

  // News
  for (const post of SEED_NEWS) {
    await db.insert(newsPosts).values(post).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_NEWS.length} news posts`);

  // CFPs
  for (const cfp of SEED_CFPS) {
    await db.insert(cfps).values(cfp).onConflictDoNothing();
  }
  console.log(`  ✓ ${SEED_CFPS.length} CFPs`);

  // Activity log
  const activities = [
    { userId: SEED_USERS[0].id, actionType: "profile_completed" as const, description: "Completed profile onboarding" },
    { userId: SEED_USERS[0].id, actionType: "badge_earned" as const, description: "Earned First Contribution badge" },
    { userId: SEED_USERS[0].id, actionType: "pr_merged" as const, description: "Merged PR #142 in kubeflow/pipelines" },
    { userId: SEED_USERS[0].id, actionType: "event_attended" as const, description: "Attended KCD Bangalore 2025" },
    { userId: SEED_USERS[0].id, actionType: "cfp_approved" as const, description: "Talk approved for KCD Bangalore" },
    { userId: SEED_USERS[1].id, actionType: "profile_completed" as const, description: "Completed profile onboarding" },
    { userId: SEED_USERS[1].id, actionType: "badge_earned" as const, description: "Earned Community Star badge" },
    { userId: SEED_USERS[2].id, actionType: "profile_completed" as const, description: "Completed profile onboarding" },
    { userId: SEED_USERS[2].id, actionType: "review_done" as const, description: "Reviewed PR #201 in kubeflow/training-operator" },
  ];
  for (const activity of activities) {
    await db.insert(activityLog).values(activity).onConflictDoNothing();
  }
  console.log(`  ✓ ${activities.length} activity log entries`);

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
