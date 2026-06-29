"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardStep {
  number: number;
  label: string;
}

interface WizardStepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  steps: WizardStep[];
  onStepClick?: (step: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WizardStepIndicator({
  currentStep,
  completedSteps,
  steps,
  onStepClick,
}: WizardStepIndicatorProps) {
  return (
    <div className="flex items-start justify-between w-full px-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.number);
        const isActive = step.number === currentStep;
        const isClickable = isCompleted && onStepClick;

        // Connector line to the right
        const showConnector = index < steps.length - 1;
        const connectorFilled =
          completedSteps.includes(step.number) &&
          completedSteps.includes(steps[index + 1]?.number);

        return (
          <React.Fragment key={step.number}>
            {/* Step node */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.number)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all focus:outline-none"
                style={{
                  background: isCompleted
                    ? "#059669"
                    : isActive
                    ? "#1D4ED8"
                    : "var(--rtm-surface)",
                  borderColor: isCompleted
                    ? "#059669"
                    : isActive
                    ? "#1D4ED8"
                    : "#D1D5DB",
                  color: isCompleted || isActive ? "#fff" : "#9CA3AF",
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </button>
              <span
                className="text-[11px] font-semibold text-center leading-tight max-w-[72px]"
                style={{
                  color: isCompleted
                    ? "#059669"
                    : isActive
                    ? "#1D4ED8"
                    : "#9CA3AF",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {showConnector && (
              <div
                className="flex-1 h-0.5 mt-4 mx-1"
                style={{
                  background: connectorFilled ? "#059669" : "#E5E7EB",
                  minWidth: "16px",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
