<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles:
	- Placeholder → I. Uncompromising Code Quality
	- Placeholder → II. Seamless User Experience Consistency
	- Placeholder → III. Performance Accountability
- Added sections:
	- Execution Standards
	- Delivery Workflow
- Removed sections: None
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->

# MediaPipe Demo Constitution

## Core Principles

### I. Uncompromising Code Quality
- Every merge request MUST include automated tests that cover 90% or more of the touched lines and assert the intended behavior, with failures blocking merge.
- Linting, formatting, and static analysis MUST pass in continuous integration before human review begins; fixes belong in the same change set.
- At least one maintainer other than the author MUST review each change, verifying readability, test adequacy, and regression risk before approval.
- Production code MUST remain free of `TODO` or commented-out logic unless paired with a scheduled follow-up task in `/specs/.../tasks.md`.

**Rationale**: Consistent application of automated and human quality gates keeps the codebase reliable, maintainable, and ready for iterative improvement.

### II. Seamless User Experience Consistency
- Feature specs MUST define UX acceptance criteria that align with the latest approved interaction patterns and visual tokens captured in project documentation.
- Implementations MUST retain behavior parity across supported platforms, including keyboard, mouse, and touch inputs, with accessibility conformance at WCAG 2.1 AA or higher.
- UI changes MUST include visual or interaction regression tests (e.g., snapshot, golden image, or scripted demo capture) before merge, and discrepancies MUST be triaged before release.

**Rationale**: Enforcing shared patterns and accessibility standards preserves a cohesive experience that users can trust regardless of feature growth.

### III. Performance Accountability
- Each feature spec MUST declare performance budgets covering latency, frame rate, and resource ceilings; implementation MUST demonstrate compliance before release.
- Interactive paths MUST sustain ≥60 fps on reference hardware, with p95 action-to-render latency ≤150 ms and cold-start initialization ≤1.5 s.
- Performance telemetry MUST be instrumented and exported to the observability pipeline so regressions trigger automated alerts within one deploy cycle.

**Rationale**: Explicit, measured performance goals keep the product responsive, protect user trust, and prevent regressions from shipping unnoticed.

## Execution Standards
- Feature artifacts (spec, plan, tasks) MUST map each requirement to the principle it satisfies; gaps block advancement to subsequent phases.
- Continuous integration MUST run the full automated test and performance smoke suite on every default-branch merge candidate; failures block deployment.
- Release notes MUST call out UX-affecting changes with links to validation evidence (tests or demo captures) prior to tagging a release.

## Delivery Workflow
1. Draft feature spec referencing relevant principles and enumerating performance budgets.
2. Produce implementation plan including an initial and post-design Constitution Check with explicit mitigation for any risk.
3. Generate tasks in principle-aligned order: tests → instrumentation → implementation → validation.
4. Before release, confirm telemetry dashboards and UX regression assets reflect the latest changes and archive evidence alongside the feature documentation.

## Governance
- This constitution supersedes other process documents when conflicts arise. Amendments require consensus from at least two maintainers and a published rationale in the governance log.
- Versioning follows semantic rules: MAJOR for principle changes, MINOR for new scope or enforcement steps, PATCH for clarifications. Every amendment MUST update the version header and Sync Impact Report.
- Compliance reviews occur at the end of Phase 1 (design) and prior to releases. Any violation MUST be resolved or paired with an approved remediation plan before merging.
- Historical versions MUST remain accessible in repository history; deviations in active work MUST be documented in the relevant plan under Complexity Tracking.

**Version**: 1.0.0 | **Ratified**: 2025-09-26 | **Last Amended**: 2025-09-26