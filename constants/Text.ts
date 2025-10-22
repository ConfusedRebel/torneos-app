import type { TextStyle } from 'react-native';

const regular = (fontSize: number, extra?: Partial<TextStyle>): TextStyle => ({
  fontFamily: 'Roboto',
  fontSize,
  ...extra,
});

const bold = (fontSize: number, extra?: Partial<TextStyle>): TextStyle => ({
  fontFamily: 'RobotoBold',
  fontSize,
  ...extra,
});

const hero = bold(28);
const headingLg = bold(24);
const headingMd = bold(22);
const headingSm = bold(20);
const title = bold(18);
const body = regular(16);
const bodyBold = bold(16);
const detail = regular(15);
const caption = regular(14);
const captionBold = bold(14);
const footnote = regular(13);
const subtitle = regular(17, { lineHeight: 24 });

export const TEXT_STYLES = {
  hero,
  headingLg,
  headingMd,
  headingSm,
  title,
  subtitle,
  body,
  bodyBold,
  detail,
  caption,
  captionBold,
  footnote,
  button: bodyBold,
  link: bodyBold,
  fab: hero,
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof TEXT_STYLES;
