import styled from "@emotion/styled/macro";
import { Layers, Theme } from "../helpers";

export const Container = styled.div<{
  height?: number;
  width?: number;
}>`
    padding: 5px;
    height: ${({ height }) => (height ? `${height}px` : "100%")};
    width: ${({ width }) => (width ? `${width}px` : "100%")};

    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }
`;

export const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
`;

export const ScrollBox = styled.div<{ theme?: Theme; isRTL?: boolean }>`
    height: 100%;
    width: 100%;
    position: relative;
    overflow: auto;
    scroll-behavior: smooth;
    background: ${({ theme }) => theme.primary[900]};

    ${({ isRTL }) => isRTL && `transform: scale(-1,1)`};

    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    ::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.scrollbar.thumb.bg};
        border: 10px none ${({ theme }) => theme.white};
        border-radius: 20px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${({ theme }) => theme.white};
    }

    ::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.primary[900]};
        border: 22px none ${({ theme }) => theme.white};
        border-radius: 0;
    }

    ::-webkit-scrollbar-corner {
        background: ${({ theme }) => theme.primary[900]};
    }
`;

export const Box = styled.div<{
  isRTL?: boolean;
  width: number;
  height: number;
  left?: number;
  top?: number;
  theme?: Theme;
}>`
    position: absolute;
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
    top: ${({ top = 0 }) => top}px;
    background: ${({ theme }) => theme.primary[900]};
    z-index: ${Layers.EpgCornerBox};

    ${({ isRTL, left = 0 }) => (isRTL ? `right:0px;` : ` left: ${left}px`)};
`;

export const Content = styled.div<{
  width: number;
  height: number;
  sidebarWidth: number;
  isSidebar: boolean;
  theme?: Theme;
}>`
    background: ${({ theme }) => theme.primary[900]};
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
    position: relative;
    left: ${({ isSidebar, sidebarWidth }) => (isSidebar ? sidebarWidth : 0)}px;
`;

export const RowContent = styled.div<{
  height: number;
  sidebarWidth: number;
  isSidebar: boolean;
  theme?: Theme;
}>`
    position: relative;
    background: ${({ theme }) => theme.primary[900]};
    width: ${({ isSidebar, sidebarWidth }) => isSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%'};
    height: ${({ height }) => height}px;
    left: ${({ isSidebar, sidebarWidth }) => (isSidebar ? sidebarWidth : 0)}px;
`;

export const Row = styled.div<{
  width: number;
  height: number;
  theme?: Theme;
}>`
    background: ${({ theme }) => theme.primary[900]};
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
`;
