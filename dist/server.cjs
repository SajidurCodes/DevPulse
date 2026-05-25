

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!!! Internal Server Error!!!\u274C\u274C",
    errors: err
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/db/index.ts
var import_serverless = require("@neondatabase/serverless");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  database_url: process.env.DATABASE_URL,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS
};
var config_default = config;

// src/db/index.ts
var sql = (0, import_serverless.neon)(config_default.database_url);
var initDB = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('contributor','maintainer')) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

  `;
  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type TEXT CHECK(type IN ('bug','feature_request')) NOT NULL,
      status TEXT CHECK(status IN ('open','in_progress','resolved')) DEFAULT 'open',
      reporter_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

  `;
  console.log("Database Initialized!!\u{1F680}");
};

// src/modules/auth/auth.service.ts
var signupUser = async (payload) => {
  const hashedPassword = await import_bcrypt.default.hash(payload.password, Number(config_default.bcrypt_salt_rounds));
  const result = await sql`
    INSERT INTO users(name,email,password_hash,role)
    VALUES(
      ${payload.name},
      ${payload.email},
      ${hashedPassword},
      ${payload.role}
    )
    RETURNING id,name,email,role,created_at,updated_at
  `;
  return result[0];
};
var loginUser = async (email, password) => {
  const users = await sql`
    SELECT * FROM users WHERE email=${email}
  `;
  const user = users[0];
  if (!user) {
    throw new Error("User not found");
  }
  const matched = await import_bcrypt.default.compare(password, user.password_hash);
  if (!matched) {
    throw new Error("Password incorrect");
  }
  const token = import_jsonwebtoken.default.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    config_default.jwt_secret,
    {
      expiresIn: Number(config_default.jwt_expires_in) || "2d"
    }
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var AuthService = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await AuthService.signupUser(req.body);
    sendResponse_default(res, {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred during signup",
      error: error.message
    });
  }
};
var login = async (req, res) => {
  try {
    const body = req.body;
    const result = await AuthService.loginUser(body.email, body.password);
    sendResponse_default(res, {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred during login",
      error: error.message
    });
  }
};
var AuthController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
var auth_route_default = router;

// src/modules/issue/issue.route.ts
var import_express2 = require("express");

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = (...roles) => (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const decoded = import_jsonwebtoken2.default.verify(token, config_default.jwt_secret);
  const user = decoded;
  req.user = user;
  if (roles.length && !roles.includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }
  next();
};
var auth_default = auth;

// src/modules/issue/issue.service.ts
var createIssueService = async (payload) => {
  console.log(payload);
  const result = await sql`
    INSERT INTO issues(
      title,
      description,
      type,
      reporter_id
    )
    VALUES(
      ${payload.title},
      ${payload.description},
      ${payload.type},
      ${payload.reporter_id}
    )
    RETURNING id,title,description,type,status,reporter_id,created_at,updated_at
  `;
  return result[0];
};
var getAllIssuesService = async (query) => {
  const issues = await sql.query(`
    SELECT * FROM issues
  `);
  const formattedIssues = [];
  for (const issue of issues) {
    const reporters = await sql.query(`
      SELECT id, name, role
      FROM users
      WHERE id = ${issue.reporter_id}
    `);
    const reporter = reporters[0];
    formattedIssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter?.id,
        name: reporter?.name,
        role: reporter?.role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return formattedIssues;
};
var getSingleIssueService = async (id) => {
  const issues = await sql`
    SELECT * FROM issues
    WHERE id=${id}
  `;
  const issue = issues[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const users = await sql`
    SELECT id,name,role
    FROM users
    WHERE id=${issue.reporter_id}
  `;
  return {
    ...issue,
    reporter: users[0]
  };
};
var updateIssueService = async (id, payload, user) => {
  const issues = await sql`
  
    SELECT * FROM issues
    WHERE id=${id}
  
  `;
  const issue = issues[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden");
    }
    if (issue.status !== "open") {
      throw new Error(
        "Cannot edit non-open issue"
      );
    }
  }
  const result = await sql`

    UPDATE issues
    SET
      title=${payload.title},
      description=${payload.description},
      type=${payload.type},
      updated_at=CURRENT_TIMESTAMP

    WHERE id=${id}

    RETURNING *

  `;
  return result[0];
};
var deleteIssueService = async (id) => {
  const result = await sql`
    DELETE FROM issues
    WHERE id=${id}
    RETURNING *
  `;
  if (!result[0]) {
    throw new Error("Issue not found");
  }
};
var IssueService = {
  createIssue: createIssueService,
  getAllIssues: getAllIssuesService,
  getSingleIssue: getSingleIssueService,
  updateIssue: updateIssueService,
  deleteIssue: deleteIssueService
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  console.log(req.body);
  try {
    const payload = { ...req.body, reporter_id: req.user?.id };
    const result = await IssueService.createIssue(payload);
    sendResponse_default(res, {
      success: true,
      statusCode: 201,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred while creating the issue"
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await IssueService.getAllIssues(req.query);
    sendResponse_default(res, {
      success: true,
      statusCode: 200,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred while retrieving issues"
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const result = await IssueService.getSingleIssue(
      Number(req.params.id)
    );
    sendResponse_default(res, {
      success: true,
      statusCode: 200,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (err) {
    console.error(err);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to fetch the issue",
      data: null
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const result = await IssueService.updateIssue(
      Number(req.params.id),
      req.body,
      req.user
    );
    sendResponse_default(res, {
      success: true,
      statusCode: 200,
      message: "Issue updated successfully",
      data: result
    });
  } catch (err) {
    console.error(err);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to update the issue",
      data: null
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    await IssueService.deleteIssue(Number(req.params.id));
    sendResponse_default(res, {
      success: true,
      statusCode: 200,
      message: "Issue deleted successfully",
      data: null
    });
  } catch (err) {
    console.error(err);
    sendResponse_default(res, {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to delete issue",
      data: null
    });
  }
};
var IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth_default("contributor", "maintainer"), IssueController.createIssue);
router2.get("/", IssueController.getAllIssues);
router2.get("/:id", IssueController.getSingleIssue);
router2.patch("/:id", auth_default("contributor", "maintainer"), IssueController.updateIssue);
router2.delete("/:id", auth_default("maintainer"), IssueController.deleteIssue);
var issue_route_default = router2;

// src/middleware/logger.ts
var import_fs = __toESM(require("fs"), 1);
var logger = (req, res, next) => {
  console.log("Method - URL - Time:", req.method, req.url, Date.now());
  const log = `
Method -> ${req.method} - Time -> ${Date.now()} - URL -> ${req.url}
`;
  import_fs.default.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server IS Running\u{1F375}"
  });
});
app.use("/api/auth", auth_route_default);
app.use("/api/issues", issue_route_default);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server running on port ${config_default.port}!!!\u{1F680}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map