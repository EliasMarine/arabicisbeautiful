"use client";

import { useEffect, useState } from "react";
import { Check, Lock, Zap } from "lucide-react";

const PHASES = [
  { id: "reactivation", name: "Reactivation", color: "#e94560", order: 1, skills: ["Alphabet", "Basic Greetings", "Numbers", "Core Vocab"] },
  { id: "speaking-in-phrases", name: "Speaking in Phrases", color: "#74b9ff", order: 2, skills: ["Common Phrases", "Questions", "Directions", "Food & Drink"] },
  { id: "structured-conversation", name: "Structured Conversation", color: "#a29bfe", order: 3, skills: ["Verb Forms", "Sentence Building", "Past Tense", "Future Tense"] },
  { id: "expanding-vocabulary", name: "Expanding Vocabulary", color: "#00b894", order: 4, skills: ["Body & Health", "Work & School", "Nature", "Emotions"] },
  { id: "fluency-push", name: "Fluency Push", color: "#fdcb6e", order: 5, skills: ["Idioms", "Slang", "Storytelling", "Debating"] },
  { id: "maintenance", name: "Maintenance", color: "#fd79a8", order: 6, skills: ["Reading", "Listening", "Writing", "Speaking"] },
];

interface SkillTreeProps {
  progress?: Record<string, number>;
  currentPhase?: string;
}

type PhaseStatus = "completed" | "current" | "locked";

function getPhaseStatus(
  phaseId: string,
  currentPhase: string | undefined,
  progress: Record<string, number>
): PhaseStatus {
  const phase = PHASES.find((p) => p.id === phaseId);
  const current = PHASES.find((p) => p.id === currentPhase);
  if (!phase) return "locked";
  if (phaseId === currentPhase) return "current";
  if (current && phase.order < current.order) return "completed";
  if (!currentPhase && progress[phaseId] !== undefined && progress[phaseId] >= 100) return "completed";
  return "locked";
}

