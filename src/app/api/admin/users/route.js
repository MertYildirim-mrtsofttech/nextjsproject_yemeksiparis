import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Yetkisiz erişim" }), { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Kullanıcılar alınamadı:", error);
    return new Response(JSON.stringify({ message: "Hata oluştu", error: error.message }), { status: 500 });
  }
}
