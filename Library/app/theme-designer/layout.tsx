import { ComponentsThemeProvider } from "@/components/development/ComponentsThemeProvider";

export default function ThemeDesignerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ComponentsThemeProvider>{children}</ComponentsThemeProvider>;
}
