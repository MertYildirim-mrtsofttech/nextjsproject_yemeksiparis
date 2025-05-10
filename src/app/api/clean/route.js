import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();


async function getTableNames() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `);
  return tables.map(t => t.name).filter(name => name !== '_prisma_migrations');
}

export async function GET() {
  try {
    const tables = await getTableNames();
    return NextResponse.json({ tables });
  } catch (err) {
    console.error('Tablo listesi alınamadı:', err);
    return NextResponse.json({ error: 'Tablo listesi alınamadı' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { tableName } = await req.json();  

    if (!tableName) {
      return NextResponse.json({ error: 'Tablo seçilmedi.' }, { status: 400 });
    }

    
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');

    
    if (tableName === 'User' || tableName === 'Users') {
      await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}" WHERE role != 'admin'`);
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`);
    }

    
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`);

    
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

    
    const users = await prisma.user.findMany({
      select: { email: true },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailText = `Sistem bakımı sebebiyle eski veriler silinmiştir.`;

    for (const user of users) {
      await transporter.sendMail({
        from: `"Sistem Bakımı" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Sistem Bakımı - Veriler Silindi`,
        text: emailText,
      });
    }

    return NextResponse.json({ message: `${tableName} tablosunun verileri başarıyla silindi ve kullanıcılar bilgilendirildi.` });
  } catch (err) {
    console.error('Silme işlemi başarısız:', err);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
