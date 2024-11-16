import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/db/config";
import { sendVerificationEmail } from "@/lib/email/resend/emailSenders";
import { signUpSchema } from "@/lib/validations/authSchemas";
import User from "@/lib/db/models/User";
import { generateVerificationCode } from "@/lib/helpers/generateVerificationCode";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsedData = signUpSchema.parse(data);
    const VERIFICATION_CODE_EXPIRY_DURATION = 24 * 60 * 60 * 1000;

    const { username, email, firstName, lastName, password } = parsedData;

    await connectMongoDB();

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCodeExpiry = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_DURATION
    );

    const existingUser = await User.findOne({ email });

    // Check if user already exists
    if (!existingUser) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        return NextResponse.json(
          { success: false, message: "Username is already taken." },
          { status: 409 }
        );
      }
      const verificationCode = generateVerificationCode();

      // Create a new user and save to the database
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        verificationCode,
        verificationCodeExpiry,
        isVerified: false,
      });

      await newUser.save();

      const emailRes = await sendVerificationEmail(
        email,
        username,
        verificationCode
      );

      if (emailRes.success) {
        return NextResponse.json(
          {
            success: true,
            message: "Signup successful. Please verify your email.",
          },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: emailRes.message },
          { status: 500 }
        );
      }
    } else {
      // If user exists and is verified, inform the user
      if (existingUser.isVerified) {
        return NextResponse.json(
          {
            success: true,
            message:
              "If an account exists for this email, a verification email has been sent.",
          },
          { status: 200 }
        );
      }
      // Resend verification email
      existingUser.verificationCode = generateVerificationCode();
      existingUser.verificationCodeExpiry = verificationCodeExpiry;

      await existingUser.save();

      const emailRes = await sendVerificationEmail(
        email,
        existingUser.username,
        existingUser.verificationCode
      );

      if (emailRes.success) {
        return NextResponse.json(
          {
            success: true,
            message: "Verification email resent. Please check your inbox.",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: emailRes.message },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }
    // Duplicate key error
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate email address check
      if (error.keyPattern?.email) {
        return NextResponse.json(
          {
            success: true,
            message:
              "If an account exists for this email, a verification email has been sent.",
          },
          { status: 200 }
        );
      }
      // Duplicate username check
      if (error.keyPattern?.username) {
        return NextResponse.json(
          { success: false, message: "Username is already taken." },
          { status: 400 }
        );
      }
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
