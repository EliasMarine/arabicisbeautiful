"use client";

import { useState } from "react";
import { OnboardingWizard } from "./onboarding-wizard";

interface OnboardingClientProps {
  showOnboarding: boolean;
}

export function OnboardingClient({ showOnboarding }: OnboardingClientProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!showOnboarding || dismissed) return null;

  return <OnboardingWizard onComplete={() => setDismissed(true)} />;
}
