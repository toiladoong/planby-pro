import * as React from "react";

import { useRow } from "../../hooks/useRow";

// Import types
import { ProgramWithPosition, ProgramItem, DateTime } from "../../helpers/types";

// Import styles
import { RowBox, ScrollBox, ArrowNext, ArrowPrev, Wrapper } from "./styles";

interface RowProps {
  isRTL?: boolean;
  width: number;
  height: number;
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
}

export function Row({
  isRTL = false,
  isScrollBar,
  isScrollToNow,
  width,
  height,
  programs,
  renderPrograms,
  startDate,
  endDate,
  containerRef,
  layoutWidth,
  layoutHeight,
  sidebarWidth,
  itemWidth,
  getLiveProgram
}: RowProps) {
  const liveProgram = getLiveProgram?.(programs);

  const { scrollBoxRef, ...layoutProps } = useRow({
    containerRef,
    width,
    height,
    sidebarWidth,
    startDate,
    endDate,
    hourWidth: 0,
    itemWidth,
    isScrollToNow,
    liveProgram
  });

  const { scrollX, scrollY, onScroll, onScrollLeft, onScrollRight } = layoutProps;

  // console.log('layoutProps Row', layoutProps)

  return (
    <Wrapper>
      <ArrowPrev
        onClick={() => {
          console.log('ArrowPrev')
          onScrollLeft(10)
        }}
      >
        Prev
      </ArrowPrev>
      <ScrollBox
        isRTL={isRTL}
        isScrollBar={isScrollBar}
        ref={containerRef}
        height={height}
        onScroll={onScroll}
      >
        <RowBox
          data-testid="row"
          width={width}
          height={height}
          ref={scrollBoxRef}
        >
          {
            programs.map((program) => renderPrograms(program as ProgramWithPosition, {
              layoutProps: {
                scrollX,
                scrollY,
                layoutWidth,
                layoutHeight
              }
            }))
          }
        </RowBox>
      </ScrollBox>
      <ArrowNext
        onClick={() => {
          console.log('ArrowNext')
          onScrollRight(10)
        }}
      >
        Next
      </ArrowNext>
    </Wrapper>
  );
}
