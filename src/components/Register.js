import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, updateLoader] = useState(false);
  const [data, updateFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const history = useHistory();
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
    formData.preventDefault();
    let flag = validateInput(data);
    if (flag) {
      return;
    }
    let passData = {
      username: data.username,
      password: data.password,
    };
    updateLoader(true);
    try {
      let response = await axios.post(
        config.endpoint + "/auth/register",
        passData
      );
      if (response.status === 201) {
        updateLoader(false);
        enqueueSnackbar("Registered successfully", { variant: "success" });
        updateFormData({
          username: "",
          password: "",
          confirmPassword: "",
        });
        history.push("/login");
      }
    } catch (err) {
      updateLoader(false);
      if (err.response && err.response.status.toString()[0] === "4") {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", {
        variant: "warning",
      });
      return true;
    } else if (data.username.toString().length < 6) {
      enqueueSnackbar("Username must be atleast 6 characters", {
        variant: "warning",
      });
      return true;
    } else if (!data.password) {
      enqueueSnackbar("Password is a required field", {
        variant: "warning",
      });
      return true;
    } else if (data.password.toString().length < 6) {
      enqueueSnackbar("Password must be atleast 6 characters", {
        variant: "warning",
      });
      return true;
    } else if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", {
        variant: "warning",
      });
      return true;
    } else {
      return false;
    }
  };

  const handleChange = (e) => {
    updateFormData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <form onSubmit={(e) => register(e)}>
          <Stack spacing={2} className="form">
            <h2 className="title">Register</h2>
            <TextField
              id="username"
              label="Username"
              variant="outlined"
              title="Username"
              name="username"
              placeholder="Enter Username"
              fullWidth
              value={data.username}
              onChange={(e) => handleChange(e)}
            />
            <TextField
              id="password"
              variant="outlined"
              label="Password"
              name="password"
              type="password"
              helperText="Password must be atleast 6 characters length"
              fullWidth
              placeholder="Enter a password with minimum 6 characters"
              value={data.password}
              onChange={(e) => handleChange(e)}
            />
            <TextField
              id="confirmPassword"
              variant="outlined"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              value={data.confirmPassword}
              onChange={(e) => handleChange(e)}
            />
            {loading ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : (
              <Button type="submit" className="button" variant="contained">
                Register Now
              </Button>
            )}
            <p className="secondary-action">
              Already have an account?{" "}
              <Link className="link" to="/login">
                Login here
              </Link>
            </p>
          </Stack>
        </form>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
