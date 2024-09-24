import React from "react";
import { startOfToday } from "date-fns";

// Import interfaces
import { Channel, Program, Theme } from "../helpers/interfaces";

// Import types
import { DateTime, BaseTimeFormat, Position, ProgramItem } from "../helpers/types";

// Import helpers
import {
  DAY_WIDTH,
  ITEM_HEIGHT,
  ITEM_OVERSCAN,
  getDayWidthResources,
  getTimeRangeDates,
} from "../helpers";

// Import theme
import { theme as defaultTheme } from "../theme";

// Import helpers
import {
  SIDEBAR_WIDTH,
  formatTime,
  getConvertedChannels,
  getConvertedPrograms,
  getItemVisibility,
  getSidebarItemVisibility,
} from "../helpers";

// Import components
import { useLayout } from "./useLayout";

interface useEpgProps {
  channels: Channel[];
  epg: Program[];
  width?: number;
  height?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  isBaseTimeFormat?: BaseTimeFormat;
  isSidebar?: boolean;
  isTimeline?: boolean;
  isRTL?: boolean;
  isLine?: boolean;
  isRow?: boolean;
  isScrollBar?: boolean;
  isScrollToNow?: boolean;
  theme?: Theme;
  globalStyles?: string;
  dayWidth?: number;
  sidebarWidth?: number;
  itemWidth?: number;
  itemHeight?: number;
  itemOverscan?: number;
  channelMapKey?: string;
  logoChannelMapKey?: string;
  programChannelMapKey?: string;
  sinceMapKey?: string;
  tillMapKey?: string;
  maxLength?: number;
  getLiveProgram?: (programs: ProgramItem[]) => ProgramItem;
  onLoadData?: (params: any) => void
}

const defaultStartDateTime = formatTime(startOfToday());

export function useEpg({
  channels: channelsEpg,
  epg,
  startDate: startDateInput = defaultStartDateTime,
  endDate: endDateInput = "",
  isRTL = false,
  isBaseTimeFormat = false,
  isSidebar = true,
  isTimeline = true,
  isLine = true,
  isRow = false,
  isScrollBar = true,
  isScrollToNow = true,
  theme: customTheme,
  globalStyles,
  dayWidth: customDayWidth = DAY_WIDTH,
  sidebarWidth = SIDEBAR_WIDTH,
  itemWidth,
  itemHeight = ITEM_HEIGHT,
  itemOverscan = ITEM_OVERSCAN,
  width,
  height,
  maxLength,
  channelMapKey,
  logoChannelMapKey,
  programChannelMapKey,
  sinceMapKey,
  tillMapKey,
  getLiveProgram,
  onLoadData
}: useEpgProps) {
  if (itemWidth) {
    isTimeline = false;
    isLine = false;
  }

  const theme: Theme = customTheme || defaultTheme;

  // Get converted start and end dates
  const { startDate, endDate } = getTimeRangeDates(
    startDateInput,
    endDateInput
  );

  // Get day and hour width of the day
  const { hourWidth, dayWidth, ...dayWidthResourcesProps } = React.useMemo(
    () =>
      getDayWidthResources({ dayWidth: customDayWidth, startDate, endDate, maxLength, itemWidth }),
    [customDayWidth, startDate, endDate]
  );

  // -------- Effects --------
  const { containerRef, scrollBoxRef, ...layoutProps } = useLayout({
    startDate,
    endDate,
    sidebarWidth,
    width,
    height,
    hourWidth,
  });

  const { scrollX, scrollY, layoutWidth, layoutHeight } = layoutProps;

  // console.log('scrollY', scrollY)

  const {
    onScroll,
    onScrollToNow,
    onScrollTop,
    onScrollLeft,
    onScrollRight,
  } = layoutProps;

  //-------- Variables --------
  const channels = React.useMemo(
    () => getConvertedChannels({
      channels: channelsEpg,
      itemHeight,
      isRow,
      isScrollBar,
      theme
    }),
    [channelsEpg, itemHeight]
  );

  const startDateTime = formatTime(startDate);
  const endDateTime = formatTime(endDate);

  const getPrograms = React.useCallback((params = {}) => {
    return getConvertedPrograms({
      data: epg,
      channels,
      startDate: startDateTime,
      endDate: endDateTime,
      itemWidth,
      itemHeight,
      hourWidth,
      channelMapKey,
      programChannelMapKey,
      sinceMapKey,
      tillMapKey,
      isRow,
      isScrollBar,
      theme,
      ...params
    })
  }, [epg, channels, startDateTime, endDateTime, itemWidth, itemHeight, hourWidth])

  const { programs, programObj } = getPrograms();

  // console.log('programs', programs)

  // -------- Handlers --------
  const isProgramVisible = React.useCallback(
    (position: Position, params: any) =>
      getItemVisibility(
        position,
        scrollY,
        scrollX,
        layoutHeight,
        layoutWidth,
        itemOverscan,
        params
      ),
    [scrollY, scrollX, layoutHeight, layoutWidth, itemOverscan]
  );

  // console.log('layoutWidth', layoutWidth)

  const isChannelVisible = React.useCallback(
    (position: Pick<Position, "top">) =>
      getSidebarItemVisibility(position, scrollY, layoutHeight, itemOverscan),
    [scrollY, layoutHeight, itemOverscan]
  );

  const getEpgProps = () => ({
    isRTL,
    isSidebar,
    isLine,
    isTimeline,
    width,
    height,
    sidebarWidth,
    ref: containerRef,
    theme,
    globalStyles,
  });

  const getLayoutProps = () => ({
    programs,
    channels,
    programObj,
    startDate,
    endDate,
    scrollY,
    onScroll,
    isRTL,
    isBaseTimeFormat,
    isSidebar,
    isTimeline,
    isLine,
    isProgramVisible,
    isChannelVisible,
    isRow,
    isScrollBar,
    isScrollToNow,
    dayWidth,
    hourWidth,
    sidebarWidth,
    layoutWidth,
    layoutHeight,
    itemWidth,
    itemHeight,
    channelMapKey,
    logoChannelMapKey,
    getLiveProgram,
    getPrograms,
    onLoadData,
    ...dayWidthResourcesProps,
    containerRef,
    ref: scrollBoxRef,
  });

  return {
    getEpgProps,
    getLayoutProps,
    onScrollToNow,
    onScrollTop,
    onScrollLeft,
    onScrollRight,
    scrollY,
    scrollX,
  };
}
