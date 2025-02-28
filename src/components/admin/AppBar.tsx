import React, { type ForwardedRef } from "react";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  type MenuItemProps,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";
import {
  AppBar,
  InspectorButton,
  TitlePortal,
  UserMenu,
  useUserMenu,
  type UserMenuProps,
} from "react-admin";
import { useRouter } from "next/router";

const BackMenuItem = (
  props: MenuItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) => {
  const { onClose } = useUserMenu();
  const router = useRouter();
  const handleClick = () => {
    void router.push("/");
    onClose();
  };
  return (
    <MenuItem
      onClick={handleClick}
      ref={ref}
      // passing the props to allow mui to hanlde keyboard navigation
      {...props}
    >
      <ListItemIcon>
        <ArrowBackIcon />
      </ListItemIcon>
      <ListItemText>Back to main app</ListItemText>
    </MenuItem>
  );
};

const LogoutMenuItem = (
  props: MenuItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) => {
  const { onClose } = useUserMenu();
  const handleClick = () => {
    onClose();
    void signOut();
  };
  return (
    <MenuItem
      onClick={handleClick}
      ref={ref}
      // passing the props to allow mui to hanlde keyboard navigation
      {...props}
    >
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText>Logout</ListItemText>
    </MenuItem>
  );
};

// passing ref for mui to handle keyboard navigation
const LogoutMenuItemRef = React.forwardRef(LogoutMenuItem);
const BackMenuItemRef = React.forwardRef(BackMenuItem);

const MyUserMenu = (props: UserMenuProps) => {
  return (
    <UserMenu {...props}>
      <BackMenuItemRef />
      <LogoutMenuItemRef />
    </UserMenu>
  );
};

const MyAppBar = () => {
  return (
    <AppBar userMenu={<MyUserMenu />}>
      <TitlePortal />
      <InspectorButton />
    </AppBar>
  );
};

export default MyAppBar;
