import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { startOfToday, isToday as isTodayFns } from "date-fns";

// Import types
import { DateTime, ProgramItem } from "../helpers/types";

// Import helpers
import {
  DEBOUNCE_WAIT,
  DEBOUNCE_WAIT_MAX,
  getPositionX,
  useIsomorphicLayoutEffect,
} from "../helpers";

interface useRowProps {
  height?: number;
  width?: number;
  hourWidth: number;
  sidebarWidth: number;
  itemWidth?: number;
  startDate: DateTime;
  endDate: DateTime;
  containerRef: any;
  isScrollToNow?: boolean;
  liveProgram?: ProgramItem;
}

export function useRow({
  height,
  width,
  startDate,
  endDate,
  hourWidth,
  sidebarWidth,
  itemWidth,
  containerRef,
  isScrollToNow,
  liveProgram
}: useRowProps) {
  const useIsomorphicEffect = useIsomorphicLayoutEffect();

  const scrollBoxRef = React.useRef<HTMLDivElement>(null);
  //-------- State --------
  const [scrollY, setScrollY] = React.useState<number>(0);
  const [scrollX, setScrollX] = React.useState<number>(0);
  const isToday = isTodayFns(new Date(startDate));

  // -------- Handlers --------
  const handleScrollDebounced = useDebouncedCallback(
    (value) => {
      setScrollY(value.y);
      setScrollX(value.x);
    },
    DEBOUNCE_WAIT,
    { maxWait: DEBOUNCE_WAIT_MAX }
  );

  const handleOnScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent> & { target: Element }) => {
      handleScrollDebounced({ y: e.target.scrollTop, x: e.target.scrollLeft });
    },
    [handleScrollDebounced]
  );

  const handleOnScrollToNow = React.useCallback(() => {
    if (scrollBoxRef?.current && isToday) {
      // const clientWidth = (width ?? containerRef.current?.clientWidth) as number;

      const newDate = new Date();
      let scrollPosition = 0;

      if (liveProgram) {
        scrollPosition = liveProgram.position.left
      } else {
        scrollPosition = getPositionX({
          since: startOfToday(),
          till: newDate,
          startDate,
          endDate,
          hourWidth,
          itemIndex: 0,
          itemWidth
        })
      }

      const scrollNow = scrollPosition + sidebarWidth;
      // console.log('scrollBoxRef.current', scrollNow, scrollBoxRef.current)
      scrollBoxRef.current.scrollLeft = scrollNow;
    }
  }, [isToday, startDate, endDate, width, sidebarWidth, hourWidth, liveProgram]);

  const handleOnScrollTop = React.useCallback(
    (value: number = hourWidth) => {
      if (scrollBoxRef?.current) {
        const top = scrollBoxRef.current.scrollTop + value;
        scrollBoxRef.current.scrollTop = top;
      }
    },
    [hourWidth]
  );

  const handleOnScrollRight = React.useCallback(
    (value: number = hourWidth) => {
      if (scrollBoxRef?.current) {
        const right = scrollBoxRef.current.scrollLeft + value;
        scrollBoxRef.current.scrollLeft = right;
      }
    },
    [hourWidth]
  );

  const handleOnScrollLeft = React.useCallback(
    (value: number = hourWidth) => {
      if (scrollBoxRef?.current) {
        const left = scrollBoxRef.current.scrollLeft - value;
        scrollBoxRef.current.scrollLeft = left;
      }
    },
    [hourWidth]
  );

  // -------- Effects --------
  useIsomorphicEffect(() => {
    if (scrollBoxRef?.current && isToday && isScrollToNow) {
      handleOnScrollToNow();
    }
  }, [height, width, startDate, isToday, isScrollToNow, handleOnScrollToNow, liveProgram]);

  return {
    containerRef,
    scrollBoxRef,
    scrollX,
    scrollY,
    onScroll: handleOnScroll,
    onScrollToNow: handleOnScrollToNow,
    onScrollTop: handleOnScrollTop,
    onScrollLeft: handleOnScrollLeft,
    onScrollRight: handleOnScrollRight,
  };
}
