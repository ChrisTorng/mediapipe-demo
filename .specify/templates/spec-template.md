# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
   → Capture UX acceptance criteria aligned with Principle II (Seamless User Experience Consistency)
5. Generate Functional Requirements
   → Each requirement must be testable
   → Tag each requirement with applicable principle markers: [P1]=Code Quality, [P2]=UX Consistency, [P3]=Performance Accountability
   → Mark ambiguous requirements
6. Record performance budgets and quality evidence
   → Document latency/fps/resource budgets defined by Principle III
   → Outline automated test expectations supporting Principle I
7. Identify Key Entities (if data involved)
8. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
9. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers
- 🔖 Map every requirement to at least one governing principle (P1/P2/P3)

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
[Describe the main user journey in plain language]

### Acceptance Scenarios
1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases
- What happens when [boundary condition]?
- How does system handle [error scenario]?
- Confirm accessibility and input modality coverage (keyboard, mouse, touch) for each scenario [P2]

## Requirements *(mandatory)*

> Principle tags: **[P1]** Code Quality, **[P2]** UX Consistency, **[P3]** Performance Accountability.

### Functional Requirements
- **FR-001 [P1]**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002 [P1][P2]**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003 [P2]**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004 [P1]**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005 [P1][P2]**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*
- **FR-006 [P1][P2]**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007 [P1]**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Performance Budgets *(mandatory)*
- **PB-001 [P3]**: Define p95 action-to-render latency target (≤150 ms unless otherwise justified)
- **PB-002 [P3]**: Specify steady-state frame rate goal (≥60 fps on reference hardware)
- **PB-003 [P3]**: Document resource ceilings (CPU, memory, energy) and telemetry strategy

### Key Entities *(include if feature involves data)*
- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed
- [ ] Requirements and budgets mapped to constitutional principles (P1/P2/P3)

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified
- [ ] Performance budgets documented with validation approach

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
