import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { code, cartItems } = await request.json();

    if (!code || !Array.isArray(cartItems)) {
      return NextResponse.json({ valid: false, message: "Geçersiz istek" });
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code },
      include: {
        discountMenuItems: {
          include: { menuItem: true }
        }
      }
    });

    if (!discountCode || !discountCode.isActive) {
      return NextResponse.json({ valid: false, message: "İndirim kodu geçersiz veya pasif" });
    }

    const now = new Date();
    if (discountCode.startDate > now || discountCode.endDate < now) {
      return NextResponse.json({ valid: false, message: "İndirim kodu geçerli değil" });
    }

    const validItemIds = discountCode.discountMenuItems.map(d => d.menuItemId);
    const eligibleItems = cartItems.filter(
      item => validItemIds.length === 0 || validItemIds.includes(item.id)
    );

    const totalEligiblePrice = eligibleItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (
      discountCode.minOrderAmount &&
      totalEligiblePrice < discountCode.minOrderAmount
    ) {
      return NextResponse.json({
        valid: false,
        message: `Bu indirim kodu en az ${discountCode.minOrderAmount}₺ siparişte geçerlidir.`
      });
    }

    let totalDiscount = 0;
    if (discountCode.isPercent) {
      totalDiscount = (totalEligiblePrice * discountCode.amount) / 100;
    } else {
      totalDiscount = Math.min(discountCode.amount, totalEligiblePrice);
    }

    
    const updatedCartItems = cartItems.map(item => {
      const isEligible = validItemIds.length === 0 || validItemIds.includes(item.id);
      const itemTotal = item.price * item.quantity;

      if (!isEligible || totalEligiblePrice === 0) {
        return { ...item, discounted: false };
      }

      const share = (itemTotal / totalEligiblePrice) * totalDiscount;
      const discountedTotal = itemTotal - share;
      const discountedUnitPrice = discountedTotal / item.quantity;

      return {
        ...item,
        discounted: true,
        originalPrice: item.price,
        discountedPrice: parseFloat(discountedUnitPrice.toFixed(2)) // yuvarla
      };
    });

    const newTotal = updatedCartItems.reduce((sum, item) => {
      const price = item.discounted ? item.discountedPrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    const originalTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      valid: true,
      newTotal,
      discountAmount: originalTotal - newTotal,
      discountedItems: updatedCartItems,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        amount: discountCode.amount,
        isPercent: discountCode.isPercent
      }
    });
  } catch (error) {
    console.error("İndirim kodu doğrulama hatası:", error);
    return NextResponse.json({ valid: false, message: "Sunucu hatası" });
  } finally {
    await prisma.$disconnect();
  }
}
