import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });

    const url = new URL(request.url);
    const receiverId = url.searchParams.get('receiverId');
    if (!receiverId) return NextResponse.json({ message: 'receiverId gerekli' }, { status: 400 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: currentUser.id }
        ]
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.directMessage.updateMany({
      where: {
        senderId: parseInt(receiverId),
        receiverId: currentUser.id,
        isRead: false
      },
      data: { isRead: true }
    });

    // Frontend için mesajları formatla
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender_id: msg.sender.id,
      sender_first_name: msg.sender.firstName,
      sender_last_name: msg.sender.lastName,
      message: msg.message,
      image_path: msg.imagePath,
      created_at: msg.createdAt
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('GET hata:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });

    const body = await request.json();
    const { message, receiverId, imagePath } = body;

    if (!receiverId) return NextResponse.json({ message: 'receiverId gerekli' }, { status: 400 });
    if ((!message || message.trim() === '') && !imagePath) {
      return NextResponse.json({ message: 'Mesaj veya resim gerekli!' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

    if (parseInt(receiverId) === currentUser.id) {
      return NextResponse.json({ message: 'Kendinize mesaj gönderemezsiniz!' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) } });
    if (!receiver) return NextResponse.json({ message: 'Alıcı bulunamadı' }, { status: 404 });

    const newMessage = await prisma.directMessage.create({
      data: {
        senderId: currentUser.id,
        receiverId: parseInt(receiverId),
        message: message || '',
        imagePath: imagePath || null
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mesaj gönderildi',
      id: newMessage.id,
      newMessage: {
        id: newMessage.id,
        sender_id: newMessage.sender.id,
        sender_first_name: newMessage.sender.firstName,
        sender_last_name: newMessage.sender.lastName,
        message: newMessage.message,
        image_path: newMessage.imagePath,
        created_at: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('POST hata:', error);
    return NextResponse.json({ message: 'Hata oluştu', error: error.message }, { status: 500 });
  }
}
