import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    const discountCodes = await prisma.discountCode.findMany({
      include: {
        discountMenuItems: {
          include: { menuItem: true }
        }
      }
    });

    return NextResponse.json(discountCodes);
  } catch (error) {
    console.error("İndirim kodları getirme hatası:", error);
    return NextResponse.json({ error: "İndirim kodları alınamadı" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    const data = await request.json();
    let {
      code,
      description,
      amount,
      isPercent,
      minOrderAmount,
      maxUses,
      startDate,
      endDate,
      isActive,
      menuItemIds
    } = data;

    if (!code || typeof amount !== 'number' || !startDate || !endDate) {
      return NextResponse.json({ 
        error: "Kod, tutar, başlangıç ve bitiş tarihi gereklidir" 
      }, { status: 400 });
    }

    if (maxUses === "") maxUses = null;
    else if (typeof maxUses === "string") maxUses = parseInt(maxUses);

    if (minOrderAmount === "") minOrderAmount = null;
    else if (typeof minOrderAmount === "string") minOrderAmount = parseFloat(minOrderAmount);

    const cleanMenuItemIds = Array.isArray(menuItemIds)
      ? menuItemIds.map(id => Number(id)).filter(id => !isNaN(id))
      : [];

    const existingCode = await prisma.discountCode.findUnique({
      where: { code }
    });

    if (existingCode) {
      return NextResponse.json({ error: "Bu indirim kodu zaten mevcut" }, { status: 400 });
    }

    const newDiscountCode = await prisma.discountCode.create({
      data: {
        code,
        description,
        amount,
        isPercent: isPercent ?? true,
        minOrderAmount,
        maxUses,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        discountMenuItems: {
          create: cleanMenuItemIds.map(menuItemId => ({
            menuItem: { connect: { id: menuItemId } }
          }))
        }
      },
      include: {
        discountMenuItems: {
          include: { menuItem: true }
        }
      }
    });

    return NextResponse.json(newDiscountCode, { status: 201 });
  } catch (error) {
    console.error("İndirim kodu oluşturma hatası:", error);
    return NextResponse.json({ error: "İndirim kodu oluşturulamadı" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    const data = await request.json();
    let {
      id,
      code,
      description,
      amount,
      isPercent,
      minOrderAmount,
      maxUses,
      startDate,
      endDate,
      isActive,
      menuItemIds
    } = data;

    if (!id) {
      return NextResponse.json({ error: "İndirim kodu ID'si gereklidir" }, { status: 400 });
    }

    if (maxUses === "") maxUses = null;
    else if (typeof maxUses === "string") maxUses = parseInt(maxUses);

    if (minOrderAmount === "") minOrderAmount = null;
    else if (typeof minOrderAmount === "string") minOrderAmount = parseFloat(minOrderAmount);

    const cleanMenuItemIds = Array.isArray(menuItemIds)
      ? menuItemIds.map(id => Number(id)).filter(id => !isNaN(id))
      : [];

    
    await prisma.discountMenuItem.deleteMany({
      where: { discountCodeId: id }
    });

    const updatedDiscountCode = await prisma.discountCode.update({
      where: { id },
      data: {
        code,
        description,
        amount,
        isPercent,
        minOrderAmount,
        maxUses,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        discountMenuItems: {
          create: cleanMenuItemIds.map(menuItemId => ({
            menuItem: { connect: { id: menuItemId } }
          }))
        }
      },
      include: {
        discountMenuItems: {
          include: { menuItem: true }
        }
      }
    });

    return NextResponse.json(updatedDiscountCode);
  } catch (error) {
    console.error("İndirim kodu güncelleme hatası:", error);
    return NextResponse.json({ error: "İndirim kodu güncellenemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "İzin reddedildi" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: "İndirim kodu ID'si gereklidir" }, { status: 400 });
    }

    
    await prisma.discountMenuItem.deleteMany({
      where: { discountCodeId: id }
    });

    await prisma.discountCode.delete({
      where: { id }
    });

    return NextResponse.json({ message: "İndirim kodu başarıyla silindi" });
  } catch (error) {
    console.error("İndirim kodu silme hatası:", error);
    return NextResponse.json({ error: "İndirim kodu silinemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
