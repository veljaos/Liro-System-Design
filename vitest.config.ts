import { defineConfig } from 'vitest/config'

/**
 * A single config file for the whole monorepo.
 *
 * Only pure functions are tested - the ones that quietly corrupt data and
 * that go unnoticed until it's too late. Components are checked with screen
 * snapshots (Playwright), not unit tests: a DOM test of a component mostly
 * verifies that Mantine still works, which is not our job.
 */
export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
  },
})