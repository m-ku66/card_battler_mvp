import { useEffect } from "react";
import { eventBus, EventCallback } from "../core/events/EventBus";
import { GameEventType, GameEventData } from "../core/events/Events";

export function useGameEvent<T extends GameEventType>(
  eventType: T,
  callback: EventCallback<GameEventData[T]>
) {
  useEffect(() => {
    const unsubscribe = eventBus.on(eventType, callback);
    return () => unsubscribe();
  }, [eventType, callback]);
}
