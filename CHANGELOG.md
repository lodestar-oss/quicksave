# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [SemVer](https://semver.org/) (breaking changes may land in minor bumps while on 0.x).

## [0.2.0] - 2026-10-28

### Added

- `-s, --staged`: commit message from what's already staged. Nothing gets staged for you.
- `-a, --all`: stage everything (including new files) first, with no prompt.
- `-C, --cwd`: run against a different directory.
- Index rollback: if you reject the generated message, cancel the prompt, or the diff turns out empty, the changes quicksave staged are unstaged again. Anything you staged yourself is left alone.

### Changed

- **Behavior change:** running with no flags in a terminal now asks before staging unstaged changes. 0.1.0 staged everything silently.
- Non-interactive runs (no TTY) now require `--staged` or `--all`.
- `--staged` and `--all` can't be combined.
- `--version` is now read from `package.json`, so it can't drift from the published version.

### Known issues

- If the LLM call or a commit hook fails, the index is not restored. Run `git restore --staged :/` to undo.
- No diff size cap yet, so very large diffs can hit Groq limits.
- A missing or malformed `GROQ_API_KEY` surfaces as a raw validation error.

## [0.1.0] - 2026-10-27

First release.

- Generates a Conventional Commits message from the staged diff using `openai/gpt-oss-20b` on Groq.
- Stages all changes (`git add -A`), shows the message, and asks before committing.
- Lockfiles are excluded from the diff sent to the model.
- Installs two commands: `quicksave` and `qs`.
- Published as `@lodestar-oss/quicksave` (unscoped `quicksave` was blocked by npm's similarity check).
