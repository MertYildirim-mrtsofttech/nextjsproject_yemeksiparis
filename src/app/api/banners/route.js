import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banner loading error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const { title, description, imageUrl, linkUrl, isActive, order } = await request.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ message: 'Title and image URL are required' }, { status: 400 });
    }

    const newBanner = await prisma.banner.create({
      data: {
        title,
        description: description || '',
        imageUrl,
        linkUrl: linkUrl || '',
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0
      }
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error('Banner creation error:', error);
    return NextResponse.json({ message: 'Error creating banner', error: error.message }, { status: 500 });
  }
}