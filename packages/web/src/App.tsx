import { VERSION } from '@stickies/core'

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
      <p className="text-amber-700">Quick notes, AI organized. v{VERSION}</p>
    </div>
  )
}
