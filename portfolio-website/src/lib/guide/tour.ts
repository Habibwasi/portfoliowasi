/** The 30-second tour (3.2) as a small state machine; the panel runs the timer and the scrolling. */
export type TourState = { status: "idle" | "running" | "paused"; step: number };

export type TourAction = { type: "start" | "next" | "previous" | "tick" | "pause" | "resume" | "stop"; stops: number };

export const initialTour: TourState = { status: "idle", step: 0 };

export function tourReducer(state: TourState, { type, stops }: TourAction): TourState {
  const last = stops - 1;
  switch (type) {
    case "start":
      return { status: "running", step: 0 };
    case "stop":
      return initialTour;
    case "pause":
      return state.status === "running" ? { ...state, status: "paused" } : state;
    case "resume":
      return state.status === "paused" ? { ...state, status: "running" } : state;
    case "next":
      return state.status === "idle" ? state : { ...state, step: Math.min(state.step + 1, last) };
    case "previous":
      return state.status === "idle" ? state : { ...state, step: Math.max(state.step - 1, 0) };
    case "tick":
      // Auto-advance only while running; after the last stop the tour ends.
      if (state.status !== "running") return state;
      return state.step >= last ? initialTour : { ...state, step: state.step + 1 };
  }
}
