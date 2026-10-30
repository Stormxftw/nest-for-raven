/** Only test the custom UI; the untouched upstream checkout has its own harness. */
import {defineConfig} from 'vitest/config'
export default defineConfig({test: {include: ['src/**/*.test.ts']}})
