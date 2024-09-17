import { differenceInMinutes, getTime, endOfDay } from "date-fns";

// Import interfaces
import { Channel, Program, ProgramPosition } from "./interfaces";

// Import types
import { ProgramWithPosition, Position, DateTime } from "./types";

// Import variables
import { HOUR_IN_MINUTES } from "./variables";

// Import time helpers
import {
  formatTime,
  roundToMinutes,
  isYesterday as isYesterdayTime,
} from "./time";
import { getDate } from "./common";

// -------- Program width --------
const getItemDiffWidth = (diff: number, hourWidth: number) =>
  (diff * hourWidth) / HOUR_IN_MINUTES;

export const getPositionX = (
  since: DateTime,
  till: DateTime,
  startDate: DateTime,
  endDate: DateTime,
  hourWidth: number,
  itemIndex?: number,
  itemWidth?: number,
) => {
  if (itemWidth && (itemIndex || itemIndex === 0)) {
    return itemWidth * itemIndex;
  }

  const isTomorrow = getTime(getDate(till)) > getTime(getDate(endDate));
  const isYesterday = getTime(getDate(since)) < getTime(getDate(startDate));

  // When time range is set to 1 hour and program time is greater than 1 hour
  if (isYesterday && isTomorrow) {
    const diffTime = differenceInMinutes(
      roundToMinutes(getDate(endDate)),
      getDate(startDate)
    );
    return getItemDiffWidth(diffTime, hourWidth);
  }

  if (isYesterday) {
    const diffTime = differenceInMinutes(
      roundToMinutes(getDate(till)),
      getDate(startDate)
    );
    return getItemDiffWidth(diffTime, hourWidth);
  }

  if (isTomorrow) {
    const diffTime = differenceInMinutes(
      getDate(endDate),
      roundToMinutes(getDate(since))
    );

    if (diffTime < 0) return 0;
    return getItemDiffWidth(diffTime, hourWidth);
  }

  const diffTime = differenceInMinutes(
    roundToMinutes(getDate(till)),
    roundToMinutes(getDate(since))
  );

  return getItemDiffWidth(diffTime, hourWidth);
};

// -------- Channel position in the Epg --------
export const getChannelPosition = (
  channelIndex: number,
  itemHeight: number
) => {
  const top = itemHeight * channelIndex;
  const position = {
    top,
    height: itemHeight,
  };
  return position;
};
// -------- Program position in the Epg --------
export const getProgramPosition = ({
  program,
  nextProgram,
  channelIndex,
  itemIndex,
  itemWidth,
  itemHeight,
  hourWidth,
  startDate,
  endDate,
  sinceMapKey = 'since',
  tillMapKey = 'till',
}: ProgramPosition) => {
  let since = program[sinceMapKey];
  let till = program[tillMapKey];

  if (!till && !nextProgram) {
    till = endOfDay(new Date(since));
  }

  const item = {
    ...program
  };

  if (program.isEmpty) {
    if (!itemWidth) {
      itemWidth = 200
    }

    const position = {
      width: itemWidth,
      height: itemHeight,
      top: itemHeight * channelIndex,
      left: 0,
      edgeEnd: itemWidth,
    };

    return { position, data: item };
  } else {
    item.since = formatTime(since);
    item.till = formatTime(till);
  }

  const isYesterday = isYesterdayTime(item.since, startDate);

  let width = itemWidth || getPositionX(
    item.since,
    item.till,
    startDate,
    endDate,
    hourWidth
  );

  const top = itemHeight * channelIndex;
  let left = getPositionX(startDate, item.since, startDate, endDate, hourWidth, itemIndex, itemWidth);
  const edgeEnd = getPositionX(
    startDate,
    item.till,
    startDate,
    endDate,
    hourWidth,
    itemIndex + 1,
    itemWidth
  );

  if (isYesterday) left = 0;
  // If item has negative top position, it means that it is not visible in this day
  if (top < 0) width = 0;

  const position = {
    width,
    height: itemHeight,
    top,
    left,
    edgeEnd,
  };

  return { position, data: item };
};

// -------- Converted programs with position data --------
interface ConvertedPrograms {
  data: Program[];
  channels: Channel[];
  startDate: DateTime;
  endDate: DateTime;
  itemWidth?: number;
  itemHeight: number;
  hourWidth: number;
  channelMapKey?: string;
  programChannelMapKey?: string;
  sinceMapKey?: string;
  tillMapKey?: string;
  isRow?: boolean;
}

export const getConvertedPrograms = ({
  data,
  channels,
  startDate,
  endDate,
  itemWidth,
  itemHeight,
  hourWidth,
  channelMapKey = 'uuid',
  programChannelMapKey = 'channelUuid',
  sinceMapKey,
  tillMapKey,
  // isRow
}: ConvertedPrograms) => {
  let itemIndex = 0;

  return data.map((program, index) => {
    const channelIndex = channels.findIndex(
      (channel) => channel[channelMapKey] === program[programChannelMapKey]
    );

    const prevProgram = data[index - 1];
    const nextProgram = data[index + 1];
    const isPrevSameChannel = prevProgram && (prevProgram[programChannelMapKey] === program[programChannelMapKey]);
    const isNextSameChannel = nextProgram && (nextProgram[programChannelMapKey] === program[programChannelMapKey]);

    itemIndex = isPrevSameChannel ? itemIndex + 1 : 0;

    // console.log('itemIndex', isPrevSameChannel, prevProgram, itemIndex)

    return getProgramPosition({
      program,
      nextProgram: isNextSameChannel ? nextProgram : undefined,
      channelIndex,
      itemIndex,
      itemWidth,
      itemHeight,
      hourWidth,
      startDate,
      endDate,
      sinceMapKey,
      tillMapKey,
    });
  }, [] as ProgramWithPosition[])
};

// -------- Converted channels with position data --------
export const getConvertedChannels = (channels: Channel[], itemHeight: number) =>
  channels.map((channel, index) => ({
    ...channel,
    position: getChannelPosition(index, itemHeight),
  }));

// -------- Dynamic virtual program visibility in the EPG --------
export const getItemVisibility = (
  position: Position,
  scrollY: number,
  scrollX: number,
  containerHeight: number,
  containerWidth: number,
  itemOverscan: number
) => {
  if (position.width <= 0) {
    return false;
  }

  if (scrollY > position.top + itemOverscan * 3) {
    return false;
  }

  if (scrollY + containerHeight <= position.top) {
    return false;
  }

  if (
    scrollX + containerWidth >= position.left &&
    scrollX <= position.edgeEnd
  ) {
    return true;
  }

  return false;
};

export const getSidebarItemVisibility = (
  position: Pick<Position, "top">,
  scrollY: number,
  containerHeight: number,
  itemOverscan: number
) => {
  if (scrollY > position.top + itemOverscan * 3) {
    return false;
  }

  if (scrollY + containerHeight <= position.top) {
    return false;
  }

  return true;
};
