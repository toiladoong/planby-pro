import { DateTime } from './types';

export interface Program {
  channelUuid: string;
  id: string;
  title: string;
  description: string;
  since: string | number | Date;
  till: string | number | Date;
  image: string;
  isEmpty?: boolean;
  [key: string]: any;
}

export interface ProgramPosition {
  program: Program;
  nextProgram?: Program;
  channelIndex: number;
  itemIndex: number;
  itemWidth?: number;
  itemHeight: number;
  hourWidth: number;
  startDate: DateTime;
  endDate: DateTime;
  sinceMapKey?: string;
  tillMapKey?: string;
  isRow?: boolean;
  isScrollBar?: boolean;
  theme?: Theme;
  offsetTop?: number;
}

export interface Channel {
  uuid: string;
  logo: string;

  [key: string]: any;
}

export interface ChannelPosition {
  channelIndex: number;
  itemHeight: number;
  isRow?: boolean;
  isScrollBar?: boolean;
  theme?: Theme
}

export interface Theme {
  primary: {
    600: string;
    900: string;
  };
  grey: { 300: string };
  white: string;
  green: { 300: string };
  loader: {
    teal: string;
    purple: string;
    pink: string;
    bg: string;
  };
  scrollbar: {
    size: number;
    border: string;
    thumb: {
      bg: string;
    };
  };
  gradient: {
    blue: {
      300: string;
      600: string;
      900: string;
    };
  };

  text: {
    grey: {
      300: string;
      500: string;
    };
  };
  timeline: {
    divider: {
      bg: string;
    };
  };
}
