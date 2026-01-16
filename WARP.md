# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository state

As of now, this repository contains only the Git metadata directory (`.git`) and no project files (no source, configuration, or documentation files like `README.md`). There is not yet an established language, framework, or build/test tooling.

Future Warp agents should not assume any particular technology stack or commands until project files are added.

## Guidance for future Warp agents

### 1. Re-scan the repository once files exist

Before making changes or answering project-specific questions:
- List the top-level files and directories in the repo.
- Look specifically for:
  - A `README` or other documentation describing the project
  - Language/tooling indicators such as `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `.sln`/`.csproj`, `Dockerfile`, etc.
  - Any existing `WARP.md`, `CLAUDE.md`, `.cursor` rules, or Copilot instruction files that might be added later.

Update this `WARP.md` to document the actual tech stack, build, lint, and test commands once they are known.

### 2. Build, lint, and test commands

Because no project configuration is present yet, there are no canonical commands to:
- Build the project
- Run linters or formatters
- Run the test suite or a single test

When such tooling is introduced (for example via `npm`, `pip/pytest`, `cargo`, etc.), add a section here that records:
- How to set up the development environment (tool versions, prerequisite services)
- How to build the project end-to-end
- How to run all tests
- How to run a single test or a filtered subset of tests

Until then, ask the user directly which tools and commands they are using before proposing concrete build/test instructions.

### 3. High-level architecture

There is currently no source code in the working tree, so there is no architecture to document yet.

Once code exists, future Warp agents should:
- Identify the main entrypoints (e.g., CLI binaries, web server startup modules, or application `main` files).
- Map out the primary modules/packages and how they depend on each other.
- Note any key integration points (databases, external APIs, background workers, etc.).

Summarize that high-level structure here so that later agents can quickly orient themselves.
