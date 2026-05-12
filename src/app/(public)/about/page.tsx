import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Users, Heart, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "About Kubeflow Common Hubs - the local developer community for Kubeflow in India.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
        About Kubeflow Common Hubs
      </h1>

      <div className="max-w-none">
        <div className="text-text-secondary text-lg leading-relaxed space-y-6 mb-12">
          <p>
            <strong className="text-text-primary">Kubeflow Common Hubs</strong> is the local developer community
            for Kubeflow in India. We are a group of developers, ML engineers,
            data scientists, and platform engineers passionate about building
            the future of ML infrastructure on Kubernetes.
          </p>
          <p>
            Kubeflow is a CNCF project that makes deploying machine learning
            workflows on Kubernetes simple, portable, and scalable. Our
            community brings together Indian developers to learn, contribute,
            and grow in the Kubeflow ecosystem.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold mb-6">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 not-prose">
          {[
            {
              icon: Users,
              title: "Inclusive Community",
              description: "Everyone is welcome regardless of experience level. We believe diversity drives innovation.",
            },
            {
              icon: Heart,
              title: "Open Source First",
              description: "We contribute upstream. Every improvement we make goes back to the Kubeflow project.",
            },
            {
              icon: Shield,
              title: "Safe Space",
              description: "We follow the CNCF Code of Conduct. Harassment and discrimination have no place here.",
            },
            {
              icon: BookOpen,
              title: "Knowledge Sharing",
              description: "We learn together through events, talks, workshops, and mentorship.",
            },
          ].map((value) => (
            <div
              key={value.title}
              className="p-5 rounded-xl border border-border bg-bg-secondary"
            >
              <value.icon className="size-6 text-[var(--kf-blue)] mb-3" />
              <h3 className="font-semibold mb-1">{value.title}</h3>
              <p className="text-sm text-text-secondary">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Code of Conduct */}
        <h2 className="text-2xl font-bold mb-4" id="code-of-conduct">
          Code of Conduct
        </h2>
        <div className="text-text-secondary text-base leading-relaxed space-y-4 mb-12">
          <p>
            Kubeflow Common Hubs follows the{" "}
            <a
              href="https://github.com/cncf/foundation/blob/main/code-of-conduct.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--kf-blue)] underline underline-offset-2 hover:text-[var(--kf-blue-dark)]"
            >
              CNCF Code of Conduct
            </a>
            . We are committed to providing a welcoming and inspiring community for all. Harassment,
            discrimination, and disrespectful behavior are not tolerated.
          </p>
          <p>
            If you experience or witness unacceptable behavior, please report it by contacting
            the community organizers. All reports will be handled with discretion and confidentiality.
          </p>
        </div>

        {/* Links */}
        <h2 className="text-2xl font-bold mb-6">
          Get Involved
        </h2>
        <div className="flex flex-wrap gap-3 mb-12 not-prose">
          <Button variant="outline" asChild>
            <a href="https://github.com/kubeflow" target="_blank" rel="noopener noreferrer">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://www.kubeflow.org/" target="_blank" rel="noopener noreferrer">
              <Globe className="size-4" />
              Kubeflow.org
            </a>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/signup">Join the Community</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
