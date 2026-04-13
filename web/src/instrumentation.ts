/**
 * Server-side instrumentation hook
 * Note: Deprecation warnings from pg-connection-string (DEP0169) are suppressed
 * via NODE_NO_WARNINGS environment variable in package.json dev script
 */

export function register() {
  // No-op: instrumentation is handled by environment variable
}

