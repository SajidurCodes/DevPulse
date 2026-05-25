import express, { type Request, type Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import authRoute from "./modules/auth/auth.route"
import issueRoute from "./modules/issue/issue.route"
import logger from "./middleware/logger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger)




app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server IS Running🍵",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);

export default app;