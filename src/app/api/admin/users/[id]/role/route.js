import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Yetkisiz erişim" }), { status: 401 });
  }

    const params = await context.params;
    const userId = parseInt(params.id);

  if (isNaN(userId)) {
    return new Response(JSON.stringify({ message: "Geçersiz kullanıcı ID" }), { status: 400 });
  }

  if (session.user.id === userId) {
    return new Response(
      JSON.stringify({ message: "Kendi admin statünüzü değiştiremezsiniz" }),
      { status: 400 }
    );
  }

  const { role } = await req.json();
  if (!["admin", "user"].includes(role)) {
    return new Response(JSON.stringify({ message: "Geçersiz rol" }), { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
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

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Rol güncelleme hatası:", error);
    return new Response(
      JSON.stringify({ message: "Rol güncellenemedi", error: error.message }),
      { status: 500 }
    );
  }
}
