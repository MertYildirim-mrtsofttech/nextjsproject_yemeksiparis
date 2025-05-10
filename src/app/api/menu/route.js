import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Tüm menü öğelerini getir
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { category: true }
    });

    const formatted = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category_id: item.categoryId,
      category_name: item.category?.name || null,
      price: item.price,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Menü getirme hatası:", error);
    return NextResponse.json({ error: "Menü öğeleri alınamadı" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Yeni menü öğesi oluştur
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    const { name, description, category_id, price, imageUrl } = await request.json();

    if (!name || !price || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: "Ad ve geçerli fiyat zorunludur" }, { status: 400 });
    }

    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        categoryId: parseInt(category_id),
        price: parseFloat(price),
        imageUrl: imageUrl
      },
      include: { category: true }
    });

    return NextResponse.json({
      id: newMenuItem.id,
      name: newMenuItem.name,
      description: newMenuItem.description,
      category_id: newMenuItem.categoryId,
      category_name: newMenuItem.category?.name || null,
      price: newMenuItem.price,
      imageUrl: newMenuItem.imageUrl,
      createdAt: newMenuItem.createdAt,
      updatedAt: newMenuItem.updatedAt
    }, { status: 201 });
  } catch (error) {
    console.error("Menü ekleme hatası:", error);
    return NextResponse.json({ error: "Menü öğesi eklenemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