function ProgressRingSVG({
  percentage,
  size,
  strokeWidth,
  color,
}: {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
}

function PhaseNode({
  phase,
  status,
  percentage,
  index,
}: {
  phase: (typeof PHASES)[number];
  status: PhaseStatus;
  percentage: number;
  index: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  const nodeSize = status === "current" ? 56 : 48;
  const isLeft = index % 2 === 0;

  const nodeColor = status === "locked" ? "var(--text-secondary)" : phase.color;
  const nodeBg =
    status === "completed"
      ? phase.color
      : status === "current"
        ? `${phase.color}22`
        : "var(--bg-card)";

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {/* Phase Node Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexDirection: isLeft ? "row" : "row-reverse",
          padding: "0 8px",
        }}
      >
        {/* Phase Label */}
        <div
          style={{
            flex: "1 1 0",
            textAlign: isLeft ? "right" : "left",
            minWidth: 0,
          }}
        >
          <p
            style={{
              fontSize: status === "current" ? 16 : 14,
              fontWeight: 700,
              color: status === "locked" ? "var(--text-secondary)" : "var(--text)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {phase.name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              margin: "2px 0 0 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            Phase {phase.order}
          </p>
        </div>

        {/* Main Node Circle */}
        <div
          style={{
            position: "relative",
            width: nodeSize,
            height: nodeSize,
            flexShrink: 0,
          }}
        >
          {/* Glow for current phase */}
          {status === "current" && (
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: `${phase.color}20`,
                animation: "skillTreePulse 2s ease-in-out infinite",
              }}
            />
          )}

          {/* Progress ring for current phase */}
          {status === "current" && (
            <ProgressRingSVG
              percentage={percentage}
              size={nodeSize}
              strokeWidth={4}
              color={phase.color}
            />
          )}

          {/* Circle */}
          <div
            style={{
              position: "absolute",
              inset: status === "current" ? 5 : 3,
              borderRadius: "50%",
              background: nodeBg,
              border: `2px solid ${nodeColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                status === "current"
                  ? `0 0 20px ${phase.color}40, 0 0 40px ${phase.color}15`
                  : status === "completed"
                    ? `0 4px 12px ${phase.color}30`
                    : "none",
              transition: "box-shadow 0.3s ease, background 0.3s ease",
            }}
          >
            {status === "completed" && <Check size={20} color="#fff" strokeWidth={3} />}
            {status === "current" && <Zap size={20} color={phase.color} strokeWidth={2.5} />}
            {status === "locked" && (
              <Lock size={16} color="var(--text-secondary)" strokeWidth={2} />
            )}
          </div>

          {/* Percentage for current */}
          {status === "current" && percentage > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                background: phase.color,
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 8,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(percentage)}%
            </div>
          )}
        </div>

        {/* Spacer for alignment */}
        <div style={{ flex: "1 1 0", minWidth: 0 }} />
      </div>

      {/* Skills branching off */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px 0 0 0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "6px 12px",
            maxWidth: 280,
            width: "100%",
          }}
        >
          {phase.skills.map((skill, si) => {
            const skillProgress =
              status === "completed"
                ? 100
                : status === "current"
                  ? Math.max(0, percentage - si * 20)
                  : 0;
            const skillDone = skillProgress >= 100;
            const skillActive = status === "current" && !skillDone && skillProgress > 0;

            return (
              <div
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateX(0)" : "translateX(-12px)",
                  transition: `opacity 0.4s ease-out ${index * 120 + si * 80}ms, transform 0.4s ease-out ${index * 120 + si * 80}ms`,
                }}
              >
                {/* Skill mini node */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `2px solid ${
                      skillDone
                        ? phase.color
                        : skillActive
                          ? phase.color
                          : status === "locked"
                            ? "var(--border)"
                            : `${phase.color}50`
                    }`,
                    background: skillDone
                      ? phase.color
                      : skillActive
                        ? `${phase.color}15`
                        : "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: skillActive
                      ? `0 0 8px ${phase.color}30`
                      : skillDone
                        ? `0 2px 6px ${phase.color}25`
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {skillDone && <Check size={14} color="#fff" strokeWidth={3} />}
                  {skillActive && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: phase.color,
                        animation: "skillTreeDot 1.5s ease-in-out infinite",
                      }}
                    />
                  )}
                  {status === "locked" && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--border)",
                      }}
                    />
                  )}
                </div>

                {/* Skill name */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: skillActive || skillDone ? 600 : 400,
                    color:
                      skillDone || skillActive
                        ? "var(--text)"
                        : "var(--text-secondary)",
                    lineHeight: 1.3,
                  }}
                >
                  {skill}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SkillTree({ progress = {}, currentPhase }: SkillTreeProps) {
  return (
    <>
      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes skillTreePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        @keyframes skillTreeDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes skillTreeLineGrow {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes skillTreeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          paddingBottom: 32,
        }}
      >
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.id, currentPhase, progress);
          const percentage = progress[phase.id] ?? 0;
          const isLast = index === PHASES.length - 1;

          // Determine connector color
          const nextPhase = PHASES[index + 1];
          const nextStatus = nextPhase
            ? getPhaseStatus(nextPhase.id, currentPhase, progress)
            : "locked";
          const connectorActive =
            status === "completed" || (status === "current" && nextStatus !== "locked");
          const connectorColor = connectorActive ? phase.color : "var(--border)";

          return (
            <div key={phase.id}>
              <PhaseNode
                phase={phase}
                status={status}
                percentage={percentage}
                index={index}
              />

              {/* Connector line to next phase */}
              {!isLast && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px 0",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 3,
                      height: 40,
                      background: "var(--border)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {/* Animated fill */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: status === "completed" ? "100%" : status === "current" ? `${percentage}%` : "0%",
                        background: `linear-gradient(to bottom, ${phase.color}, ${nextPhase?.color ?? phase.color})`,
                        borderRadius: 2,
                        transition: "height 1s ease-out",
                      }}
                    />

                    {/* Shimmer on active connector */}
                    {(status === "completed" || status === "current") && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(to bottom, transparent 0%, ${phase.color}50 50%, transparent 100%)`,
                          backgroundSize: "100% 200%",
                          animation: "skillTreeShimmer 2s ease-in-out infinite",
                          opacity: 0.5,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Extra shimmer animation */}
        <style>{`
          @keyframes skillTreeShimmer {
            0% { background-position: 0% 0%; }
            100% { background-position: 0% 200%; }
          }
        `}</style>
      </div>
    </>
  );
}
