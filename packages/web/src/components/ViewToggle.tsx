import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NoteState } from '@stickies/core'

export type ViewFilter = 'all' | NoteState

interface ViewToggleProps {
  value: ViewFilter
  onChange: (value: ViewFilter) => void
  inboxCount: number
}

export function ViewToggle({ value, onChange, inboxCount }: ViewToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewFilter)}>
      <TabsList className="bg-secondary">
        <TabsTrigger value="all" className="data-[state=active]:bg-white">
          All
        </TabsTrigger>
        <TabsTrigger value="inbox" className="data-[state=active]:bg-white">
          Inbox
          {inboxCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background0 px-1.5 text-xs font-medium text-white">
              {inboxCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="active" className="data-[state=active]:bg-white">
          Active
        </TabsTrigger>
        <TabsTrigger value="archived" className="data-[state=active]:bg-white">
          Archived
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
