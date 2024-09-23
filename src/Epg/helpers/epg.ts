import { differenceInMinutes, getTime, endOfDay } from "date-fns";

// Import interfaces
import { Channel, Program, ProgramPosition, ChannelPosition, Theme } from "./interfaces";

// Import types
import { ProgramWithPosition, Position, DateTime, ProgramItem } from "./types";

// Import variables
import { HOUR_IN_MINUTES } from "./variables";

// Import time helpers
import {
  formatTime,
  roundToMinutes,
  // isYesterday as isYesterdayTime,
} from "./time";
import { getDate } from "./common";

// -------- Program width --------
const getItemDiffWidth = (diff: number, hourWidth: number) =>
  (diff * hourWidth) / HOUR_IN_MINUTES;

export const getPositionX = (
  {
    since,
    till,
    startDate,
    endDate,
    hourWidth,
    itemIndex,
    itemWidth,
  }: {
    since: DateTime,
    till: DateTime,
    startDate: DateTime,
    endDate: DateTime,
    hourWidth: number,
    itemIndex?: number,
    itemWidth?: number,
  }
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
export const getChannelPosition = ({
  channelIndex,
  itemHeight,
  isRow,
  isScrollBar,
  theme
}: ChannelPosition) => {
  const offsetTop = isRow && isScrollBar ? (theme?.scrollbar?.size || 0) : 0;

  const top = (itemHeight + offsetTop) * channelIndex;
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
  offsetTop = 0
}: ProgramPosition) => {
  let since = program[sinceMapKey];
  let till = program[tillMapKey];

  if (!till && !nextProgram) {
    till = endOfDay(new Date(since));
  }

  const item = {
    ...program
  };

  let top = (itemHeight + offsetTop) * channelIndex;

  // if (isRow) {
  //   top = 0
  // }

  if (program.isEmpty) {
    if (!itemWidth) {
      itemWidth = 200
    }

    const position = {
      width: itemWidth,
      height: itemHeight,
      top,
      left: 0,
      edgeEnd: itemWidth,
    };

    return { position, data: item };
  } else {
    item.since = formatTime(since);
    item.till = formatTime(till);
  }

  let width = itemWidth || getPositionX({
    since: item.since,
    till: item.till,
    startDate,
    endDate,
    hourWidth
  });

  let left = getPositionX({
    since: startDate,
    till: item.since,
    startDate,
    endDate,
    hourWidth,
    itemIndex,
    itemWidth
  });

  const edgeEnd = getPositionX({
    since: startDate,
    till: item.till,
    startDate,
    endDate,
    hourWidth,
    itemIndex: itemIndex + 1,
    itemWidth
  });

  // if (startDate) {
  //   const isYesterday = isYesterdayTime(item.since, startDate);
  //
  //   if (isYesterday) {
  //     left = 0;
  //   }
  // }

  // If item has negative top position, it means that it is not visible in this day
  if (top < 0) {
    width = 0
  }

  const position = {
    width,
    height: itemHeight,
    top,
    left,
    edgeEnd,
    index: itemIndex
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
  isScrollBar?: boolean;
  theme: Theme
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
  isRow,
  isScrollBar,
  theme
}: ConvertedPrograms) => {
  let itemIndex = 0;

  const programObj: {
    [key: string]: {
      position: { top: number },
      programs: ProgramItem[]
    }
  } = {};

  const programs = data.map((program, index) => {
    if (program?.position && program?.data) {
      program = program?.data as Program;
    }

    const channelId = program[programChannelMapKey];
    const channelIndex = channels.findIndex((channel) => channel[channelMapKey] === channelId);

    let prevProgram = data[index - 1];
    let nextProgram = data[index + 1];

    if (prevProgram?.position && prevProgram?.data) {
      prevProgram = prevProgram?.data as Program;
    }

    if (nextProgram?.position && nextProgram?.data) {
      nextProgram = nextProgram?.data as Program;
    }

    const isPrevSameChannel = prevProgram && (prevProgram[programChannelMapKey] === channelId);
    const isNextSameChannel = nextProgram && (nextProgram[programChannelMapKey] === channelId);

    itemIndex = isPrevSameChannel ? itemIndex + 1 : 0;

    const offsetTop = isRow && isScrollBar ? (theme?.scrollbar?.size || 0) : 0;

    const programPosition = getProgramPosition({
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
      isRow,
      isScrollBar,
      theme,
      offsetTop
    });

    // console.log('itemIndex', itemIndex, programPosition)

    if (isRow) {
      if (!programObj[channelId]) {
        programObj[channelId] = {
          position: {
            top: (itemHeight + offsetTop) * channelIndex,
          },
          programs: [],
        }
      }

      programObj[channelId].programs.push(programPosition)
    }

    return programPosition;
  }, [] as ProgramWithPosition[])

  return {
    programs,
    programObj
  }
};

// -------- Converted channels with position data --------
interface ConvertedChannels {
  channels: Channel[];
  itemHeight: number;
  isRow?: boolean;
  isScrollBar?: boolean;
  theme?: Theme
}

export const getConvertedChannels = ({
  channels,
  itemHeight,
  isRow,
  isScrollBar,
  theme
}: ConvertedChannels) =>
  channels.map((channel, index) => ({
    ...channel,
    position: getChannelPosition({
      channelIndex: index,
      itemHeight,
      isRow,
      isScrollBar,
      theme
    }),
  }));

// -------- Dynamic virtual program visibility in the EPG --------
export const getItemVisibility = (
  position: Position,
  scrollY: number,
  scrollX: number,
  containerHeight: number,
  containerWidth: number,
  itemOverscan: number,
  params: any = {}
) => {
  const { layoutProps = {}, isInRow } = params;

  if (layoutProps.scrollX || layoutProps.scrollX === 0) {
    scrollX = layoutProps.scrollX
  }

  if (layoutProps.scrollY || layoutProps.scrollY === 0) {
    scrollY = layoutProps.scrollY
  }

  if (layoutProps.layoutWidth) {
    containerWidth = layoutProps.layoutWidth
  }

  if (layoutProps.layoutHeight) {
    containerHeight = layoutProps.layoutHeight
  }

  // console.log('layoutProps getItemVisibility', position, layoutProps, scrollX, scrollY)

  if (position.width <= 0 && !isInRow) {
    return false;
  }

  if (scrollY > position.top + itemOverscan * 3) {
    return false;
  }

  if (scrollY + containerHeight <= position.top) {
    return false;
  }

  // if (isInRow) {
  //   if (scrollY <= position.top + itemOverscan * 3) {
  //     return true;
  //   }
  //
  //   if (scrollY + containerHeight > position.top) {
  //     return true;
  //   }
  //
  //   return false
  // }

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
