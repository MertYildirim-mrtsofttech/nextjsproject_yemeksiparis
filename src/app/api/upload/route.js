import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Oturum bulunamadı!' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'Dosya gönderilmedi!' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        message: 'Desteklenmeyen dosya türü. Sadece JPG, PNG, GIF ve WEBP desteklenir.'
      }, { status: 400 });
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      return NextResponse.json({ message: 'Dosya boyutu 5MB\'dan büyük olamaz!' }, { status: 400 });
    }

    const extension = file.type.split('/')[1];
    const filename = `${uuidv4()}.${extension}`;
    const yearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const uploadDir = join(process.cwd(), 'public', 'uploads', yearMonth);

    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/${yearMonth}/${filename}`;
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      message: 'Dosya başarıyla yüklendi'
    });

  } catch (error) {
    console.error('Dosya yüklenirken hata:', error);
    return NextResponse.json({
      message: 'Dosya yüklenirken bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
}
