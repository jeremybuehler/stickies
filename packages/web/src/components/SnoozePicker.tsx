import { useState } from 'react'
import { Clock, Calendar as CalendarIcon, Sun, CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'

interface Props {
  trigger: React.ReactNode
  onSelect: (date: Date) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function getQuickOptions(): { label: string; icon: React.ReactNode; getDate: () => Date }[] {
  return [
    {
      label: 'Tomorrow 9am',
      icon: <Sun className="h-4 w-4" />,
      getDate: () => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(9, 0, 0, 0)
        return date
      },
    },
    {
      label: 'In 3 days',
      icon: <Clock className="h-4 w-4" />,
      getDate: () => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(9, 0, 0, 0)
        return date
      },
    },
    {
      label: 'Next week',
      icon: <CalendarDays className="h-4 w-4" />,
      getDate: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        date.setHours(9, 0, 0, 0)
        return date
      },
    },
  ]
}

export function SnoozePicker({ trigger, onSelect, open, onOpenChange }: Props) {
  const [showCalendar, setShowCalendar] = useState(false)
  const quickOptions = getQuickOptions()

  const handleQuickSelect = (getDate: () => Date) => {
    onSelect(getDate())
    onOpenChange?.(false)
    setShowCalendar(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set time to 9am
      date.setHours(9, 0, 0, 0)
      onSelect(date)
      onOpenChange?.(false)
      setShowCalendar(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen)
    if (!newOpen) {
      setShowCalendar(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {showCalendar ? (
          <div className="p-2">
            <div className="mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(false)}
                className="text-xs text-muted-foreground"
              >
                Back to quick options
              </Button>
            </div>
            <Calendar
              mode="single"
              onSelect={handleDateSelect}
              disabled={(date: Date) => date < new Date()}
              initialFocus
            />
          </div>
        ) : (
          <div className="p-2 space-y-1">
            <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              Snooze until...
            </p>
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                variant="ghost"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => handleQuickSelect(option.getDate)}
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
            <div className="border-t my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => setShowCalendar(true)}
            >
              <CalendarIcon className="h-4 w-4" />
              Pick a date...
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
