# Anti-patterns

## Present in the codebase
- Business rules enforced only in the frontend without a backend revalidation path.
- Secret or sensitive information indirectly exposed through share URLs.
- Mixed responsibility service files that combine active code and legacy code.
- Type models that do not match the real runtime objects.

## Why they matter
- They make regressions easy to introduce.
- They increase the chance that a change in one place silently breaks another flow.
- They hide important rules from future maintainers.
- They make type checking less useful than it should be.
