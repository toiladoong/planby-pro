import styled from "@emotion/styled/macro";
import { Theme } from "../../helpers";

export const Wrapper = styled.div<{

}>`
    position: absolute;
    width: 100%;

    :hover {
        .arrow {
            opacity: 1;
        }
    }
`;

export const RowBox = styled.div<{
  height: number;
  theme?: Theme;
}>`
    //position: absolute;
    background: ${({ theme }) => theme.primary[900]};
    height: ${({ height }) => height}px;
`;

export const ScrollBox = styled.div<{ theme?: Theme; isRTL?: boolean; isScrollBar?: boolean; height: number }>`
    position: relative;
    width: 100%;
    overflow: auto;
    //overflow-x: auto;
    //overflow-y: hidden;
    scroll-behavior: smooth;
    height: ${({ height, theme, isScrollBar }) => `${isScrollBar ? height + (theme.scrollbar.size || 0) : height}px`};
    background: ${({ theme }) => theme.primary[900]};

    ${({ isRTL }) => isRTL && `transform: scale(-1,1)`};

    ::-webkit-scrollbar {
        width: ${({ isScrollBar, theme }) => isScrollBar ? `${theme.scrollbar.size}px` : 0};
        height: ${({ isScrollBar, theme }) => isScrollBar ? `${theme.scrollbar.size}px` : 0};
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

export const ArrowNext = styled.div<{

}>`
    position: absolute;
    top: 50%;
    right: 10px;
    z-index: 5;
    cursor: pointer;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    padding: 2px;
    line-height: 0;
    opacity: 0;
    transition: opacity 0.15s;
    user-select: none;
`;

export const ArrowPrev = styled.div<{

}>`
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    z-index: 5;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    padding: 2px;
    line-height: 0;
    opacity: 0;
    transition: opacity 0.15s;
    user-select: none;
`;