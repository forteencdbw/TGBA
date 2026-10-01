# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the
label strings this repo actually uses.

This repo has no hosted tracker label system: a label is the literal `Status:` value written
near the top of an issue file in `.scratch/<feature-slug>/issues/`. Use one of these strings
exactly, and keep the role names in prose.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding
label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.
