import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from "@mui/material";
import { Home, Mic, Translate } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;

const Sidebar = () => {
    const theme = useTheme(); // Get the current theme
    const location = useLocation(); // Get current route for active link styling

    const navItems = [
        { text: "Home", icon: <Home />, path: "/" },
        { text: "Recorder", icon: <Mic />, path: "/recorder" },
        { text: "Translations", icon: <Translate />, path: "/translations" },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    backgroundColor: theme.palette.background.paper, // Dynamic based on theme
                    color: theme.palette.text.primary, // Dynamic text color
                },
            }}
        >
            <Toolbar />
            <Divider />

            <List>
                {navItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: theme.palette.action.selected, // Theme-based active color
                                    "& .MuiListItemIcon-root": { color: theme.palette.primary.main }, // Highlight icon
                                },
                                "&:hover": {
                                    backgroundColor: theme.palette.action.hover, // Theme hover effect
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: theme.palette.text.primary }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
