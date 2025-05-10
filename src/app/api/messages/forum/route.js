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

    const messages = await prisma.forumMessage.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.message,
      image_path: msg.imagePath,
      created_at: msg.createdAt,
      first_name: msg.user.firstName,
      last_name: msg.user.lastName,
      email: msg.user.email,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Forum mesajı alma hatası:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });
    }

    const body = await request.json();
    const { message, imagePath } = body;

    if ((!message || message.trim() === '') && !imagePath) {
      return NextResponse.json({ message: 'Mesaj veya resim gerekli!' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const newMessage = await prisma.forumMessage.create({
      data: {
        userId: user.id,
        message: message || '',
        imagePath: imagePath || null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    
    return NextResponse.json({
      success: true,
      message: 'Mesaj gönderildi',
      id: newMessage.id,
      newMessage: {
        id: newMessage.id,
        message: newMessage.message,
        image_path: newMessage.imagePath,
        created_at: newMessage.createdAt,
        first_name: newMessage.user.firstName,
        last_name: newMessage.user.lastName,
        email: newMessage.user.email,
      }
    });
  } catch (error) {
    console.error('Forum mesajı gönderme hatası:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}
