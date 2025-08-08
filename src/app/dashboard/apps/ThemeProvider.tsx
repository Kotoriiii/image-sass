import { ThemeProvider as NextThemeProvider } from "next-themes";

type Props = Parameters<typeof NextThemeProvider>[0];

export function ThemeProvider(props: Props) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {props.children}
    </NextThemeProvider>
  );
}
