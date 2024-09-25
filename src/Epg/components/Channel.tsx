import * as React from "react";

// Import interfaces
import { ChannelWithPosition } from "../helpers/types";

// Import styles
import { ChannelStyled } from "../styles";

interface ChannelProps<T> {
  channel: T;
  onClick?: (v: ChannelWithPosition) => void;
  logoChannelMapKey?: string
}

const { ChannelBox, ChannelLogo } = ChannelStyled;

export function Channel<T extends ChannelWithPosition>({
  channel,
  onClick,
  logoChannelMapKey = 'logo',
  ...rest
}: ChannelProps<T>) {
  const { position } = channel;
  return (
    <ChannelBox
      className="sidebar-item"
      onClick={() => onClick?.(channel)}
      {...position}
      {...rest}
      style={{
        top: position.top
      }}
    >
      <ChannelLogo src={channel[logoChannelMapKey]} alt="Logo"/>
    </ChannelBox>
  );
}
