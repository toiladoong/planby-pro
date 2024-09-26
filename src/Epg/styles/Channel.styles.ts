import styled from "@emotion/styled/macro";
import { Theme } from "../helpers";

export const ChannelBox = styled.div<{
  height: number;
  theme?: Theme;
}>`
  position: absolute;
  height: ${({ height }) => height}px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.primary[900]};
`;

export const ChannelContent = styled.div`
  
`;

export const ChannelLogo = styled.img`
  max-height: 60px;
  max-width: 60px;
  position: relative;
`;
