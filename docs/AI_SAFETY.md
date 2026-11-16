# AI safety and legal accuracy (future phase)

AI is **disabled** in the current public beta. No model provider receives learner prompts or study material.

Before enabling any AI feature, the project must implement and test:

- A provider-independent server-side model adapter. Never expose provider keys in browser code.
- A jurisdiction-specific source retrieval system using only sources for which reuse and automated-processing permissions have been checked.
- Source provenance for every retrieved text: publisher, URL, identifier/citation, section or paragraph, publication/version date, retrieval date and reuse permission.
- Currentness checks for legislation, including amendments, commencement, repeal and transitional provisions.
- Case citation and paragraph verification against an authorised source.
- Strict separation between primary source text, learner-uploaded material and generated explanation.
- Refusal or uncertainty responses when sources are missing, conflicting, stale or not legally reusable.
- Prompt-injection defence: retrieved documents and uploaded content are untrusted data, never instructions.
- Per-user and global token budgets, rate limits, provider spend alerts and a kill switch.
- Retention minimisation, user consent, deletion/export, access controls and a POPIA review.
- Evaluation by qualified South African legal educators/practitioners, including tests for invented authorities, wrong sections, stale law, conflicting decisions and unsupported answers.

No AI system can guarantee perfect legal accuracy. It must not be represented as a legal practitioner, official legal database or substitute for legal advice.
