import React from 'react';
import {
  LayersIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  ArrowRightIcon,
  CheckIcon,
  TerminalIcon,
  UsersIcon,
  ShieldCheckIcon,
  GitCommitIcon,
  CodeIcon,
} from '../common/Icons';
import { HexagonShape } from '../common/Hexagon';

/**
 * Reusable Card Shell ensuring identical structure, DRY code,
 * spacious card sizing, zero overlap from floating navbar,
 * and zero lines cutting into or truncating content.
 */
export function FeatureCardShell({
  title,
  subtitle,
  description,
  isDark = true,
  category,
  nextFeature,
  metrics,
  customLeftBottom,
  children,
}) {
  const bgClass = isDark
    ? 'bg-[#0A0A0A] text-white border-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
    : 'bg-[#FFFFFF] text-black border-[#E5E5E5] shadow-[0_20px_60px_rgba(0,0,0,0.12)]';

  const numClass = isDark ? 'text-white' : 'text-black';
  const descClass = isDark ? 'text-[#AAAAAA]' : 'text-[#555555]';
  const footerTextClass = isDark ? 'text-[#777777]' : 'text-[#666666]';
  const nextTextClass = isDark ? 'text-white' : 'text-black font-semibold';
  const metricBgClass = isDark
    ? 'bg-[#121212] border-[#222222]'
    : 'bg-[#F9F9F9] border-[#E5E5E5]';
  const metricLabelClass = isDark ? 'text-[#888888]' : 'text-[#666666]';
  const metricValueClass = isDark ? 'text-white' : 'text-black';
  const metricSubClass = isDark ? 'text-[#777777]' : 'text-[#888888]';

  return (
    <div className="w-screen h-full flex items-center justify-center shrink-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3">
      <div
        className={`w-full max-w-[1440px] xl:max-w-[1500px] h-[88%] sm:h-[90%] lg:h-[92%] max-h-[580px] sm:max-h-[620px] lg:max-h-[650px] xl:max-h-[680px] ${bgClass} p-5 sm:p-7 lg:p-8 xl:p-9 rounded-[24px] sm:rounded-[32px] border-2 flex flex-col justify-between relative overflow-hidden`}
      >
        {/* Main Card Content (2-Column Grid with clean vertical centering, zero intersecting lines) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-center flex-1 my-auto min-h-0 overflow-y-auto lg:overflow-visible">
          
          {/* Left Side: Headline, Copy & Metrics/Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <h3 className={`text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-black tracking-tight leading-[1.06] ${numClass}`}>
              {title}
              {subtitle && (
                <>
                  <br />
                  {subtitle}
                </>
              )}
            </h3>

            <p className={`mt-3 sm:mt-4 text-sm sm:text-base lg:text-[16px] xl:text-[17px] ${descClass} leading-relaxed max-w-lg font-normal`}>
              {description}
            </p>

            {/* Metrics Grid (Clean spacing without intrusive border lines) */}
            {metrics && (
              <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                {metrics.map((m, idx) => (
                  <div key={idx} className={`p-3 sm:p-3.5 rounded-xl border ${metricBgClass}`}>
                    <div className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider ${metricLabelClass}`}>
                      {m.label}
                    </div>
                    <div className={`text-xl sm:text-2xl xl:text-3xl font-black mt-1 ${metricValueClass}`}>
                      {m.value}
                    </div>
                    <div className={`text-[11px] sm:text-xs mt-0.5 ${metricSubClass}`}>
                      {m.sub}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Left Bottom (e.g. Action buttons for Code Review) */}
            {customLeftBottom && (
              <div className="mt-5 sm:mt-6">
                {customLeftBottom}
              </div>
            )}
          </div>

          {/* Right Side: Visual Content */}
          <div className="lg:col-span-7 h-full flex items-center justify-center min-h-0">
            {children}
          </div>
        </div>

        {/* Bottom Card Footer (Clean text without horizontal line cutting the content) */}
        <div className={`pt-2 flex items-center justify-end text-[11px] sm:text-xs font-mono ${footerTextClass} shrink-0`}>
          <span className={`flex items-center gap-1.5 ${nextTextClass}`}>
            {nextFeature} <ArrowRightIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * CARD 01: PROJECT MANAGEMENT (BLACK CARD)
 */
export function ProjectManagementCard() {
  return (
    <FeatureCardShell
      title="PROJECT"
      subtitle="MANAGEMENT"
      description="Organize projects, define milestones and keep your entire team aligned from one unified workspace."
      isDark={true}
      category="ARCHITECTURE ENGINE"
      nextFeature="Scroll for Task Management"
      metrics={[
        { label: 'Sprint Health', value: '94% On Track', sub: 'Zero blocking blockers' },
        { label: 'Milestones', value: '12 / 14 Closed', sub: 'Target: Release v2.4' },
      ]}
    >
      <div className="w-full max-w-[560px] p-5 sm:p-6 bg-[#0E0E0E] rounded-2xl border border-[#222222] flex flex-col items-center shadow-lg">
        {/* Root Node: PROJECT with ample bottom clearance */}
        <div className="relative mb-6">
          <HexagonShape size={64} fill="#181818" stroke="#FFFFFF" strokeWidth={2}>
            <LayersIcon className="w-6 h-6 text-white" />
          </HexagonShape>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-bold tracking-wider whitespace-nowrap shadow-md">
            PROJECT: GitSphere
          </div>
        </div>

        {/* Connecting Bus Line with safe margins so it never cuts into the badge */}
        <div className="w-3/4 h-[2px] bg-[#333333] relative my-3 sm:my-3.5">
          <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-white" />
          <div className="absolute -top-1 left-1/3 w-2 h-2 rounded-full bg-white" />
          <div className="absolute -top-1 left-2/3 w-2 h-2 rounded-full bg-white" />
          <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-white" />
        </div>

        {/* 4 Connected Branches with clean modern titles (no cutting ASCII lines) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full mt-2">
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] flex flex-col items-center text-center group hover:border-white transition-colors">
            <HexagonShape size={38} fill="#0A0A0A" stroke="#555555" strokeWidth={1.5}>
              <CodeIcon className="w-4 h-4 text-white" />
            </HexagonShape>
            <span className="text-xs font-mono font-bold text-white mt-1.5">Frontend</span>
            <span className="text-[10px] text-[#888888] mt-0.5">React 19 + Tailwind</span>
          </div>
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] flex flex-col items-center text-center group hover:border-white transition-colors">
            <HexagonShape size={38} fill="#0A0A0A" stroke="#555555" strokeWidth={1.5}>
              <TerminalIcon className="w-4 h-4 text-white" />
            </HexagonShape>
            <span className="text-xs font-mono font-bold text-white mt-1.5">Backend</span>
            <span className="text-[10px] text-[#888888] mt-0.5">Go + gRPC Daemon</span>
          </div>
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] flex flex-col items-center text-center group hover:border-white transition-colors">
            <HexagonShape size={38} fill="#0A0A0A" stroke="#555555" strokeWidth={1.5}>
              <GitBranchIcon className="w-4 h-4 text-white" />
            </HexagonShape>
            <span className="text-xs font-mono font-bold text-white mt-1.5">API</span>
            <span className="text-[10px] text-[#888888] mt-0.5">GraphQL & REST</span>
          </div>
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] flex flex-col items-center text-center group hover:border-white transition-colors">
            <HexagonShape size={38} fill="#0A0A0A" stroke="#555555" strokeWidth={1.5}>
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </HexagonShape>
            <span className="text-xs font-mono font-bold text-white mt-1.5">Docs</span>
            <span className="text-[10px] text-[#888888] mt-0.5">Architecture Specs</span>
          </div>
        </div>
      </div>
    </FeatureCardShell>
  );
}

/**
 * CARD 02: TASK MANAGEMENT (WHITE CARD)
 */
export function TaskManagementCard() {
  return (
    <FeatureCardShell
      title="TASK"
      subtitle="MANAGEMENT"
      description="Assign tasks, track progress and make responsibilities clear with zero administrative friction."
      isDark={false}
      category="KANBAN PIPELINE"
      nextFeature="Scroll for Code Collaboration"
      metrics={[
        { label: 'Velocity Output', value: '+38% Speed', sub: 'Average sprint cycle' },
        { label: 'Backlog Health', value: '100% Assigned', sub: 'No unowned tickets' },
      ]}
    >
      <div className="w-full max-w-[620px] p-4 sm:p-5 bg-[#FAFAFA] rounded-2xl border border-[#E5E5E5] shadow-sm overflow-x-auto">
        <div className="grid grid-cols-4 gap-2.5 min-w-[500px] w-full">
          {/* TODO */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E0E0E0]">
              <span className="text-[11px] font-mono font-bold tracking-wider text-black">TODO</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEEEEE] text-[#555555]">3</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E0E0E0] shadow-sm">
              <div className="text-[10px] font-mono text-[#777777]">GS-104</div>
              <div className="text-xs font-bold text-black mt-1">Schema migration</div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#777777]">
                <span className="font-semibold text-black">P2</span>
                <span>Alex.dev</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E0E0E0] shadow-sm">
              <div className="text-[10px] font-mono text-[#777777]">GS-109</div>
              <div className="text-xs font-bold text-black mt-1">Token benchmark</div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#777777]">
                <span className="font-semibold text-black">P3</span>
                <span>Sarah.l</span>
              </div>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E0E0E0]">
              <span className="text-[11px] font-mono font-bold tracking-wider text-black">IN PROGRESS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black text-white">1</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black text-white border border-black shadow-md">
              <div className="text-[10px] font-mono text-[#AAAAAA]">GS-098</div>
              <div className="text-xs font-bold text-white mt-1">Real-time sync</div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#CCCCCC]">
                <span className="font-semibold text-white">HIGH</span>
                <span>Marcus</span>
              </div>
            </div>
          </div>

          {/* REVIEW */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E0E0E0]">
              <span className="text-[11px] font-mono font-bold tracking-wider text-black">REVIEW</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEEEEE] text-[#555555]">2</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E0E0E0] shadow-sm">
              <div className="text-[10px] font-mono text-[#777777]">GS-092</div>
              <div className="text-xs font-bold text-black mt-1">PR #108 crypto</div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#777777]">
                <span className="font-semibold text-black">2 signed</span>
              </div>
            </div>
          </div>

          {/* DONE (No line-through cutting the text) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E0E0E0]">
              <span className="text-[11px] font-mono font-bold tracking-wider text-black">DONE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEEEEE] text-[#555555]">18</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F0F0F0] border border-[#E0E0E0] opacity-90">
              <div className="text-[10px] font-mono text-[#777777]">GS-084</div>
              <div className="text-xs font-bold text-[#444444] mt-1">Vite engine upgrade</div>
              <div className="mt-2.5 flex items-center gap-1 text-[10px] text-black font-semibold">
                <CheckIcon className="w-3 h-3 text-black" /> Done
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureCardShell>
  );
}

/**
 * CARD 03: CODE COLLABORATION (BLACK CARD)
 */
export function CodeCollaborationCard() {
  return (
    <FeatureCardShell
      title="CODE"
      subtitle="COLLABORATION"
      description="Share code, contribute changes and build together without losing context or encountering collision conflicts."
      isDark={true}
      category="PEER ENGINE"
      nextFeature="Scroll for Code Review"
      customLeftBottom={
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white">
            <GitBranchIcon className="w-3.5 h-3.5 text-white" />
            <span>main ← release-v2</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white">
            <GitCommitIcon className="w-3.5 h-3.5 text-white" />
            <span>#7fe91b</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white">
            <GitPullRequestIcon className="w-3.5 h-3.5 text-white" />
            <span>PR #108</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white">
            <CheckIcon className="w-3.5 h-3.5 text-white" />
            <span>Verified</span>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-[600px] bg-[#090909] rounded-2xl border border-[#222222] shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-[#141414] border-b border-[#222222] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <span className="ml-2 text-xs font-mono text-[#CCCCCC]">sphere-consensus.ts</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F1F1F] text-[#AAAAAA]">
            LIVE PEER EDITING
          </span>
        </div>
        <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-[#CCCCCC] space-y-1.5">
          <div className="text-[#666666]">// Synchronizing decentralized node commits</div>
          <div className="text-white font-semibold">export async function <span className="text-white underline">broadcastCommit</span>(hash: string) &#123;</div>
          <div className="pl-4 text-[#AAAAAA]">const node = await SphereTopology.connect();</div>
          <div className="pl-4 text-white bg-[#161616] py-1 px-2.5 rounded border-l-2 border-white">
            + const validation = await node.verifySignatures(hash);
          </div>
          <div className="pl-4 text-white bg-[#161616] py-1 px-2.5 rounded border-l-2 border-white">
            + await node.propagateToPeers(validation);
          </div>
          <div className="pl-4 text-[#888888]">return &#123; status: &quot;consensus_reached&quot;, latencyMs: 14 &#125;;</div>
          <div className="text-white">&#125;</div>
        </div>
        <div className="bg-[#0F0F0F] border-t border-[#222222] px-4 py-2 flex items-center justify-between text-xs font-mono text-[#777777]">
          <span>Branch: main [Protected]</span>
          <span className="text-white font-bold">100% Collision-Free</span>
        </div>
      </div>
    </FeatureCardShell>
  );
}

/**
 * CARD 04: CODE REVIEW (WHITE CARD)
 */
export function CodeReviewCard() {
  return (
    <FeatureCardShell
      title="CODE"
      subtitle="REVIEW"
      description="Review contributions, leave feedback and maintain code quality before changes are approved."
      isDark={false}
      category="AUDIT ENGINE"
      nextFeature="Scroll for Contribution Tracking"
      customLeftBottom={
        <div className="flex flex-wrap items-center gap-2.5">
          <button className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#222222] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Approved</span>
          </button>
          <button className="px-3.5 py-1.5 rounded-full bg-white text-black border border-black text-xs font-bold hover:bg-[#F5F5F5] transition-colors cursor-pointer">
            <span>Changes Requested</span>
          </button>
          <button className="px-3.5 py-1.5 rounded-full bg-[#EEEEEE] text-[#333333] text-xs font-bold hover:bg-[#E0E0E0] transition-colors cursor-pointer">
            <span>+ Add Comment</span>
          </button>
        </div>
      }
    >
      <div className="w-full max-w-[580px] p-4 sm:p-5 bg-[#FAFAFA] rounded-2xl border border-[#E5E5E5] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E0E0E0]">
          <div>
            <div className="text-xs font-mono font-bold text-black uppercase tracking-wider">
              CODE REVIEW — PR #108
            </div>
            <div className="text-[11px] text-[#666666]">Author: alex.dev • Reviewer: sarah.lead</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-mono font-bold">
            2 of 2 Sign-offs
          </span>
        </div>
        <div className="py-2.5 font-mono text-xs leading-relaxed space-y-1 bg-white p-3 rounded-xl border border-[#E5E5E5]">
          <div className="text-[#888888]">@@ -18,6 +18,9 @@ export function enforcePolicy()</div>
          <div className="text-black bg-[#F0F0F0] px-2 py-0.5 rounded font-semibold">
            + if (!signatures.includes(LEAD_KEY)) throw new PolicyError();
          </div>
          <div className="text-[#666666] px-2">  return executeAutomatedMerge();</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-black flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-black" />
              sarah.lead (Staff Reviewer)
            </span>
            <span className="text-[10px] text-[#888888]">2m ago</span>
          </div>
          <p className="mt-1 text-xs text-[#444444] leading-relaxed">
            &quot;Cryptographic policy looks rock solid. Performance benchmarks verify zero regression under high throughput. Approved.&quot;
          </p>
        </div>
      </div>
    </FeatureCardShell>
  );
}

/**
 * CARD 05: CONTRIBUTION TRACKING (BLACK CARD)
 */
export function ContributionTrackingCard() {
  return (
    <FeatureCardShell
      title="CONTRIBUTION"
      subtitle="TRACKING"
      description="Track contributions, approvals and project evolution in one place with immutable milestone tracking."
      isDark={true}
      category="EVOLUTION ENGINE"
      nextFeature="Next: How GitSphere Works ↓"
      metrics={[
        { label: 'Merged Commits', value: '1,482', sub: 'Across 42 active branches' },
        { label: 'Impact Velocity', value: '99.98%', sub: 'Zero collision merges' },
      ]}
    >
      <div className="w-full max-w-[500px] p-4 sm:p-5 bg-[#0E0E0E] rounded-2xl border border-[#222222] flex flex-col gap-2.5 shadow-xl">
        {/* v1.0 Node */}
        <div className="flex items-center gap-3">
          <HexagonShape size={36} fill="#141414" stroke="#444444" strokeWidth={1.5}>
            <span className="text-[10.5px] font-mono font-bold text-white">1.0</span>
          </HexagonShape>
          <div className="flex-1 p-2.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">v1.0 — Initial Genesis</div>
              <div className="text-[10px] text-[#888888]">12 contributors • 48 commits</div>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">Stable</span>
          </div>
        </div>

        <div className="w-[2px] h-2 bg-[#333333] ml-4.5" />

        {/* v1.1 Node */}
        <div className="flex items-center gap-3">
          <HexagonShape size={36} fill="#141414" stroke="#444444" strokeWidth={1.5}>
            <span className="text-[10.5px] font-mono font-bold text-white">1.1</span>
          </HexagonShape>
          <div className="flex-1 p-2.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">v1.1 — Decentralized Sync</div>
              <div className="text-[10px] text-[#888888]">18 contributors • 112 commits</div>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">Merged</span>
          </div>
        </div>

        <div className="w-[2px] h-2 bg-[#333333] ml-4.5" />

        {/* v1.2 Node */}
        <div className="flex items-center gap-3">
          <HexagonShape size={36} fill="#141414" stroke="#666666" strokeWidth={1.5}>
            <span className="text-[10.5px] font-mono font-bold text-white">1.2</span>
          </HexagonShape>
          <div className="flex-1 p-2.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">v1.2 — Automated CI Gateways</div>
              <div className="text-[10px] text-[#888888]">24 contributors • 230 commits</div>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">Verified</span>
          </div>
        </div>

        <div className="w-[2px] h-2 bg-white ml-4.5" />

        {/* v2.0 Node */}
        <div className="flex items-center gap-3">
          <HexagonShape size={42} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2}>
            <span className="text-xs font-mono font-black text-black">2.0</span>
          </HexagonShape>
          <div className="flex-1 p-2.5 rounded-xl bg-white text-black border border-white flex items-center justify-between shadow-lg">
            <div>
              <div className="text-xs font-black text-black">v2.0 — Production Standard</div>
              <div className="text-[10px] text-[#555555]">Consensus Architecture</div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black text-white">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </FeatureCardShell>
  );
}
