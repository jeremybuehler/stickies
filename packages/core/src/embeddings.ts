import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers'

let extractor: FeatureExtractionPipeline | null = null

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }
  return extractor
}

export async function generateEmbedding(text: string): Promise<Float32Array> {
  const ext = await getExtractor()
  const output = await ext(text, { pooling: 'mean', normalize: true })
  return output.data as Float32Array
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
  }
  return dot // Already normalized
}
