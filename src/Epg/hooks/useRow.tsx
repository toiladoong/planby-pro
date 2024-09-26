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
  scrollBoxRef?: any;
  isSkeleton?: boolean;
}

function scrollToWithCallback({ element, left, callback }: { element: any, left: number, callback: () => void }) {
  element.scrollTo({
    left,
    behavior: 'smooth'
  });

  function checkIfScrollComplete() {
    // console.log('scrollLeft checkIfScrollComplete', element.scrollLeft)

    if (element.scrollLeft === left) {
      callback();
    } else {
      requestAnimationFrame(checkIfScrollComplete);
    }
  }

  requestAnimationFrame(checkIfScrollComplete);
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
  onReachEnd,
  scrollBoxRef,
  isSkeleton
}: useRowProps) {
  const useIsomorphicEffect = useIsomorphicLayoutEffect();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const scrollBoxDefaultRef = React.useRef<HTMLDivElement>(null);

  if (!scrollBoxRef) {
    scrollBoxRef = scrollBoxDefaultRef
  }

  // const scrollToNowRef = React.useRef(false);
  //-------- State --------
  const [scrollY, setScrollY] = React.useState<number>(0);
  const [scrollX, setScrollX] = React.useState<number>(0);
  const isToday = isTodayFns(new Date(startDate));

  const handleSetAttribute = (scrollLeft: number) => {
    if (wrapperRef?.current) {
      if (scrollLeft <= 0) {
        wrapperRef.current.setAttribute('data-state', 'beginning');
      } else {
        if (scrollLeft >= (width - layoutWidth + sidebarWidth)) {
          wrapperRef.current.setAttribute('data-state', 'end');
        } else {
          wrapperRef.current.removeAttribute('data-state');
        }
      }
    }
  }

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
      let scrollTop;
      let scrollLeft;

      if (scrollBoxRef?.current) {
        scrollTop = scrollBoxRef.current.scrollTop;
        scrollLeft = scrollBoxRef.current.scrollLeft;
      } else {
        scrollTop = e.target.scrollTop;
        scrollLeft = e.target.scrollLeft
      }

      // console.log('scrollLeft', scrollLeft);

      handleSetAttribute(scrollLeft);

      handleScrollDebounced({
        y: scrollTop,
        x: scrollLeft
      });
    },
    [handleScrollDebounced, width, layoutWidth]
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

      scrollBoxRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'auto'
      });
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

        // console.log('handleOnScrollLeft', left)

        if (onReachBeginning) {
          scrollToWithCallback({
            element: scrollBoxRef.current,
            left: Math.max(0, left),
            callback: () => {
              if (left <= 0) {
                onReachBeginning?.({
                  firstProgram
                });
              }
            }
          })
        } else {
          scrollBoxRef.current.scrollTo({
            left,
            behavior: 'smooth'
          });
        }
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

        scrollBoxRef.current.scrollTo({
          left: right,
          behavior: 'smooth'
        });

        if (right >= (width - layoutWidth + sidebarWidth)) {
          onReachEnd?.({
            lastProgram
          });
        }
      }
    }, [width, layoutWidth, sidebarWidth, lastProgram]);

  const handleScrollTo = React.useCallback(
    (value: number, params = {}) => {
      const { behavior = 'auto' } = params;

      if (scrollBoxRef?.current) {
        scrollBoxRef.current.scrollTo({
          left: value,
          behavior
        })
      }
    }, []);

  // -------- Effects --------
  useIsomorphicEffect(() => {
    if (scrollBoxRef?.current) {
      if (isToday && isScrollToNow && !isSkeleton) {
        handleOnScrollToNow();
        // scrollToNowRef.current = true;
      }
    }
  }, [width, isToday, isSkeleton, isScrollToNow]);

  useIsomorphicEffect(() => {
    // console.log('layoutWidth', layoutWidth)

    if (scrollBoxRef?.current) {
      const scrollLeft = scrollBoxRef.current.scrollLeft;

      handleSetAttribute(scrollLeft);
    }
  }, [height, width, layoutWidth, sidebarWidth]);

  return {
    containerRef,
    wrapperRef,
    scrollBoxRef,
    scrollX,
    scrollY,
    onScroll: handleOnScroll,
    onScrollToNow: handleOnScrollToNow,
    onScrollTop: handleOnScrollTop,
    onScrollLeft: handleOnScrollLeft,
    onScrollRight: handleOnScrollRight,
    scrollTo: handleScrollTo,
  };
}
