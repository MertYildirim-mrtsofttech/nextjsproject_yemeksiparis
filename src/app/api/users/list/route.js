import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı!' }, { status: 404 });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.id  // KENDİSİNİ HARİÇ TUT
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}
