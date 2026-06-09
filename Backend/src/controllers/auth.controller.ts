// import type { Request, Response } from "express";
// import { loginSchema, registerSchema } from "../dtos/auth.dto.js";
// import { AuthService } from "../services/auth.service.js";
// import { ApiResponseHelper } from "../utils/apihelper.util.js";

// const authService = new AuthService();

// export class AuthController{

//     async register(req: Request, res: Response){
//         try{
//             const parsed = registerSchema.safeParse(req.body);
//             if(!parsed.success){
//                 return ApiResponseHelper.error(
//                     res,
//                     parsed.error.message,
//                     400
//                 );
//             }

//             const user = await authService.register(parsed.data);

//             return ApiResponseHelper.success(
//                 res,
//                 user,
//                 "User registered successfully",
//                 201
//             );
//         } catch (err: any){
//             return ApiResponseHelper.error(
//                 res,
//                 err.message,
//                 err.status ?? 500
//             )
//         }
//     }

//     async login( req: Request, res: Response){
//         try{

//             const parsed = loginSchema.safeParse(req.body);
//             if(!parsed.success){
//                 return ApiResponseHelper.error(
//                     res,
//                     parsed.error.message,
//                     400
//                 );
//             }

//             const result = await authService.login(
//                 parsed.data.email,
//                 parsed.data.password
//             );

//             return ApiResponseHelper.success(
//                 res,
//                 result,
//                 "Login successful"
//             );
//         } catch (err: any){
//             return ApiResponseHelper.error(
//                 res,
//                 err.message,
//                 err.status ?? 500
//             );
//         }
//     }
// }



import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { RegisterDTO, LoginDTO } from "../dtos/auth.dto.js";

const authService = new AuthService();

export class AuthController {

  async register(req: Request, res: Response) {
    try {
      const parsedData = RegisterDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues
        );
      }

      const newUser = await authService.register(parsedData.data);

      return ApiResponseHelper.success(
        res,
        newUser,
        "User registered successfully",
        201
      );
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      
      return ApiResponseHelper.error(
        res,
        errorMessage,
        errorStatus
      );
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues
        );
      }

      const loginResponse = await authService.login(parsedData.data);

      return ApiResponseHelper.success(
        res,
        loginResponse,
        "Login successful",
        200
      );
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      
      return ApiResponseHelper.error(
        res,
        errorMessage,
        errorStatus
      );
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await authService.getCurrentUser(userId);

      return ApiResponseHelper.success(
        res,
        user,
        "User profile fetched successfully"
      );
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      
      return ApiResponseHelper.error(
        res,
        errorMessage,
        errorStatus
      );
    }
  }
}