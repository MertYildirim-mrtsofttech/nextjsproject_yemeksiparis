import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { getTempOrder, deleteTempOrder } from '@/models/TempOrder';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id eksik' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    
    const tempOrderId = session.metadata.tempOrderId;
    if (!tempOrderId) {
      return NextResponse.json({ error: 'Geçersiz sipariş' }, { status: 400 });
    }
    
    
    const { customerInfo, cartItems, userId } = await getTempOrder(tempOrderId);

    if (!customerInfo.email || cartItems.length === 0) {
      return NextResponse.json({ error: 'Geçersiz müşteri veya sepet verisi' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerInfo.firstName,
        customerSurname: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        totalAmount: parseFloat(session.amount_total / 100),
        paymentStatus: 'ödendi', 
        userId: userId || null,
        customerNote: customerInfo.note || null,
        orderItems: {
          create: cartItems.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    const orderDetails = cartItems
      .map(item => `• ${item.name} x${item.quantity} - ${item.price}₺`)
      .join('\n');

    const totalAmount = (session.amount_total / 100).toFixed(2);

    
    const customerMailText = `
Merhaba ${customerInfo.firstName} ${customerInfo.lastName},
Siparişiniz başarıyla alınmıştır.
📦 Sipariş Numaranız: #${order.id}
🧾 Sipariş Detayları:
${orderDetails}
🧍‍♂️ Müşteri Bilgileri:
Ad Soyad : ${customerInfo.firstName} ${customerInfo.lastName}
E-posta  : ${customerInfo.email}
Telefon  : ${customerInfo.phone}
Adres    : ${customerInfo.address}
📝 Müşteri Notu: ${customerInfo.note || 'Belirtilmemiş'}
Toplam Tutar: ${totalAmount} TL
Teşekkür ederiz!
    `.trim();

    
    const adminMailText = `
Yeni Sipariş Alındı!
📦 Sipariş Numarası: #${order.id}
📅 Sipariş Tarihi: ${new Date().toLocaleString('tr-TR')}
🧾 Sipariş Detayları:
${orderDetails}
🧍‍♂️ Müşteri Bilgileri:
Ad Soyad : ${customerInfo.firstName} ${customerInfo.lastName}
E-posta  : ${customerInfo.email}
Telefon  : ${customerInfo.phone}
Adres    : ${customerInfo.address}
📝 Müşteri Notu: ${customerInfo.note || 'Belirtilmemiş'}
💰 Toplam Tutar: ${totalAmount} TL
    `.trim();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    
    await transporter.sendMail({
      from: `"Sipariş Sistemi" <${process.env.EMAIL_USER}>`,
      to: customerInfo.email,
      subject: `Siparişiniz Alındı - #${order.id}`,
      text: customerMailText
    });

    
    await transporter.sendMail({
      from: `"Sipariş Sistemi" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Yeni Sipariş - #${order.id}`,
      text: adminMailText
    });

    
    await deleteTempOrder(tempOrderId);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Sipariş oluşturulamadı:', error);
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}