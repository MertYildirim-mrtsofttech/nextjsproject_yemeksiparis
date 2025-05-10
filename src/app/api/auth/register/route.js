// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { firstName, lastName, email, phone, address, password } = await request.json();

    // Validasyon
    if (!firstName || !lastName || !email || !phone || !address || !password) {
      return NextResponse.json({ message: 'Tüm alanları doldurunuz.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Geçerli bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        password: hashedPassword,
        role: "user" 
      }
    });

    return NextResponse.json({ message: 'Kullanıcı başarıyla kaydedildi.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
