"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const departments = [
  { name: "Account Management",        slug: "account-management",       active: true  },
  { name: "Sales",                      slug: "sales",                     active: true  },
  { name: "Billing",                    slug: "billing",                   active: true  },
  { name: "Content",                    slug: "content",                   active: true  },
  { name: "Web Development & Design",   slug: "web-development-design",    active: true  },
  { name: "SEO & Local",                slug: "seo-local",                 active: true  },
  { name: "Paid Advertising",           slug: "paid-advertising",          active: true  },
  { name: "Reporting",                  slug: "reporting",                 active: true  },
  { name: "Local Service Ads",          slug: "local-service-ads",         active: true  },
  { name: "IT & Security",              slug: "it-security",               active: true  },
];

export default function BillingActivationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Department Activation Status</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Enable or disable department workspaces for clients.</p>
      </div>
      <SectionWrapper title="All Departments" description={`${departments.filter(d => d.active).length}/${departments.length} active`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {departments.map((d) => (
            <div key={d.name} className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.name}</p>
                <Link href={`/${d.slug}`} className="text-xs hover:underline" style={{ color: "var(--rtm-blue)" }}>
                  Open workspace →
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: d.active ? "#10B981" : "#9CA3AF" }}
                />
                <span className="text-xs font-semibold" style={{ color: d.active ? "#059669" : "#6B7280" }}>
                  {d.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
