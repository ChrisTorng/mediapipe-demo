# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract, integration, UX regression, performance smoke
   → Core: models, services, CLI commands
   → Instrumentation: telemetry, monitoring hooks
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance validation, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
   → Ensure Principle coverage: Code Quality (P1), UX Consistency (P2), Performance (P3)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → UX regression coverage captured?
   → Performance budgets backed by tests and instrumentation?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Append applicable principle markers to each description (e.g., `[P1][P2][P3]`)

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P][P1] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T005 [P][P1] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T006 [P][P1][P2] Integration test user registration in tests/integration/test_registration.py
- [ ] T007 [P][P1][P2] Integration test auth flow in tests/integration/test_auth.py
- [ ] T008 [P][P2] Visual regression baseline for registration flow in tests/ux/test_registration_ui.py
- [ ] T009 [P][P3] Performance smoke harness for registration flow in tests/performance/test_registration_perf.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 [P][P1] User model in src/models/user.py
- [ ] T011 [P][P1] UserService CRUD in src/services/user_service.py
- [ ] T012 [P][P1] CLI --create-user in src/cli/user_commands.py
- [ ] T013 [P1][P3] POST /api/users endpoint with instrumentation hooks
- [ ] T014 [P1][P3] GET /api/users/{id} endpoint with instrumentation hooks
- [ ] T015 [P1] Input validation
- [ ] T016 [P1] Error handling and logging
- [ ] T017 [P3] Telemetry exporter for performance metrics in src/services/metrics.py

## Phase 3.4: Integration
- [ ] T018 [P1][P3] Connect UserService to DB with performance guards
- [ ] T019 [P1] Auth middleware
- [ ] T020 [P1] Request/response logging
- [ ] T021 [P1][P2] CORS and security headers
- [ ] T022 [P3] Load perf metrics into observability pipeline

## Phase 3.5: Polish
- [ ] T023 [P][P1] Unit tests for validation in tests/unit/test_validation.py
- [ ] T024 [P3] Performance tests validate budgets (<150 ms p95, ≥60 fps)
- [ ] T025 [P2] Update UX regression artifacts in specs/[###-feature-name]/ux/regression.md
- [ ] T026 [P1] Remove duplication
- [ ] T027 [P2][P3] Archive evidence bundle in specs/[###-feature-name]/validation.md
- [ ] T028 [P1][P2] Run specs/[###-feature-name]/manual-testing.md and log deviations

## Dependencies
- Tests (T004-T009) before implementation (T010-T017)
- T010 blocks T011 and T018
- Instrumentation (T017, T022) before performance validation (T024-T027)
- Implementation before polish (T023-T028)

## Parallel Example
```
# Launch T004-T009 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
Task: "Visual regression baseline for registration flow in tests/ux/test_registration_ui.py"
Task: "Performance smoke harness for registration flow in tests/performance/test_registration_perf.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks
   - UX-critical stories → regression capture tasks [P2]

4. **Ordering**:
   - Setup → Tests → Models → Services → Instrumentation → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] UX regression tasks present for each visual change
- [ ] Performance validation + telemetry tasks cover stated budgets
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task