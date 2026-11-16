# LawLearn Commons

**Understand the law. Learn it together.**

LawLearn Commons is an open-source legal learning workspace. This first public beta is South Africa-first and is intended for a small group of learners to test the free, browser-based study tools.

> Educational tool only. It is not a law firm, legal practitioner, university, court, government service, or official legal database. It does not provide legal advice.

## Public beta features

- Responsive dashboard and editable subjects/modules.
- Quick extractive summary: selects key sentences from text supplied by the learner. It is not a fact-checking or legal analysis service.
- Case brief worksheet to organise facts, issues, outcome, reasoning, principles and exam relevance from the learner's own reading.
- Local flashcards and simple recall quizzes based on text supplied by the learner. Review every question and answer against the original study material.
- Personal notebook, task planner, JSON export and clear-data control.
- Directory of external South African legal information resources. Links open external sources; the application does not crawl or copy their content.

## Important beta limits

- **AI is disabled.** No Claude, Gemini, Together, OpenAI or other model API is connected. No study material is sent to an AI provider.
- No student accounts, passwords, shared workspaces, central database or cloud sync. Each learner's notes, subjects, flashcards and tasks are stored only in that learner's current browser using local storage.
- Data does not move between devices or browsers. Use the export function to save a backup.
- No automatic PDF extraction. Learners can paste selectable text or load a `.txt` / `.md` file.
- No live legal research search, citation verification, legislation amendment tracking or completeness guarantee.
- The public beta URL is not restricted to exactly 20 people. Invite 20 testers, but anyone who gets the public URL may open it. Do not treat it as a private portal.

## Privacy and safe use

This beta does not ask for a name, email address, student number or password. The app has no analytics and no forms that submit learner notes to our server. Study data is stored in the local browser on the current device. The hosting provider may still process basic technical request information under its own terms. Navigation to an external legal resource takes the learner to that external website, which applies its own privacy rules.

Do not enter privileged, confidential client information, identity numbers, passwords or sensitive personal information. Avoid using a shared or public computer. Export a backup before clearing site data or changing devices. See [Privacy notice](public/privacy.html) and [Beta tester guide](public/beta-guide.html).

## Run locally

Requirements: Node.js 20 or newer. The app uses only Node.js built-ins.

```bash
npm start
```

Open <http://localhost:3000>.

Run tests:

```bash
npm test
```

Build the static Cloudflare Pages beta bundle:

```bash
npm run build:beta
```

This creates a `dist/` folder containing static files only. Upload the contents of `dist/` to a static hosting service. It has no backend and no AI endpoint.

## Deploy to Cloudflare Pages (direct upload)

1. Create or sign in to a Cloudflare account.
2. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
3. Choose **Create application** / **Pages** / **Direct Upload** (wording may vary).
4. Name the project, for example `lawlearn-commons-beta`.
5. Upload the `dist/` folder or the supplied `lawlearn-commons-beta-upload.zip`.
6. Choose **Deploy site**. Cloudflare will provide a `*.pages.dev` URL.

Cloudflare Direct Upload supports a ZIP or folder of prebuilt assets. A Direct Upload project cannot later be converted in place to Git integration; create a separate project if you later want automatic Git deployments. Review current provider limits and terms before launch.

## Open source

The project uses the MIT License. This allows use, modification and redistribution, including commercial reuse, subject to keeping the copyright and licence notices. Read [LICENSE](LICENSE).

## Legal resources and content permissions

The initial interface links to external sources. It does not scrape, bulk-download, embed or re-publish third-party legal material. Publicly viewable material is not automatically available for bulk reuse. In particular, do not ingest SAFLII content into AI retrieval, embeddings, training or automated research without written permission under SAFLII's terms. Before adding any source, review its access, licence and reuse terms.

For future source connectors, preserve jurisdiction, issuing court/authority, case citation or Act identifier, URL, publication date, commencement date where available, retrieved date, version, paragraph/section reference and reuse permission. Never label a legal text current without a monitored update process.

## Community and project guidance

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SECURITY.md](SECURITY.md), [ROADMAP.md](ROADMAP.md), [docs/LEGAL_SOURCES.md](docs/LEGAL_SOURCES.md) and [docs/AI_SAFETY.md](docs/AI_SAFETY.md).
