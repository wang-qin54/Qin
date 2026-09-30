Asset case study — local snapshots
==================================

These files are frozen copies of asset.html (the live page at /asset.html).
Use them to recover wording, layout, or CSS from an earlier pass without
digging through git history.

Snapshots
---------
asset-2026-09-30.html
  Lark-aligned gray summary (Outcome bullets, Target users, HK stocks).
  Intro synced with Lark (heading + three bullets; “Before I joined…”;
  bold 2 years / 3 months). Back link removed from hero. Outcome as
  bullet list in meta.

Git
---
The same state is recorded in git. To compare or restore:

  git log --oneline -- asset.html
  git show <commit>:asset.html
  git diff <commit> -- asset.html

To restore the whole file from this snapshot:

  cp exports/asset-redesign-snapshots/asset-2026-09-30.html asset.html

Or from git (after you find the snapshot commit hash):

  git checkout <commit> -- asset.html
