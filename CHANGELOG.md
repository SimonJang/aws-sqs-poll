# Changelog

## 1.3.0

### Added

- Support standard and FIFO SQS queue names, including the 80-character total length limit.

### Fixed

- Stop requesting the unsupported `ApproximateNumberOfMessages` attribute in `ReceiveMessage`.
- Apply documented defaults when `timeout`, `numberOfMessages`, or `json` is explicitly `undefined`.
- Make defaulted TypeScript options optional and infer `Promise<unknown[]>` by default, while preserving the explicit generic as the complete result type.

### Validation changes

- Reject non-boolean `json` values and account IDs that are not twelve-digit strings, including empty strings, numbers, and `null`.
- Reject non-integer or out-of-range polling options before calling AWS: `timeout` must be 0–20 and `numberOfMessages` must be 1–10.
- Applications relying on previously tolerated invalid values should correct those inputs before upgrading.

### Maintenance

- Replace the legacy test and lint toolchain with Node's test runner and declaration checks under TypeScript 7.0.2 and 3.9.10.
- Remove the `is-aws-account-id` runtime dependency and obsolete toolchain dependencies.
- Update the development AWS SDK fixture to 2.1693.0 and modernize CI and package verification.

CommonJS, Node.js 10+, and the `aws-sdk` v2 peer range (`^2.709.0`) remain supported. AWS SDK v3 migration is outside this release.
