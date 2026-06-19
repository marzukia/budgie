import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "teal",
  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
  focusRing: "auto",
  components: {
    Button: { defaultProps: { radius: "md" } },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    NumberInput: { defaultProps: { radius: "md" } },
    Textarea: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    ColorInput: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "md" } },
    Modal: { defaultProps: { radius: "md", centered: true } },
    Card: { defaultProps: { radius: "md", withBorder: true } },
    Badge: { defaultProps: { radius: "sm" } },
    NavLink: { defaultProps: { style: { borderRadius: "var(--mantine-radius-md)" } } },
  },
});
