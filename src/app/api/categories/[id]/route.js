import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// ID'ye göre kategori getir
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    const category = await prisma.Category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return NextResponse.json({ message: 'Kategori bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori alınırken hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Kategoriyi güncelle
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Kategori adı zorunludur' }, { status: 400 });
    }

    const existingCategory = await prisma.Category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ message: 'Güncellenecek kategori bulunamadı' }, { status: 404 });
    }

    const updatedCategory = await prisma.Category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description || ''
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Kategoriyi sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const id = parseInt(params.id);

    const existingCategory = await prisma.Category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ message: 'Silinecek kategori bulunamadı' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.MenuItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
      await tx.Category.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Kategori silinirken hata:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
