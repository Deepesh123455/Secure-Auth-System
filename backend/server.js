import "dotenv/config"; 
import app from "./app.js";
import connectDB from "./config/db.js";


process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
  
    await connectDB();
    console.log("MongoDB Connection Success!");

 
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(
        ` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    
    process.on("unhandledRejection", (err) => {
      console.log("UNHANDLED REJECTION! 💥 Shutting down...");
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    
    process.on("SIGTERM", () => {
      console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
      server.close(() => {
        console.log(" Process terminated!");
      });
    });
  } catch (error) {
    console.log(" ERROR IN STARTUP:", error);
    process.exit(1);
  }
};

startServer();
