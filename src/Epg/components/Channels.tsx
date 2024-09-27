import React, { useEffect } from "react";
// Import interfaces
import { ChannelWithPosition } from "../helpers/types";

// Import styles
import { ChannelsStyled } from "../styles";

// Import Components
import { Channel } from "../components";

interface ChannelsProps {
  isTimeline: boolean;
  isRTL: boolean;
  isChannelVisible: (position: any) => boolean;
  channels: ChannelWithPosition[];
  scrollY: number;
  sidebarWidth: number;
  renderChannel?: (v: { channel: ChannelWithPosition }) => React.ReactNode;
  channelMapKey?: string
  logoChannelMapKey?: string
  onLoadData?: (params: any) => void
  layoutHeight: number
}

const { Box } = ChannelsStyled;

export function Channels(props: ChannelsProps) {
  const {
    channels,
    scrollY,
    sidebarWidth,
    renderChannel,
    channelMapKey = 'uuid',
    logoChannelMapKey,
    onLoadData,
    layoutHeight
  } = props;
  const { isRTL, isTimeline, isChannelVisible } = props;

  const visibleChannels = React.useMemo(() => {
    return channels.reduce((array: ChannelWithPosition[], channel: ChannelWithPosition) => {
      const isVisible = isChannelVisible(channel.position);

      if (isVisible) {
        return [
          ...array,
          channel
        ]
      }

      return array
    }, [])
  }, [isChannelVisible, channels])

  const renderChannels = (channel: ChannelWithPosition) => {
    if (renderChannel) {
      return renderChannel({ channel })
    }

    return (
      <Channel
        key={channel[channelMapKey]}
        channel={channel}
        logoChannelMapKey={logoChannelMapKey}
      />
    );
  };

  useEffect(() => {
    // console.log('visibleChannels', visibleChannels)
    if (layoutHeight > 0) {
      onLoadData?.({
        visibleChannels
      })
    }
  }, [JSON.stringify(visibleChannels), layoutHeight]);

  return (
    <Box
      className="epg-sidebar"
      isRTL={isRTL}
      isTimeline={isTimeline}
      width={sidebarWidth}
      bottom={scrollY}
    >
      {visibleChannels.map(renderChannels)}
    </Box>
  );
}
