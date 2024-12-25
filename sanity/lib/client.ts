import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'uxrqx9js',
  dataset: 'main',
  apiVersion: '2024-02-14',
  useCdn: false,
}) 