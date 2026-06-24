---
description: "Use when writing or reviewing code that handles user input, database queries, file operations, session management, XML parsing, or HTTP requests. Covers OWASP vulnerabilities: XSS, SQL injection, CSRF, command injection, path traversal, session security, XXE, file inclusion."
applyTo: "**/*.{ts,tsx,js,jsx,py,java,cs,go,rb,php}"
---
# Secure Development Guidelines

Prevent common software security vulnerabilities (OWASP Top 10 and beyond) in every code change.

## Cross-Site Scripting (XSS)

### Reflected XSS
- Never echo user input directly in HTTP responses.
- Apply context-aware output encoding (HTML, JS, URL, CSS) before rendering any user-supplied data.
- Use framework auto-escaping (React JSX, Angular templates, Go `html/template`). Never bypass it (`dangerouslySetInnerHTML`, `[innerHTML]`, `{!! !!}`) unless sanitized first.

### Stored XSS
- Sanitize user input on **write** (allowlist safe HTML tags/attributes with a library like DOMPurify) and encode on **read/render**.
- Treat all data from the database as untrusted — it may have been written before sanitization was added.

### DOM-based XSS
- Never pass user-controlled values to dangerous sinks: `innerHTML`, `outerHTML`, `document.write()`, `eval()`, `setTimeout(string)`, `Function(string)`.
- Use safe alternatives: `textContent`, `createElement`, `setAttribute` with validated values.
- Validate and sanitize data from `location.*`, `document.referrer`, `window.name`, URL fragments, and `postMessage` events.

### General XSS Defenses
- Set `Content-Security-Policy` headers (restrict `script-src`, disable `unsafe-inline`/`unsafe-eval`).
- Set `X-Content-Type-Options: nosniff` to prevent MIME-type sniffing.
- Use `HttpOnly` and `Secure` flags on session cookies.

## Injection Attacks

### SQL Injection (In-Band and Blind)
- **Always** use parameterized queries or prepared statements. Never concatenate user input into SQL strings.
- Use ORM query builders with parameter binding (e.g., Prisma, SQLAlchemy, Entity Framework).
- Apply least-privilege database accounts — no `DROP`, `ALTER`, or `GRANT` for application users.
- Validate and allowlist dynamic identifiers (table/column names) — they cannot be parameterized.

```typescript
// ✅ Parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ String concatenation — vulnerable
const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

### OS Command Injection
- Avoid executing shell commands with user input entirely.
- If unavoidable, use parameterized APIs (e.g., `child_process.execFile` with args array, not `exec` with string).
- Allowlist permitted values — never rely on blocklists or escaping alone.
- Never pass user input to `eval()`, `system()`, `exec()`, `popen()`, or shell interpolation.

```typescript
// ✅ Safe — arguments passed as array, no shell interpretation
execFile('convert', [inputFile, outputFile]);

// ❌ Vulnerable — user input in shell string
exec(`convert ${inputFile} ${outputFile}`);
```

### XML External Entities (XXE)
- Disable external entity processing and DTD loading in all XML parsers.
- Use JSON instead of XML when possible.
- If XML is required, configure the parser securely:

```java
// Java example
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

## File Inclusion and Path Traversal

### Remote File Inclusion (RFI)
- Never use user input to construct URLs for `include`, `require`, `import`, `fetch`, or file-loading functions.
- Allowlist permitted remote sources if dynamic loading is required.
- Disable `allow_url_include` / `allow_url_fopen` in PHP configurations.

### Local File Inclusion (LFI)
- Never use user input directly in file include/require paths.
- Maintain an allowlist map of permitted files/modules.
- Avoid dynamic `require()` or `import()` with user-controlled values.

### Path Traversal
- Resolve the canonical/absolute path and verify it stays within the intended base directory.
- Reject input containing `..`, `%2e%2e`, null bytes, or encoding variants.
- Use framework-provided safe file-serving methods (e.g., `express.static`, `send` with root option).

```typescript
// ✅ Safe — resolve and validate against base directory
const safePath = path.resolve(BASE_DIR, userInput);
if (!safePath.startsWith(BASE_DIR)) {
  throw new ForbiddenError('Invalid file path');
}
```

## Cross-Site Request Forgery (CSRF)
- Require anti-CSRF tokens on all state-changing requests (POST, PUT, DELETE).
- Use `SameSite=Strict` or `SameSite=Lax` on session cookies.
- Verify `Origin` and `Referer` headers on sensitive endpoints.
- Do not rely solely on cookies for authentication in APIs — use `Authorization` headers with tokens.

## Session Security

### Session Expiration
- Set absolute session timeouts (e.g., 8 hours) and idle timeouts (e.g., 30 minutes).
- Invalidate sessions server-side on logout — do not rely on client-side cookie deletion alone.
- Implement server-side session stores with TTL enforcement.

### Session Identifier Prediction
- Use cryptographically secure random generators for session IDs (e.g., `crypto.randomBytes`, `secrets.token_hex`).
- Session IDs must have at least 128 bits of entropy.
- Never use sequential, timestamp-based, or predictable values as session identifiers.

### Session Fixation
- **Always regenerate the session ID** after successful authentication.
- Invalidate any pre-authentication session tokens.
- Reject session IDs supplied via URL parameters — only accept from secure cookies.

```typescript
// ✅ Regenerate session after login
req.session.regenerate((err) => {
  req.session.userId = authenticatedUser.id;
});
```

## Quick Checklist

| Threat | Primary Defense |
|--------|----------------|
| Reflected/Stored XSS | Context-aware output encoding + CSP |
| DOM-based XSS | Avoid dangerous sinks, use `textContent` |
| SQL Injection | Parameterized queries only |
| OS Command Injection | Avoid shell; use execFile with args array |
| XXE | Disable DTD and external entities |
| CSRF | Anti-CSRF tokens + SameSite cookies |
| RFI / LFI | Allowlist includes, no user input in paths |
| Path Traversal | Resolve + validate against base directory |
| Session Expiration | Server-side TTL + idle timeout |
| Session ID Prediction | Crypto-random IDs, ≥128-bit entropy |
| Session Fixation | Regenerate session ID after authentication |
