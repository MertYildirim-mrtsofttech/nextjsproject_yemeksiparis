// models/TempOrder.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function storeTempOrder(customerInfo, cartItems, userId) {
  try {
    
    const tempOrder = await prisma.tempOrder.create({
      data: {
        customerInfo: JSON.stringify(customerInfo),
        cartItems: JSON.stringify(cartItems),
        userId: userId || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
      }
    });
    
    return tempOrder.id;
  } catch (error) {
    console.error('Error storing temporary order:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTempOrder(tempOrderId) {
  try {
    const tempOrder = await prisma.tempOrder.findUnique({
      where: {
        id: parseInt(tempOrderId)
      }
    });
    
    if (!tempOrder) {
      throw new Error('Temporary order not found');
    }
    
    return {
      customerInfo: JSON.parse(tempOrder.customerInfo),
      cartItems: JSON.parse(tempOrder.cartItems),
      userId: tempOrder.userId
    };
  } catch (error) {
    console.error('Error retrieving temporary order:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteTempOrder(tempOrderId) {
  try {
    await prisma.tempOrder.delete({
      where: {
        id: parseInt(tempOrderId)
      }
    });
  } catch (error) {
    console.error('Error deleting temporary order:', error);
  } finally {
    await prisma.$disconnect();
  }
}