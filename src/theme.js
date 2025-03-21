import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" }, // Blue
    secondary: { main: "#ff4081" }, // Pink
    background: { default: "#f4f6f8", paper: "#ffffff" },
    text: { primary: "#333", secondary: "#555" },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" }, // Light blue
    secondary: { main: "#f48fb1" }, // Soft pink
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#ffffff", secondary: "#aaaaaa" },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
});
