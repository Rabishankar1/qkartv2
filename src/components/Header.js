import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("balance");
    window.location.reload();
  };
  const history = useHistory();
  let username = localStorage.getItem("username");
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      ) : username ? (
        <Stack spacing={2} direction="row" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src="avatar.png" alt={username} />
            <p>{username}</p>
          </Stack>
          <Button onClick={logout}>Logout</Button>
        </Stack>
      ) : (
        <Stack direction="row">
          <Button onClick={() => history.push("/login")}>Login</Button>
          <Button variant="contained" onClick={() => history.push("/register")}>
            Register
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;
