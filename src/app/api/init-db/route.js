import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * Veritabanı bağlantısını test eden endpoint.
 * GET isteği ile çağrıldığında bağlantıyı açar ve durumu bildirir.
 */
export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ message: 'Veritabanı başarıyla başlatıldı.' });
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    return NextResponse.json(
      { error: 'Veritabanı başlatılırken bir hata oluştu.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
