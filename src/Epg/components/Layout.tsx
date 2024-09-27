import React from "react";

// Import types
import {
  ProgramItem,
  ProgramWithPosition,
  ChannelWithPosition,
  DateTime,
  Position,
  BaseTimeFormat,
} from "../helpers/types";

// Import helpers
import { getProgramOptions, isFutureTime } from "../helpers";

// Import styles
import { EpgStyled } from "../styles";

// Import components
import { Timeline, Channels, Program, Line, Row } from "../components";

interface RenderTimeline {
  isBaseTimeFormat: BaseTimeFormat;
  isSidebar: boolean;
  isRTL: boolean;
  sidebarWidth: number;
  hourWidth: number;
  numberOfHoursInDay: number;
  offsetStartHoursRange: number;
  dayWidth: number;
}

interface LayoutProps {
  programs: ProgramItem[];
  channels: ChannelWithPosition[];
  layoutKey?: string;
  programObj?: {
    [key: string]: {
      position: { top: number },
      programs: ProgramItem[]
    }
  };
  startDate: DateTime;
  endDate: DateTime;
  scrollY: number;
  dayWidth: number;
  hourWidth: number;
  numberOfHoursInDay: number;
  offsetStartHoursRange: number;
  sidebarWidth: number;
  layoutWidth: number;
  layoutHeight: number;
  itemHeight: number;
  itemWidth?: number;
  channelMapKey?: string;
  logoChannelMapKey?: string;
  onScroll: (
    e: React.UIEvent<HTMLDivElement, UIEvent> & { target: Element }
  ) => void;
  isRTL?: boolean;
  isBaseTimeFormat?: BaseTimeFormat;
  isSidebar?: boolean;
  isTimeline?: boolean;
  isLine?: boolean;
  isRow?: boolean;
  isScrollBar?: boolean;
  isScrollToNow?: boolean;
  isProgramVisible: (position: Position, params: any) => boolean;
  isChannelVisible: (position: Pick<Position, "top">) => boolean;
  renderProgram?: (v: {
    program: ProgramItem;
    isRTL: boolean;
    isBaseTimeFormat: BaseTimeFormat;
  }) => React.ReactNode;
  renderChannel?: (v: { channel: ChannelWithPosition }) => React.ReactNode;
  renderTimeline?: (v: RenderTimeline) => React.ReactNode;
  renderRow?: (v: {
    channelId: string;
    programs: ProgramItem[];
    row: any,
    getPrograms?: (params: any) => ProgramItem[];
    itemWidth?: number;
  }) => React.ReactNode;
  containerRef?: any;
  getPrograms?: (params: any) => ProgramItem[];
  getLiveProgram?: (programs: ProgramItem[]) => ProgramItem;
  onLoadData?: (params: any) => void
}

