import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  // Build-Artefakte und Abhängigkeiten nicht linten
  {ignores: ['dist/**', 'node_modules/**', 'backups/**']},
]
