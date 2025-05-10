//app/api/admin/orders/[id]/route.js

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();


export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Sipariş getirme hatası:", error);
    return NextResponse.json({ error: "Sipariş getirilemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = params;
    const orderId = parseInt(id);

    
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    });

    
    const deletedOrder = await prisma.order.delete({
      where: { id: orderId }
    });

    if (!deletedOrder) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sipariş başarıyla silindi" });
  } catch (error) {
    console.error("Sipariş silme hatası:", error);
    
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Sipariş silinemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}