import React from "react";
import { LogoFull, Logo } from "../Logos";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Button,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { useRouter } from "next/router";
import { globalColors } from "tailwind.config";
import { useSession } from "next-auth/react";

export const NavBar = () => {
  const drawerWidth = 240;
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile" },
    { label: "Contact", path: "/contact" },
  ];

  const session = useSession();
  const isAdmin =
    session.data?.user.role === "superAdmin" ||
    session.data?.user.role === "admin";

  const isMusician = session.data?.user.role === "musician" || isAdmin;

  if (isAdmin) {
    navItems.push({ label: "Admin console", path: "/admin" });
  }

  if (isMusician) {
    navItems.push({ label: "Invoices", path: "/invoice/list" });
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const { push } = useRouter();
  const { status } = useSession();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <div className="my-4 flex w-full justify-center">
        <LogoFull className="w-2/3" />
      </div>
      <Divider className="bg-main-accent" />
      <List disablePadding>
        {navItems.map((item) => (
          <React.Fragment key={item.label}>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: "center" }}
                onClick={() => void push(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
            <Divider className="bg-main-accent" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
  return (
    <>
      <AppBar
        component="nav"
        position="sticky"
        sx={{ backgroundColor: globalColors.main.menu }}
      >
        <Toolbar className="flex justify-between">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ pr: 2, display: { sm: "none" }, flex: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              flex: 1,
              justifyContent: "start",
            }}
          >
            {navItems.map(({ label, path }) => (
              <React.Fragment key={label}>
                <Button
                  key={label}
                  sx={{ color: "#fff" }}
                  onClick={() => void push(path)}
                >
                  {label}
                </Button>
              </React.Fragment>
            ))}
          </Box>
          <Logo className="self-center" />
          <div className="flex flex-1 justify-end pl-4 pr-2">
            {status === "authenticated" && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => void push("/profile")}
                sx={{ justifyContent: "end" }}
              >
                <AccountCircleIcon />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              backgroundColor: "black",
              width: drawerWidth,
              color: "white",
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};
