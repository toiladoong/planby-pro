// Interfaces
import { Program, Channel } from "./interfaces";

export type Position = {
  width: number;
  height: number;
  top: number;
  left: number;
  edgeEnd: number;
  index?: number;
};

export type ProgramWithPosition = {
  position: Position;
  data: Program;
};

export type ProgramItem = {
  position: Omit<Position, "edgeEnd">;
  data: Program;
};

export type ChannelWithPosition = Channel & {
  position: Pick<Position, "top" | "height">;
};

export type DateTime = string | Date;

export type BaseTimeFormat = boolean;
