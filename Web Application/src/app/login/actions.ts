// src/app/login/action.tsx
"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { compare } from "bcrypt"; // ✅ Use compare instead of hash

const testUser = {
  id: "1",
  email: "admin@gmail.com",
  password: "password",
};

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be atleast 8 characters" })
    .trim(),
  rememberMe: z.optional(z.boolean().default(false)),
});

export async function login(prevState: any, formData: FormData) {
  // Mengambil data dari formData
  const formEntries = Object.fromEntries(formData);

  // Mengkonversi checkbox remember-me menjadi boolean
  const rememberMe = formEntries["remember-me"] === "on";

  // Menyiapkan data untuk validasi
  const dataToValidate = {
    ...formEntries,
    rememberMe,
  };

  // Validasi dengan Zod
  const result = loginSchema.safeParse(dataToValidate);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Cari user dari database
  const user = await db.getOne("SELECT * FROM users WHERE email = $1", [email]);
  // Cek apakah user ditemukan dan password cocok
  const isPasswordCorrect = user && (await compare(password, user.password));

  if (!isPasswordCorrect) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  await createSession(user.id, user.name, user.email, user.role, rememberMe);

  // Jika remember me diaktifkan, dapat juga menyimpan email dalam cookie
  if (rememberMe) {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "rememberedEmail",
      value: email,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  redirect("/dashboard");
}

export async function logout() {
  // Hapus cookie rememberedEmail saat logout
  const cookieStore = await cookies();
  cookieStore.delete("rememberedEmail");

  await deleteSession();
  redirect("/login");
}
