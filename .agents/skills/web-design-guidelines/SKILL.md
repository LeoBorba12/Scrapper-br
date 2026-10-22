---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch or read the latest guidelines (cached in `scratch/web-interface-guidelines.md` or from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`)
2. Read the specified files in the project
3. Check against all rules in the guidelines:
   - Accessibility & ARIA labels
   - Keyboard navigation & Focus management
   - Contrast & Color semantics
   - Form controls & Input states
   - Responsiveness & Touch targets (44px min)
   - Motion & `prefers-reduced-motion`
4. Output findings in the terse `file:line` format with severity and concrete recommendation.
