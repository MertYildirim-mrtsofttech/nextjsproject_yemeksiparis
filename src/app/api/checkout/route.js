import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { storeTempOrder } from '@/models/TempOrder';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions); 
    const userId = session?.user?.id;

    const { customerInfo, cartItems, discount } = await request.json();

    if (!customerInfo || !customerInfo.email || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Geçersiz müşteri bilgisi veya sepet verisi' }, { status: 400 });
    }

    
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalTotal = discount?.newTotal ?? cartTotal;

   
    const tempOrderId = await storeTempOrder(customerInfo, cartItems, userId);

    
    const lineItems = [
      {
        price_data: {
          currency: 'try',
          product_data: {
            name: discount?.discountCode?.code
              ? `İndirimli Sipariş (${discount.discountCode.code})`
              : 'Toplam Sipariş',
          },
          unit_amount: Math.round(finalTotal * 100), // TL to kuruş
        },
        quantity: 1,
      }
    ];

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerInfo.email,
      metadata: {
        tempOrderId: String(tempOrderId),
        userId: userId ? String(userId) : '',
        ...(discount?.discountCode?.code && { discountCode: discount.discountCode.code })
      },
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Stripe Checkout hatası:', error);
    return NextResponse.json({ error: 'Stripe bağlantı hatası: ' + error.message }, { status: 500 });
  }
}
