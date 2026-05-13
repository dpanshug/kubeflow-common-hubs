export interface MockNewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: string;
  author: string;
  authorAvatarUrl?: string;
  coverImageUrl?: string;
}

export const mockPosts: MockNewsPost[] = [
  {
    id: "1",
    title: "Kubeflow 1.9 Released: What's New for Indian Developers",
    excerpt:
      "The latest Kubeflow release brings improved pipeline support, better notebook integration, and enhanced model serving capabilities.",
    slug: "kubeflow-1-9-released",
    tags: ["Release", "Kubeflow"],
    publishedAt: "2026-05-01T10:00:00",
    author: "Kubeflow Common Hubs",
    content:
      "Kubeflow 1.9 has officially landed, and it brings a host of improvements that Indian ML teams have been waiting for. This release focuses on three key areas: pipeline reliability, notebook experience, and model serving at scale.\n\nKubeflow Pipelines v2 now supports conditional execution, loop parallelism, and improved caching. Pipeline authors can define complex DAGs with branching logic, retry policies, and resource quotas — all declaratively. The new SDK also introduces type-safe component I/O, reducing runtime errors significantly.\n\nThe Notebook experience gets a major upgrade with JupyterLab 4.x integration, built-in Git support, and the ability to spawn notebooks with custom container images. Teams at Flipkart and Razorpay have already reported 40% faster iteration cycles using the new notebook controller.\n\nKServe (model serving) now supports multi-model serving on a single GPU, automatic batching, and canary deployments out of the box. For Indian startups running on tight budgets, this means serving multiple models on fewer GPU instances without sacrificing latency.\n\nThe community has also contributed improved documentation in Hindi, making Kubeflow more accessible to developers across India. We encourage everyone to try the new release and share feedback on the community Slack channel.",
  },
  {
    id: "2",
    title: "Recap: KCD Chennai 2026",
    excerpt:
      "Over 200 developers gathered in Chennai for the first Kubernetes Community Day of the year. Here's what happened.",
    slug: "recap-kcd-chennai-2026",
    tags: ["Event", "Recap"],
    publishedAt: "2026-04-20T10:00:00",
    author: "Priya Patel",
    content:
      "KCD Chennai 2026 was a massive success, drawing over 200 developers, platform engineers, and ML practitioners to the ITC Grand Chola for a full day of talks, workshops, and networking.\n\nThe keynote by Dr. Ananya Sharma from Google set the tone with a deep dive into how Kubeflow is being used to train large language models on Google Cloud's TPU infrastructure. She shared benchmarks showing 3x training speedup with the new pipeline compiler.\n\nThe MLOps track featured standout talks on feature stores (by the Swiggy ML team), experiment tracking with MLflow + Kubeflow (by a Walmart Labs engineer), and a panel on 'ML in Production: What Nobody Tells You' that sparked a lively audience Q&A.\n\nThe hands-on workshop on Kubeflow Pipelines v2 was fully booked, with 80 attendees building their first ML pipeline from scratch. Many participants reported it was the clearest introduction to pipeline orchestration they'd experienced.\n\nNetworking highlights included a 'Birds of a Feather' session on MLOps career paths, a lightning talk round where five community members shared 5-minute presentations, and a contributor sprint where three attendees made their first PR to the Kubeflow repository.\n\nThe event was sponsored by Google Cloud, Red Hat, and CNCF India. We're already planning KCD Chennai 2027 — stay tuned for the announcement!",
  },
  {
    id: "3",
    title: "Getting Started with Kubeflow Pipelines v2",
    excerpt:
      "A beginner-friendly guide to building your first ML pipeline with Kubeflow Pipelines v2. Step-by-step with code examples.",
    slug: "getting-started-kubeflow-pipelines-v2",
    tags: ["Tutorial", "Pipelines"],
    publishedAt: "2026-04-10T10:00:00",
    author: "Amit Kumar",
    content:
      "If you've been working with Jupyter notebooks and want to take the next step toward production ML, Kubeflow Pipelines v2 is the tool you need. This guide walks you through building your first pipeline from scratch.\n\nKubeflow Pipelines lets you define ML workflows as directed acyclic graphs (DAGs) of containerized steps. Each step — data preprocessing, training, evaluation, deployment — runs in its own container with explicit inputs and outputs. This gives you reproducibility, version control, and scalability for free.\n\nTo get started, you'll need a Kubernetes cluster with Kubeflow installed. If you don't have one, you can use a managed service like Google Cloud's AI Platform Pipelines or set up a local cluster with Kind or Minikube.\n\nThe pipeline SDK uses Python decorators to define components. A component is simply a Python function decorated with @component that specifies its inputs, outputs, and container image. The SDK handles serialization, artifact tracking, and execution scheduling.\n\nHere's what a typical pipeline looks like: you define a data loading component, a preprocessing component, a training component, and an evaluation component. Each component declares its dependencies, and the pipeline compiler generates the execution graph automatically.\n\nOnce your pipeline is compiled, you can submit it to the Kubeflow Pipelines backend via the SDK or the web UI. The system handles scheduling, retries, caching, and metadata tracking. You can view execution history, compare runs, and inspect artifacts through the dashboard.\n\nWe've published the complete code for this tutorial on the Kubeflow Common Hubs GitHub repository. Fork it, run it, and modify it to fit your use case. Happy pipelining!",
  },
];

export function getPostBySlug(slug: string): MockNewsPost | undefined {
  return mockPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 2): MockNewsPost[] {
  return mockPosts.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
