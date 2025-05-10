import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = null;

    if (session?.user?.id) {
      userId = session.user.id;
    }

    const { customerInfo, cartItems, totalAmount } = await request.json();

    if (!customerInfo || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Geçersiz sipariş bilgileri" }, { status: 400 });
    }

    const { firstName, lastName, phone, address, email } = customerInfo;

    const order = await prisma.order.create({
      data: {
        customerName: firstName,
        customerSurname: lastName,
        phone,
        address,
        email,
        totalAmount: parseFloat(totalAmount),
        createdAt: new Date(),
        userId: userId
      }
    });

    await prisma.orderItem.createMany({
      data: cartItems.map(item => ({
        orderId: order.id,
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    });

   
    try {
      await sendOrderEmails(email, order.id, customerInfo, cartItems, totalAmount);
    } catch (emailError) {
      console.error("E-posta gönderme hatası:", emailError);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        warning: "Sipariş kaydedildi fakat e-posta gönderilemedi: " + emailError.message
      }, { status: 201 });
    }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });

  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı: " + error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}




async function sendOrderEmails(customerEmail, orderId, customerInfo, cartItems, totalAmount) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("E-posta yapılandırması eksik");
  }

  const emailHtml = createOrderEmailHtml(orderId, customerInfo, cartItems, totalAmount);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
  });

  await transporter.verify();

  // Müşteriye e-posta
  if (customerEmail) {
    await transporter.sendMail({
      from: `"Yemek Sipariş" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Sipariş Onayı #${orderId}`,
      html: emailHtml
    });
  }

  // İşletmeye e-posta
  await transporter.sendMail({
    from: `"Yemek Sipariş" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `YENİ SİPARİŞ #${orderId} - ${customerInfo.firstName} ${customerInfo.lastName}`,
    html: emailHtml,
    replyTo: customerEmail || process.env.EMAIL_USER
  });
}

function createOrderEmailHtml(orderId, customerInfo, cartItems, totalAmount) {
  const itemsHtml = cartItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price} TL</td>
      <td>${(item.quantity * item.price).toFixed(2)} TL</td>
    </tr>`).join("");

  return `
    <h2>Sipariş Onayı</h2>
    <p>Sayın ${customerInfo.firstName} ${customerInfo.lastName},</p>
    <p>Siparişiniz başarıyla alınmıştır. Sipariş numaranız: #${orderId}</p>

    <h3>Sipariş Bilgileri</h3>
    <p>
      <strong>Ad Soyad:</strong> ${customerInfo.firstName} ${customerInfo.lastName}<br>
      <strong>E-posta:</strong> ${customerInfo.email || "Belirtilmedi"}<br>
      <strong>Adres:</strong> ${customerInfo.address}<br>
      <strong>Telefon:</strong> ${customerInfo.phone}
    </p>

    <h3>Sipariş Detayları</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <tr>
        <th>Ürün</th>
        <th>Adet</th>
        <th>Birim Fiyat</th>
        <th>Toplam</th>
      </tr>
      ${itemsHtml}
      <tr>
        <td colspan="3" align="right"><strong>Genel Toplam:</strong></td>
        <td><strong>${totalAmount.toFixed(2)} TL</strong></td>
      </tr>
    </table>

    <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
  `;
}
