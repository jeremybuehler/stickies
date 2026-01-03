import { describe, it, expect } from 'vitest'
import { generateEmbedding } from './embeddings'

describe('Embeddings', () => {
  it('should generate an embedding vector', async () => {
    const vector = await generateEmbedding('Hello world')
    expect(vector).toBeInstanceOf(Float32Array)
    expect(vector.length).toBeGreaterThan(0)
  }, 30000) // Allow time for model download
})
