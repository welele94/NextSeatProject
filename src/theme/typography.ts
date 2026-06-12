import { TextStyle } from "react-native"; 

const fontFamily = "Inter";

type TypographyStyle = TextStyle;


export const typography = {
  hero: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40
  },
  title: {
    fontFamily,
    fontSize: 24,
    lineHeight: 31
  },
  section: {
    fontFamily,
    fontSize: 20,
    lineHeight: 27
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24
  },
  caption: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20
  }, 
   eyebrow: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  } satisfies TypographyStyle
} as const;