const { ScrollBox, RowContent, Content } = EpgStyled;

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, scrollBoxRef) => {
    const { layoutKey, channels, programs, programObj = {}, startDate, endDate, scrollY } = props;
    const {
      layoutWidth,
      layoutHeight,
      dayWidth,
      hourWidth,
      sidebarWidth,
      itemWidth = 0,
      itemHeight,
      channelMapKey = 'uuid',
      logoChannelMapKey
    } = props;
    const { numberOfHoursInDay, offsetStartHoursRange } = props;
    const {
      containerRef,
      isSidebar = true,
      isTimeline = true,
      isLine = true,
      isBaseTimeFormat = false,
      isRTL = false,
      isRow = false,
      isScrollBar = false,
      isScrollToNow = false,
      getPrograms,
      getLiveProgram,
    } = props;

    const {
      onLoadData,
      onScroll,
      isProgramVisible,
      isChannelVisible,
      renderProgram,
      renderChannel,
      renderTimeline,
      renderRow
    } = props;

    const channelsLength = channels.length;
    const contentHeight = React.useMemo(() => channelsLength * itemHeight, [
      channelsLength,
      itemHeight,
    ]);
    const isFuture = isFutureTime(endDate);

    const renderPrograms = (program: ProgramWithPosition, params: any = {}) => {
      const { position } = program;
      const isVisible = isProgramVisible(position, params);

      if (isVisible) {
        const options = getProgramOptions(program);
        if (renderProgram) {
          return renderProgram({
            program: options,
            isRTL,
            isBaseTimeFormat
          });
        }
        return (
          <Program
            key={program.data.id}
            isRTL={isRTL}
            isBaseTimeFormat={isBaseTimeFormat}
            program={options}
          />
        );
      }
      return null;
    };

    const renderTopbar = () => {
      const props = {
        sidebarWidth,
        isSidebar,
        isRTL,
        dayWidth,
        numberOfHoursInDay,
      };
      const timeProps = {
        offsetStartHoursRange,
        numberOfHoursInDay,
        isBaseTimeFormat,
        hourWidth,
      };
      if (renderTimeline) {
        return renderTimeline({ ...timeProps, ...props });
      }
      return <Timeline {...timeProps} {...props} />;
    };

    let renderContent;

    if (isRow) {
      renderContent = (
        <RowContent
          className="epg-content"
          sidebarWidth={sidebarWidth}
          isSidebar={isSidebar}
          height={contentHeight}
        >
          {
            Object.keys(programObj).map((channelId) => {
              const position: any = programObj[channelId]?.position;
              const programs = programObj[channelId]?.programs;

              // console.log('position channelId', channelId, position);

              // const isVisible = isProgramVisible(position, {
              //   isInRow: true
              // });
              //
              // if (!isVisible) {
              //   return null
              // }

              const row = (
                <Row
                  isRTL={isRTL}
                  isScrollBar={isScrollBar}
                  channelId={channelId}
                  height={itemHeight}
                  position={position}
                  programs={programs}
                  renderPrograms={renderPrograms}
                  startDate={startDate}
                  endDate={endDate}
                  containerRef={containerRef}
                  layoutWidth={layoutWidth}
                  layoutHeight={layoutHeight}
                  sidebarWidth={sidebarWidth}
                  itemWidth={itemWidth}
                  isScrollToNow={isScrollToNow}
                  getLiveProgram={getLiveProgram}
                />
              )

              if (renderRow) {
                return renderRow({
                  channelId,
                  programs,
                  row,
                  getPrograms,
                  itemWidth
                })
              }

              return row
            })
          }
        </RowContent>
      )
    } else {
      renderContent = (
        <Content
          className="epg-content"
          sidebarWidth={sidebarWidth}
          isSidebar={isSidebar}
          width={dayWidth}
          height={contentHeight}
        >
          {programs.map((program) => renderPrograms(program as ProgramWithPosition))}
        </Content>
      )
    }

    return (
      <ScrollBox
        key={layoutKey}
        className="epg-layout"
        isRTL={isRTL}
        ref={scrollBoxRef}
        onScroll={onScroll}
      >
        {isLine && isFuture && (
          <Line
            dayWidth={dayWidth}
            hourWidth={hourWidth}
            sidebarWidth={sidebarWidth}
            startDate={startDate}
            endDate={endDate}
            height={contentHeight}
            top={isTimeline ? 64 : 0}
          />
        )}
        {isTimeline && renderTopbar()}
        {isSidebar && (
          <Channels
            isRTL={isRTL}
            isTimeline={isTimeline}
            isChannelVisible={isChannelVisible}
            sidebarWidth={sidebarWidth}
            channels={channels as ChannelWithPosition[]}
            scrollY={scrollY}
            renderChannel={renderChannel}
            channelMapKey={channelMapKey}
            logoChannelMapKey={logoChannelMapKey}
            onLoadData={onLoadData}
            layoutHeight={layoutHeight}
          />
        )}
        {renderContent}
      </ScrollBox>
    );
  }
);
