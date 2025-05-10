import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    
    if (!["pending", "approved", "cancelled"].includes(status)) {
      return NextResponse.json({ 
        error: "Geçersiz durum değeri. Durum 'pending', 'approved' veya 'cancelled' olmalıdır." 
      }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    
    if (status === 'cancelled' && updatedOrder.email) {
      try {
        await sendCancellationEmail(updatedOrder);
      } catch (emailError) {
        console.error("E-posta gönderme hatası:", emailError);
        
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Sipariş durumu güncelleme hatası:", error);
    return NextResponse.json({ error: "Sipariş durumu güncellenemedi" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function sendCancellationEmail(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("E-posta yapılandırması eksik");
  }

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

  const emailHtml = `
    <h2>Sipariş İptali</h2>
    <p>Sayın ${order.customerName} ${order.customerSurname},</p>
    <p>Siparişiniz (Sipariş No: #${order.id}) iptal edilmiştir.</p>
    <p>Para iadesi hesabınıza aktarılacaktır.</p>
    <p>Anlayışınız için teşekkür ederiz.</p>
  `;

  
  await transporter.sendMail({
    from: `"Yemek Sipariş" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Sipariş İptali #${order.id}`,
    html: emailHtml
  });
}