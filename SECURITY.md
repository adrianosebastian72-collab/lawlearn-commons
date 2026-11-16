# Security policy

## Current beta scope

The 0.2.0-beta.1 deployment is a static website. It has no accounts, server-side database, AI endpoint, payment integration, analytics scripts, or file-upload server. Notes, subjects, tasks and saved cards stay in each learner's browser local storage. The hosting provider may process ordinary technical request data.

## Reporting a vulnerability

Please do not publish details of an exploitable security issue in a public discussion. Contact the project maintainer through the person who invited you to the beta until an official security contact is published. Do not include private student data or confidential legal material in a report.

## Before future features

Before adding accounts, APIs, AI providers, file storage, or shared content, the project must add authentication and authorization, server-side validation, CSRF protections where relevant, rate limiting, abuse prevention, secure secret management, dependency scanning, logging that avoids collecting study content, data retention/deletion controls, backups, and an independent security review. Never expose provider API keys in browser code or commit secrets.
