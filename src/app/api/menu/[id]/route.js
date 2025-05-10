import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();


export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idParam = pathParts[pathParts.length - 1];
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    
    const menuItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!menuItem) {
      return NextResponse.json({ error: "Menü öğesi bulunamadı" }, { status: 404 });
    }

    try {
      
      await prisma.menuItem.delete({ where: { id } });
      return NextResponse.json({ message: "Menü öğesi silindi" });
    } catch (deleteError) {
      
      if (deleteError.code === 'P2003') {
        
        const orderItems = await prisma.orderItem.findMany({
          where: { menuItemId: id },
          include: { order: true }
        });
        
        if (orderItems.length > 0) {
          
          const orderIds = [...new Set(orderItems.map(item => item.orderId))];
          
          return NextResponse.json({
            error: "Bu menü öğesi siparişlerde kullanıldığı için silinemiyor.",
            orderIds: orderIds,
            orderCount: orderIds.length
          }, { status: 409 });
        } else {
          return NextResponse.json({
            error: "Bu menü öğesi başka verilere bağlı olduğu için silinemiyor.",
            meta: deleteError.meta
          }, { status: 409 });
        }
      }
      throw deleteError; 
    }
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ error: "Silme sırasında hata oluştu" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Menü öğesini güncelle
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idParam = pathParts[pathParts.length - 1];
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    
    const existingItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json({ error: "Menü öğesi bulunamadı" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, category_id, price, imageUrl } = body;
    
    if (!name || !category_id || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: "Eksik ya da geçersiz veri" }, { status: 400 });
    }

    
    const categoryId = parseInt(category_id);
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!categoryExists) {
      return NextResponse.json({ error: "Belirtilen kategori bulunamadı" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        price: parseFloat(price),
        imageUrl: imageUrl
      },
      include: { category: true }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      category_id: updated.categoryId,
      category_name: updated.category?.name || null,
      price: updated.price,
      imageUrl: updated.imageUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: "İlişkili kategori bulunamadı",
        details: error.meta 
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme sırasında hata oluştu" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}