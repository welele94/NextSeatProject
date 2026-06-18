import { TextStyle } from "react-native";

type TypographyStyle = TextStyle;

const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold"
} as const;

export const typography = {
  hero: {
    fontFamily: font.extraBold,
    fontSize: 32,
    lineHeight: 40
  } satisfies TypographyStyle,

  title: {
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 31
  } satisfies TypographyStyle,

  section: {
    fontFamily: font.semiBold,
    fontSize: 20,
    lineHeight: 27
  } satisfies TypographyStyle,

  body: {
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 24
  } satisfies TypographyStyle,

  bodyMedium: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24
  } satisfies TypographyStyle,

  caption: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20
  } satisfies TypographyStyle,

  captionMedium: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20
  } satisfies TypographyStyle,

  eyebrow: {
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  } satisfies TypographyStyle
} as const;