import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET
  },
  studioHost: process.env.SANITY_STUDIO_HOSTNAME,
  deployment: {autoUpdates: true},

  // Typegen für die Website: GROQ-Queries aus website/src, Ausgabe in
  // website/src/lib/sanity.types.ts (löst die alte sanity-typegen.json ab)
  typegen: {
    path: '../website/src/**/*.{ts,js}',
    schema: './schema.json',
    generates: '../website/src/lib/sanity.types.ts',
  },
})
