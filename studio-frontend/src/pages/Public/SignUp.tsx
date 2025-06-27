import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GoogleOutlined from "@mui/icons-material/Google";
import AppleOutlined from "@mui/icons-material/Apple";
import { useThemeBackground, useGlassStyles } from "../../components/themeHelpers.tsx";
import { ThemeToggle } from "../../components/ThemeToggle";

const SignUp = () => {
  const backgroundImage = useThemeBackground(
    "/assets/img/ui/blob1-ul.jpg",
    "/assets/img/ui/blob1-ud.jpg"
  );
  const glassStyles = useGlassStyles();

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
      }}
    >
      {/* Auth Panel with Glassmorphism - Full Height, Extreme Right */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100vh",
          width: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...glassStyles,
          borderLeft: glassStyles.border,
          borderTop: "none",
          borderRight: "none",
          borderBottom: "none",
        }}
      >
        {/* Theme Toggle - Top Right */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <ThemeToggle
            size="small"
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          />
        </Box>

        {/* Inner Container for Centered Content */}
        <Box sx={{ width: "320px", textAlign: "center" }}>
          {/* AI STUDIO with gradient */}
          <Box
            sx={{
              textAlign: "right",
              mb: 2,
            }}
          >
            <Typography
              component="div"
              sx={{
                fontSize: "1rem",
                fontWeight: "600",
                background:
                  "linear-gradient(90deg, #014d4e 0%, #009688 25%, #8bc34a 75%, #e9d842 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              }}
            >
              AI STUDIO
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: "500",
              color: "white",
              fontSize: "1.1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Sign up
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<GoogleOutlined fontSize="small" />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "28px",
                paddingRight: "20px",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  borderColor: "rgba(255,255,255,0.5)",
                },
              }}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<AppleOutlined fontSize="small" />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "28px",
                paddingRight: "20px",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  borderColor: "rgba(255,255,255,0.5)",
                },
              }}
            >
              Continue with Apple
            </Button>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 2.5,
              mb: 1.5,
              color: "white",
              fontWeight: "500",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              fontSize: "0.75rem",
            }}
          >
            Continue with email
          </Typography>

          <Stack spacing={1.5} component="form">
            <TextField
              label="Name"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                height: 56,
                mb: 1.5,
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              Create account
            </Button>
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 1.5, fontSize: "0.75rem" }}>
            <Box component="span" sx={{ color: "white", fontWeight: "500" }}>
              Already have an account?{" "}
            </Box>
            <Button
              component={RouterLink}
              to="/signin"
              sx={{
                textTransform: "none",
                p: 0,
                color: "primary.main",
                fontWeight: "600",
                fontSize: "0.75rem",
              }}
            >
              Log in
            </Button>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            <Button
              sx={{
                textTransform: "none",
                p: 0,
                color: "primary.main",
                fontWeight: "500",
                fontSize: "0.75rem",
              }}
            >
              Cookies Settings
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
