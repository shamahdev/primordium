# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues in `shamahdev/primordium`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --repo shamahdev/primordium --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --repo shamahdev/primordium --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --repo shamahdev/primordium --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --repo shamahdev/primordium --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --repo shamahdev/primordium --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --repo shamahdev/primordium --comment "..."`

If a GitHub remote is configured later, `gh` can infer the repo automatically when run inside this clone. Until then, include `--repo shamahdev/primordium`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `shamahdev/primordium`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --repo shamahdev/primordium --comments`.
