import { createClient } from '@sanity/client'

export const client = createClient({
    projectId: import.meta.env.SANITY_STUDIO_PROJECT_ID,
    dataset: import.meta.env.SANITY_STUDIO_DATASET,
    useCdn: false,
    apiVersion: '2024-10-01',
});

export default client;