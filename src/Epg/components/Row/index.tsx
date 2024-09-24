import React, { useEffect } from "react";

import { useRow } from "../../hooks/useRow";

// Import types
import { ProgramWithPosition, ProgramItem, DateTime } from "../../helpers/types";

// Import styles
import { RowBox, ScrollBox, ArrowNext, ArrowPrev, Wrapper } from "./styles";

interface RowProps {
  isRTL?: boolean;
  width?: number;
  height: number;
  position: { top: number };
  programs: ProgramItem[]
  renderPrograms: (program: ProgramWithPosition, params: any) => React.ReactNode;
  startDate: DateTime;
  endDate: DateTime;
  containerRef: any;
  layoutWidth: number;
  layoutHeight: number;
  sidebarWidth: number;
  isScrollBar?: boolean;
  isScrollToNow?: boolean;
  itemWidth?: number;
  getLiveProgram?: (programs: ProgramItem[]) => ProgramItem;
  onReachBeginning?: () => void;
  onReachEnd?: () => void;
  offsetLeft?: number;
  scrollBoxRef?: any;
  loading?: boolean;
}

export function Row({
  isRTL = false,
  isScrollBar,
  isScrollToNow,
  loading,
  width,
  height,
  position,
  programs,
  renderPrograms,
  startDate,
  endDate,
  containerRef,
  layoutWidth,
  layoutHeight,
  sidebarWidth,
  itemWidth = 0,
  getLiveProgram,
  onReachBeginning,
  onReachEnd,
  offsetLeft,
  scrollBoxRef: customScrollBoxRef
}: RowProps) {
  const liveProgram = getLiveProgram?.(programs);
  const firstProgram = programs[0];
  const lastProgram = programs[programs.length - 1];

  if (!width) {
    width = programs.length * itemWidth;
  }

  const { scrollBoxRef, ...layoutProps } = useRow({
    containerRef,
    scrollBoxRef: customScrollBoxRef,
    width,
    height,
    sidebarWidth,
    startDate,
    endDate,
    hourWidth: 0,
    itemWidth,
    isScrollToNow,
    liveProgram,
    firstProgram,
    lastProgram,
    onReachBeginning,
    onReachEnd,
    layoutWidth
  });

  const { scrollX, onScroll, onScrollLeft, onScrollRight, scrollTo } = layoutProps;

  // console.log('layoutProps Row', layoutProps)
  useEffect(() => {
    if (offsetLeft || offsetLeft === 0) {
      scrollTo(offsetLeft)
    }
  }, [offsetLeft])

  return (
    <Wrapper
      style={{
        ...position
      }}
    >
      <ArrowPrev
        className="arrow arrow-prev"
        onClick={() => {
          console.log('ArrowPrev')
          onScrollLeft()
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             className="lucide lucide-chevron-left">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </ArrowPrev>
      <ScrollBox
        isRTL={isRTL}
        isScrollBar={isScrollBar}
        ref={scrollBoxRef}
        height={height}
        onScroll={onScroll}
      >
        <RowBox
          data-testid="row"
          height={height}
          style={{
            width
          }}
        >
          {
            programs.map((program) => renderPrograms(program as ProgramWithPosition, {
              layoutProps: {
                scrollX,
                layoutWidth,
                layoutHeight
              }
            }))
          }
        </RowBox>
      </ScrollBox>
      <ArrowNext
        className="arrow arrow-next"
        onClick={() => {
          console.log('ArrowNext')
          onScrollRight()
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             className="lucide lucide-chevron-right">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </ArrowNext>
    </Wrapper>
  );
}
