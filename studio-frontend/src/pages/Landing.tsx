import { Button, Box, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";

const Landing = () => {
  return (
    <Box component="main" className="landing">
      {/* Theme Toggle - Top Right */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <ThemeToggle
          includeSystemMode={true}
          sx={{
            bgcolor: "rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.2)",
            },
          }}
        />
      </Box>

      <h1 className="title">
        AI STUDIO
      </h1>
      <Stack direction="row" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/signin"
        >
          Get Started
        </Button>
      </Stack>
    </Box>
  );
};

export default Landing; 