type Listener<T> = T extends void ? () => void : (data: T) => void

export class EventEmitter<EventMap extends Record<string, any>> {
  private events: {
    [K in keyof EventMap]?: Listener<EventMap[K]>[]
  } = {}

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(listener)
    console.log(`Event listener added for: ${String(event)}`)
    return () => this.off(event, listener)
  }

  emit<K extends keyof EventMap>(event: K, data?: EventMap[K]) {
    const listeners = this.events[event]
    if (listeners) {
      console.log(
        `Emitting event: ${String(event)}${data ? ` with data: ${JSON.stringify(data)}` : ''}`
      )
      listeners.forEach((listener) => {
        if (data === undefined) {
          ;(listener as () => void)()
        } else {
          ;(listener as (data: EventMap[K]) => void)(data)
        }
      })
    } else {
      console.log(`No listeners for event: ${String(event)}`)
    }
  }

  off<K extends keyof EventMap>(
    event: K,
    listenerToRemove: Listener<EventMap[K]>
  ) {
    const listeners = this.events[event]
    if (listeners) {
      const initialLength = listeners.length
      this.events[event] = listeners.filter(
        (listener) => listener !== listenerToRemove
      )
      const removedCount = initialLength - this.events[event]!.length
      console.log(
        `Removed ${removedCount} listener(s) for event: ${String(event)}`
      )
    } else {
      console.log(`No listeners to remove for event: ${String(event)}`)
    }
  }
}

export interface AppEvents {
  llmStart: void
  llmStop: void
  // 他のイベントタイプ...
}

export const appEventEmitter = new EventEmitter<AppEvents>()
