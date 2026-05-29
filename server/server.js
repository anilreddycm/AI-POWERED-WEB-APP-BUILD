import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` URL: http://localhost:${PORT}\n`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.warn(`⚠️ Port ${PORT} is busy. Retrying in 1.5 seconds...`);
        setTimeout(() => {
          server.close();
          startServer();
        }, 1500);
      } else {
        console.error("Server error:", error.message);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
