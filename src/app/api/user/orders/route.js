import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Oturum bulunamadı');
      return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });
    }

    console.log('Kullanıcı e-postası:', session.user.email);

    
    let userId = session.user.id;

    
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });

      if (!user) {
        console.log('Kullanıcı bulunamadı');
        return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
      }

      userId = user.id;
    }

    console.log('Kullanıcı ID:', userId);

    
    userId = Number(userId);

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`${orders.length} sipariş bulundu`);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Sipariş bilgisi hatası:', error);
    return NextResponse.json(
      { 
        message: 'Hata oluştu', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}