import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Banner fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const {
      title,
      description,
      imageUrl,
      linkUrl,
      isActive,
      order,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ message: 'Title and image URL are required' }, { status: 400 });
    }

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || '',
        imageUrl,
        linkUrl: linkUrl || '',
        isActive: typeof isActive === 'boolean' ? isActive : true,
        order: typeof order === 'number' ? order : 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error('Banner update error:', error);
    return NextResponse.json({ message: 'Error updating banner', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Banner deletion error:', error);
    return NextResponse.json({ message: 'Error deleting banner', error: error.message }, { status: 500 });
  }
}
