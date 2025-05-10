import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

    const unreadCounts = await prisma.directMessage.groupBy({
      by: ['senderId'],
      where: {
        receiverId: user.id,
        isRead: false
      },
      _count: true
    });

    const formatted = unreadCounts.map(item => ({
      sender_id: item.senderId,
      count: item._count
    }));

    return NextResponse.json({ unreadCounts: formatted });
  } catch (error) {
    console.error('Okunmamış mesaj sayıları hatası:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}
