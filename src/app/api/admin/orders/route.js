import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Yetkisiz erişim" }), { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error("Sipariş alma hatası:", error);
    return new Response(JSON.stringify({ message: "Siparişler alınamadı", error: error.message }), { status: 500 });
  }

}
