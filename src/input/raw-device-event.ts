export type SteeringSide = "LEFT" | "RIGHT";
export type InputReleaseReason =
  | "POINTER_RELEASE"
  | "BLUR"
  | "VISIBILITY_HIDDEN"
  | "PAGE_HIDE"
  | "VIEWPORT_CHANGE"
  | "DISPOSE";

interface RawDeviceEventBase {
  readonly timestampMs: number;
  readonly sequence: number;
  readonly sourceId: string;
}

export interface SteeringButtonEvent extends RawDeviceEventBase {
  readonly kind: "STEERING_BUTTON";
  readonly side: SteeringSide;
  readonly pressed: boolean;
}

export interface ReleaseAllEvent extends RawDeviceEventBase {
  readonly kind: "RELEASE_ALL";
  readonly reason: InputReleaseReason;
}

export type RawDeviceEvent = SteeringButtonEvent | ReleaseAllEvent;
