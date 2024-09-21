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
  width: number;
  hourWidth: number;
  layoutWidth: number;
  sidebarWidth: number;
  itemWidth?: number;
  startDate: DateTime;
  endDate: DateTime;
  containerRef: any;
  isScrollToNow?: boolean;
  liveProgram?: ProgramItem;
  firstProgram?: ProgramItem;
  lastProgram?: ProgramItem;
  onReachBeginning?: (params: any) => void;
  onReachEnd?: (params: any) => void;
}

export function useRow({
  layoutWidth,
  height,
  width,
  startDate,
  endDate,
  hourWidth,
  sidebarWidth,
  itemWidth = 0,
  containerRef,
  isScrollToNow,
  liveProgram,
  firstProgram,
  lastProgram,
  onReachBeginning,
  onReachEnd
}: useRowProps) {
  const useIsomorphicEffect = useIsomorphicLayoutEffect();

  const scrollBoxRef = React.useRef<HTMLDivElement>(null);
  const scrollToNowRef = React.useRef(false);
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
        scrollPosition = liveProgram.position.left - itemWidth
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

      scrollBoxRef.current.scrollLeft = scrollPosition;

      // scrollBoxRef.current.scrollTo({
      //   left: scrollPosition,
      //   behavior: 'auto'
      // });
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

  const handleOnScrollLeft = React.useCallback(
    (value?: number) => {
      if (scrollBoxRef?.current) {
        let left = 0;

        if (value) {
          left = scrollBoxRef.current.scrollLeft - value;
        } else {
          left = scrollBoxRef.current.scrollLeft - itemWidth * 2;
        }

        if (left <= 0) {
          onReachBeginning?.({
            firstProgram
          });
        }

        // console.log('handleOnScrollLeft', left)
        scrollBoxRef.current.scrollLeft = left;
      }
    }, [width, firstProgram]);

  const handleOnScrollRight = React.useCallback(
    (value?: number) => {
      if (scrollBoxRef?.current) {
        let right = 0;

        if (value) {
          right = scrollBoxRef.current.scrollLeft + value;
        } else {
          right = scrollBoxRef.current.scrollLeft + itemWidth * 2;
        }

        // console.log('handleOnScrollRight', right, width - layoutWidth)

        if (right >= (width - layoutWidth)) {
          onReachEnd?.({
            lastProgram
          });
        }

        // console.log('handleOnScrollRight', right)
        scrollBoxRef.current.scrollLeft = right;
      }
    }, [width, layoutWidth, sidebarWidth, lastProgram]);

  // -------- Effects --------
  useIsomorphicEffect(() => {
    if (scrollBoxRef?.current && isToday && isScrollToNow && !scrollToNowRef.current) {
      handleOnScrollToNow();
      scrollToNowRef.current = true;
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
