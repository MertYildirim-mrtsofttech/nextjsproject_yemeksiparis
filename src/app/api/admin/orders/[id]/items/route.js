//app/api/admin/orders/[id]/items/route.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Yetkisiz erişim" }), { status: 401 });
  }

  const orderId = parseInt(params.id);
  try {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        menuItem: true
      }
    });

    const formatted = items.map(item => ({
      id: item.id,
      order_id: item.orderId,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
      menu_item: {
        id: item.menuItem.id,
        name: item.menuItem.name,
        description: item.menuItem.description,
        price: item.menuItem.price,
        image_url: item.menuItem.imageUrl
      }
    }));

    return new Response(JSON.stringify(formatted), { status: 200 });
  } catch (error) {
    console.error("Sipariş ürünleri hatası:", error);
    return new Response(JSON.stringify({ message: "Sipariş ürünleri alınamadı", error: error.message }), { status: 500 });
  }
}
