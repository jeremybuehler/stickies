import { pipeline, env } from '@huggingface/transformers'

// Configure for browser: use remote models from HuggingFace Hub CDN
env.allowLocalModels = false
env.useBrowserCache = true
env.remoteHost = 'https://huggingface.co'
env.remotePathTemplate = '{model}/resolve/{revision}/'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null
let loadingPromise: Promise<any> | null = null
let loadFailed = false

async function getExtractor() {
  if (loadFailed) throw new Error('Model loading previously failed')
  if (extractor) return extractor

  // Prevent multiple simultaneous loads
  if (loadingPromise) return loadingPromise

  console.log('[Embeddings] Loading model from Hugging Face Hub...')

  loadingPromise = (pipeline as any)(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    { dtype: 'fp32' }
  ).then((ext: any) => {
    console.log('[Embeddings] Model loaded successfully')
    extractor = ext
    return ext
  }).catch((err: Error) => {
    console.error('[Embeddings] Model loading failed:', err.message)
    loadFailed = true
    loadingPromise = null
    throw err
  })

  return loadingPromise
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
