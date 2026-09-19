# AI Interviewer

An adaptive AI-powered mock interview platform. Instead of asking a fixed list of questions, it evaluates each answer in real time and decides what to do next — ask a targeted follow-up, raise or lower difficulty, or move on — the way a real interviewer would.

**[Live demo](https://ai-interviewer-eta-three.vercel.app/)**

## What makes this different

Most AI interview tools are a thin wrapper around a chat model. This one is a stateful agent with an explicit decision engine:

```
Question → Candidate Answer → Structured Evaluation → Decision → Next Action → Repeat
```

Every answer is scored on correctness, completeness, technical depth, and clarity via a structured (JSON-schema-enforced) LLM call — never free-form text parsing. The evaluation feeds a rule-based decision function that adjusts difficulty, generates a context-aware follow-up, or ends the interview, and every step is logged for observability.

## Core features

- **Adaptive difficulty** — a four-tier ladder (Easy → Expert) that moves based on explicit, tunable scoring thresholds, not vibes
- **Context-aware follow-ups** — when an answer is incomplete, the next question specifically probes what was missing, not a generic new question
- **Specialized skills** — pluggable domain modules (currently OOP and DBMS) that inject expert-level question and evaluation guidance, so questions favor real trade-off reasoning over textbook definitions
- **Resume grounding** — upload a resume and get questions that reference real projects and technologies, with a strict anti-hallucination rule preventing the model from inventing implementation details not actually in the resume
- **Final reports** — a synthesized (not just averaged) performance report across the whole interview, with strengths, weaknesses, and a concrete study plan
- **Observability** — every LLM call is logged with latency, token usage, and success/failure, independent of any third-party tracing tool
- **AI evaluation suite** — a small, repeatable eval dataset (`npm run eval`) that checks the evaluator's scoring consistency across strong, weak, off-topic, and placeholder answers

## Tech stack

- **Frontend/Backend:** Next.js (App Router), TypeScript
- **Database:** PostgreSQL (Supabase) via Prisma ORM
- **Auth:** Auth.js (credentials provider, JWT sessions)
- **AI:** Groq (OpenAI-compatible API), structured JSON-schema outputs
- **Testing:** Vitest (unit tests on the decision engine), a custom eval harness for LLM output quality
- **Deployment:** Vercel

## Architecture

```
Next.js UI
    ↓
API Routes
    ↓
Interview Engine (question generation, evaluation, decision logic)
    ↓        ↓            ↓
Skills   Resume       Report
Registry Grounding    Generator
    ↓
PostgreSQL (Prisma)
```

The interview engine is a hand-rolled state machine rather than a heavier agent framework — the workflow is a bounded set of transitions (follow-up, harder, easier, end), which doesn't need graph-based orchestration to reason about correctly, and is easier to unit test as a result.

## Running locally

```bash
npm install
npx prisma migrate dev
npm run dev
```

Requires a `.env` file with `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `GROQ_API_KEY`.

## Testing

```bash
npm run test   # unit tests on the adaptive decision logic
npm run eval   # AI evaluation suite — checks evaluator scoring consistency
```