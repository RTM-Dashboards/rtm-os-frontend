"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function IntakeQuestionsPage() {
  return (
    <ConfigPlaceholder
      title="Intake Questions"
      breadcrumb={["Sales Configuration", "Intake Questions"]}
      description="The question library used to build Sales and Client Intake Forms."
      purpose="Intake Questions is the question bank from which forms are assembled. Questions are authored here with type, validation, and branching logic. The Form Builder references the question library to compose forms. No question text or logic should be hardcoded inside workspace pages."
      status="planned"
      fields={[
        { key: "question_text",    type: "textarea",    label: "Question Text" },
        { key: "question_type",    type: "select",      label: "Question Type",     description: "Text, Single Choice, Multi-Choice, Rating, Yes/No, Number." },
        { key: "category",         type: "select",      label: "Category",          description: "Business Info, Goals, Budget, Digital Presence, Competition, etc." },
        { key: "options",          type: "textarea",    label: "Answer Options",    description: "For choice-type questions (comma-separated or JSON array)." },
        { key: "is_required",      type: "toggle",      label: "Required" },
        { key: "branching_rule",   type: "textarea",    label: "Branching Logic",   description: "Conditions under which follow-up questions are shown." },
        { key: "goal_relevance",   type: "multiselect", label: "Relevant To Goals", description: "Which Audit Goals this question is relevant to." },
        { key: "sort_order",       type: "number",      label: "Default Sort Order" },
        { key: "is_active",        type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Form Builder", "Sales Intake Forms", "Client Intake Forms", "Sales Workspace"]}
      relatedSections={[
        { label: "Form Builder",             href: "/settings/form-builder" },
        { label: "Sales Intake Forms",       href: "/settings/sales-intake-forms" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      ]}
    />
  );
}
