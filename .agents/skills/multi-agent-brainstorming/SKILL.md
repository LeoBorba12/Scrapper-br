---
name: multi-agent-brainstorming
description: "Simulate a structured peer-review process using multiple specialized agents to validate designs, surface hidden assumptions, and identify failure modes before implementation."
risk: none
source: sickn33/agentic-awesome-skills
date_added: "2026-10-31"
---

# Multi-Agent Brainstorming (Structured Design Review)

## Purpose

Transform a single-agent design into a **robust, review-validated design** by simulating a formal peer-review process using multiple constrained agents.

This skill exists to:
- surface hidden assumptions
- identify failure modes early
- validate non-functional constraints (ex: Vercel 94MB limit, WCAG AA, latency)
- stress-test designs before implementation
- prevent idea swarm chaos

This is **not parallel brainstorming**.
It is **sequential design review with enforced roles**.

---

## Agent Roles (Non-Negotiable)

Each agent operates under a **hard scope limit**.

### 1️⃣ Primary Designer (Lead Agent)
- Owns the design
- Runs the standard `brainstorming` skill
- Maintains the Decision Log
- May revise designs based on feedback
- May NOT self-approve the final design

### 2️⃣ Skeptic / Challenger Agent
- Assume the design will fail
- Identify weaknesses, edge cases, and risks
- Question assumptions and flag YAGNI violations
- Prompting guidance: "Assume this design fails in production or corrupts SQLite data. Why?"

### 3️⃣ Constraint Guardian Agent
- Enforce non-functional and real-world constraints:
  - SQLite storage <= 94.0 MB (teto Vercel)
  - 100% PT-BR language & WCAG 2.2 AA (contrast >= 4.5:1)
  - Latency and Memory in Oracle VM (RAM <= 850M)
  - Regression gates: 22/22 pytest in tests/test_model_evals.py

### 4️⃣ User Advocate Agent
- Represent the football fan, bettor, or analyst
- Focus on clarity of stats, honest labeling (ex: "Jogos c/ Gol" vs total games), and microinteractions

---

## Operating Protocol

1. **Intake Design:** Primary Designer shares the design spec + Decision Log.
2. **Review Cycles:** Reviewers critique strictly within their mandates.
3. **Synthesis:** Lead Designer addresses all actionable objections or updates assumptions.
4. **Verdict Gate:** The review must conclude with `APPROVED`, `REVISE`, or `REJECT` before any implementation code is generated.
