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

const { ChannelBox, ChannelContent, ChannelLogo } = ChannelStyled;

export function Channel<T extends ChannelWithPosition>({
  channel,
  onClick,
  logoChannelMapKey = 'logo',
  ...rest
}: ChannelProps<T>) {
  const { position } = channel;
  return (
    <ChannelBox
      className="channel-box"
      onClick={() => onClick?.(channel)}
      {...position}
      {...rest}
      style={{
        top: position.top
      }}
    >
      <ChannelContent className="channel-content">
        <ChannelLogo
          className="channel-logo"
          src={channel[logoChannelMapKey]}
          alt="Logo"
        />
      </ChannelContent>
    </ChannelBox>
  );
}
