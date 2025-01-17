// import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import jwt from "jsonwebtoken";

// const generateAccessAndRefreshTokens = async (userId) => {
//     try {
//         const user = await User.findById(userId);
//         const accessToken = user.generateAccessToken();
//         const refreshToken = user.generateRefreshToken();

//         user.refreshToken = refreshToken;
//         await user.save({ validateBeforeSave: false });

//         return { accessToken, refreshToken };
//     } catch (error) {
//         throw new ApiError(500, "Something went wrong while generating tokens");
//     }
// };

// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     if (!email) {
//         throw new ApiError(400, "Email is required");
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//         throw new ApiError(404, "User does not exist");
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password);

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid credentials");
//     }

//     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

//     return res
//         .status(200)
//         .cookie("accessToken", accessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production"
//         })
//         .cookie("refreshToken", refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production"
//         })
//         .json(new ApiResponse(200, {
//             user: loggedInUser,
//             accessToken,
//             refreshToken
//         }, "Login successful"));
// });

// const refreshAccessToken = asyncHandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "Unauthorized request");
//     }

//     try {
//         const decodedToken = jwt.verify(
//             incomingRefreshToken,
//             process.env.REFRESH_TOKEN_SECRET
//         );

//         const user = await User.findById(decodedToken?._id);

//         if (!user) {
//             throw new ApiError(401, "Invalid refresh token");
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Refresh token is expired or used");
//         }

//         const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production"
//             })
//             .cookie("refreshToken", refreshToken, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production"
//             })
//             .json(new ApiResponse(200, {
//                 accessToken,
//                 refreshToken
//             }, "Access token refreshed"));
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token");
//     }
// });

// const logoutUser = asyncHandler(async (req, res) => {
//     await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $set: {
//                 refreshToken: undefined
//             }
//         },
//         {
//             new: true
//         }
//     );

//     return res
//         .status(200)
//         .clearCookie("accessToken")
//         .clearCookie("refreshToken")
//         .json(new ApiResponse(200, {}, "User logged out successfully"));
// });

// const registerUser = asyncHandler(async (req, res) => {
//     try {
//         const { fullName, email, password } = req.body;

//         // Add debug logs
//         console.log("Received registration request:", { fullName, email });

//         if ([fullName, email, password].some((field) => field?.trim() === "")) {
//             throw new ApiError(400, "All fields are required");
//         }

//         const existedUser = await User.findOne({ email });

//         if (existedUser) {
//             throw new ApiError(409, "User with email already exists");
//         }

//         const user = await User.create({
//             fullName,
//             email,
//             password
//         });

//         const createdUser = await User.findById(user._id).select(
//             "-password -refreshToken"
//         );

//         if (!createdUser) {
//             throw new ApiError(500, "Something went wrong while registering the user");
//         }

//         return res.status(201).json(
//             new ApiResponse(200, createdUser, "User registered Successfully")
//         );
//     } catch (error) {
//         // Add error logging
//         console.error("Registration error:", error);
//         throw new ApiError(500, error.message || "Registration failed");
//     }
// });

// export {
//     registerUser,
//     loginUser,
//     logoutUser,
//     refreshAccessToken
// }; 