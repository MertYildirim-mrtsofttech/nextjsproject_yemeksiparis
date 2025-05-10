import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Yetkisiz erişim" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { currentPassword, newEmail } = await req.json();

  if (!currentPassword || !newEmail) {
    return new Response(JSON.stringify({ message: "Gerekli alanlar eksik" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "Kullanıcı bulunamadı" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: "Mevcut şifre yanlış" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

  
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return new Response(JSON.stringify({ message: "E-posta zaten kullanımda" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail }
    });

    return new Response(JSON.stringify({ message: "E-posta başarıyla güncellendi" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("E-posta güncelleme hatası:", error);
    return new Response(JSON.stringify({ message: "E-posta güncellenemedi" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
