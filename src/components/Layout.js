import React from "react";
import { AppBar, Toolbar, Typography, Container, Box } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Voice Cloning App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>{children}</Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ textAlign: "center", py: 2, mt: 4, bgcolor: (theme) => theme.palette.grey[200] }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Voice Cloning App
        </Typography>
      </Box>
    </>
  );
};

export default Layout;
