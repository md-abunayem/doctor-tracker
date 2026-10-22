import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//import routes
import authRouter from "./routes/auth.route.js";
import doctorRouter from "./routes/doctor.route.js";
import patientRouter from "./routes/patient.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: "Route not found",
    errors: [],
  });
});

export default app;
