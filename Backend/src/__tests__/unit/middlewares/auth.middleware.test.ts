import { Request, Response, NextFunction } from "express";
import { authMiddleware, authorizedMiddleware } from "../../../middlewares/auth.middleware.js";
import { JWTUtil } from "../../../utils/jwt.util.js";
import { ApiResponseHelper } from "../../../utils/apihelper.util.js";

jest.mock("../../../utils/jwt.util.js");
jest.mock("../../../utils/apihelper.util.js");

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should pass if valid Authorization header is provided", () => {
    req.headers!.authorization = "Bearer validtoken";
    (JWTUtil.extractToken as jest.Mock).mockReturnValue("validtoken");
    (JWTUtil.verifyToken as jest.Mock).mockReturnValue({ userId: "1", role: "Tenant" });

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "1", role: "Tenant" });
  });

  it("should pass if valid cookie is provided", () => {
    req.headers!.cookie = "auth_token=validtoken";
    (JWTUtil.verifyToken as jest.Mock).mockReturnValue({ userId: "2", role: "Admin" });

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "2", role: "Admin" });
  });

  it("should return error if no token is provided", () => {
    authMiddleware(req as Request, res as Response, next);
    expect(ApiResponseHelper.error).toHaveBeenCalledWith(res, "No authorization token provided", 401);
  });

  it("should return error if token is invalid", () => {
    req.headers!.authorization = "Bearer invalidtoken";
    (JWTUtil.extractToken as jest.Mock).mockReturnValue("invalidtoken");
    (JWTUtil.verifyToken as jest.Mock).mockImplementation(() => { throw new Error("Invalid token"); });

    authMiddleware(req as Request, res as Response, next);

    expect(ApiResponseHelper.error).toHaveBeenCalledWith(res, "Invalid token", 401);
  });

  it("should alias authorizedMiddleware to authMiddleware", () => {
    expect(authorizedMiddleware).toBe(authMiddleware);
  });

  it("should parse multiple cookies and find auth_token", () => {
    req.headers!.cookie = "other=123; auth_token=validtoken; extra=456";
    (JWTUtil.verifyToken as jest.Mock).mockReturnValue({ userId: "3" });

    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("should fail if auth_token is not in cookies", () => {
    req.headers!.cookie = "other=123; extra=456";
    authMiddleware(req as Request, res as Response, next);
    expect(ApiResponseHelper.error).toHaveBeenCalledWith(res, "No authorization token provided", 401);
  });
  
  it("should extract token correctly when Bearer has extra spaces", () => {
    req.headers!.authorization = "Bearer    validtoken  ";
    (JWTUtil.extractToken as jest.Mock).mockReturnValue("validtoken");
    (JWTUtil.verifyToken as jest.Mock).mockReturnValue({ userId: "4" });
    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
