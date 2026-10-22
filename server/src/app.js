import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//import routes
import authRouter from "./routes/auth.route.js";
import doctorRouter from "./routes/doctor.route.js";
import patientRouter from "./routes/patient.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://localhost:3001",
    ...(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new ApiError(403, "Origin not allowed"));
    },
    credentials: true
}));

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

app.use((error, req, res, next) => {
    const statusCode = error instanceof ApiError
        ? error.statusCode
        : Number.isInteger(error.status) && error.status >= 400 && error.status < 500
          ? error.status
          : 500;
    if (statusCode === 500) {
        console.error(`Unhandled API error (${req.method} ${req.originalUrl}):`, error);
    }
    res.status(statusCode).json({
        statusCode,
        success: false,
        message: statusCode === 500
            ? "Internal server error"
            : error instanceof ApiError
              ? error.message
              : "Invalid request",
        errors: error instanceof ApiError ? error.errors : [],
    });
});

export default app;