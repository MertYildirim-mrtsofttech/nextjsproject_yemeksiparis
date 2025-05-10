import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Tüm kategorileri getir
export async function GET() {
  try {
    const categories = await prisma.Category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Yeni kategori ekle
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Kategori adı zorunludur' }, { status: 400 });
    }

    const newCategory = await prisma.Category.create({
      data: {
        name: name.trim(),
        description: description || ''
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Kategori eklenirken hata:', error);
    return NextResponse.json({ message: 'Kategori eklenirken bir hata oluştu', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
