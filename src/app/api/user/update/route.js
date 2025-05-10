import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });
    }

    const data = await request.json();
    const currentEmail = session.user.email;

    const user = await prisma.user.findUnique({ where: { email: currentEmail } });
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // E-posta kontrolü
    const emailChanged = data.email && data.email !== currentEmail;
    if (emailChanged) {
      const emailInUse = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailInUse) {
        return NextResponse.json({ message: 'Bu e-posta zaten kullanımda!' }, { status: 400 });
      }
    }

    // Şifre değişikliği varsa kontrol ve güncelleme
    let passwordChanged = false;
    let newPasswordHash;
    if (data.newPassword && data.currentPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ message: 'Mevcut şifre hatalı!' }, { status: 400 });
      }
      newPasswordHash = await bcrypt.hash(data.newPassword, 10);
      passwordChanged = true;
    }

    const updated = await prisma.user.update({
      where: { email: currentEmail },
      data: {
        email: emailChanged ? data.email : undefined,
        firstName: data.first_name || undefined,
        lastName: data.last_name || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        password: newPasswordHash || undefined
      }
    });

    return NextResponse.json({
      message: 'Kullanıcı bilgileri güncellendi',
      user: {
        email: updated.email,
        first_name: updated.firstName,
        last_name: updated.lastName,
        phone: updated.phone,
        address: updated.address
      },
      requireRelogin: emailChanged || passwordChanged
    });

  } catch (error) {
    console.error('Güncelleme hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu', error: error.message }, { status: 500 });
  }
}
