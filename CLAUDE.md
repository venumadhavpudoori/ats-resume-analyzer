# CLAUDE.md

Project context for Claude Code. Read this before making changes.

## Project

ResumeAI is a web app where job seekers upload a resume (PDF or DOCX), paste a job description, get an ATS compatibility score and a job match score, see keyword gaps, rewrite bullet points with AI, edit, and export PDF or DOCX. Full requirements are in the PRD; this file is the working summary.

## Architecture (MVP, keep it minimal)

- Frontend: Next.js + React + Tailwind CSS
- Backend: one FastAPI app, organized as modules (auth, resumes, analysis, ai, export), not microservices
- Database: PostgreSQL with SQLAlchemy + Alembic; JSONB for parsed resumes, score breakdowns and versions
- Storage: S3-compatible object storage, private, accessed via short-lived signed URLs
- AI: hosted LLM API; scoring is plain Python, never the LLM
- Async work: FastAPI BackgroundTasks or a Postgres-backed queue; client polls job status or reads SSE
- Deferred (do not add without asking): Celery, Redis, Sentence Transformers, admin panel, email verification, multiple templates

## Repo layout (suggested)

```
/frontend            Next.js app
/backend/app
    auth/  resumes/  analysis/  ai/  export/
    scoring/         deterministic rule-based scorers
    models/          SQLAlchemy models
    schemas/         Pydantic schemas (API + LLM output)
/backend/alembic     migrations
/backend/tests
```

## Commands (adjust to the real setup)

```
# backend
cd backend && uvicorn app.main:app --reload
pytest
alembic upgrade head

# frontend
cd frontend && npm run dev
npm run lint && npm test
```

## Scoring rules

- ATS compatibility score is out of 100: structure and formatting 25, section completeness 20, content readability 20, keyword alignment 20, file compatibility 15.
- Job match score: required skills 35, experience 25, projects and achievements 20, education and certifications 10, preferred skills 10.
- Scores must be deterministic and reproducible for the same input and config. Do not call an LLM to compute a score.
- Every deduction stores a plain-language explanation. Store breakdowns in JSONB.
- Never claim the score is a real employer ATS score or predicts hiring outcomes.
- A missing keyword is not proof the user lacks the skill. Show evidence for each match.

## AI / LLM rules

- Every LLM call returns JSON matching a Pydantic schema. Validate, retry once, then return a controlled error.
- Bullet rewriter must never invent metrics, achievements, responsibilities or technologies. If information is missing, ask the user for it.
- AI-generated text is labeled in the UI, and users accept, reject or edit it. Keep the original beside each suggestion.
- Never suggest adding skills the user does not have (for example: "add only if supported by actual experience").
- Rate limit AI endpoints, cache by content hash, log token usage.
- Do not log resume content or send it anywhere except the configured LLM provider.

## Security and privacy

- Hash passwords with a strong algorithm; JWT access + refresh tokens; HTTPS only in production.
- Every query filters by the authenticated user id. Cross-user access must be impossible and tested.
- Validate file type (magic bytes), size and content on upload. Reject scanned image-only PDFs with a clear message unless OCR is added.
- Private files only via signed URLs.
- Account deletion removes rows, uploaded files and exports.
- Resume content is not used for model training without user consent.

## Performance targets

- Resume parsing: 5 s or less. Full analysis: 15 s or less. Bullet rewrite: 10 s or less. Simple DB endpoints: about 500 ms.
- Show the deterministic ATS score first; stream LLM output; run resume parsing and JD parsing in parallel; cache repeated JDs.
- Autosave debounced (about 800 ms); resume preview rendered client-side.
- Lazy-load the editor and preview screens.

## Conventions

- Python: type hints, Pydantic v2 schemas, small functions, no business logic in route handlers.
- TypeScript: strict mode, no any, server state via a data-fetching library, forms validated with schemas.
- Migrations for every schema change. Never edit an applied migration.
- Errors return clear messages: what happened and what the user can do next.
- Tests: unit tests for each scorer, contract tests for LLM schemas, auth tests for data isolation.

## Definition of done

- Feature works end to end for the primary flow: upload, parse, review, analyze, optimize, edit, export.
- Tests and lint pass; no resume content in logs.
- Any new dependency or deferred component is justified in the PR description.
