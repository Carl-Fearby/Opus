import { ComponentsThemeProvider } from "@/components/development/ComponentsThemeProvider";

export default function DocumentationThemeDesignerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ComponentsThemeProvider>{children}</ComponentsThemeProvider>;
}
