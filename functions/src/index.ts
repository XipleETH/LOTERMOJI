import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Función para generar números aleatorios de lotería
export const generateLotteryNumbers = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎫', '🎰', '🎲'];
  const selectedEmojis = [];
  
  // Seleccionar 4 emojis aleatorios
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    selectedEmojis.push(emojis[randomIndex]);
  }

  return { emojis: selectedEmojis };
});

// Función para ejecutar el sorteo (se ejecutará con un Cloud Schedule)
export const runLotteryDraw = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const winningEmojis = ['🎮', '🎲', '🎯', '🎪']; // Ejemplo, deberías generar aleatoriamente
  
  const gameRef = await db.collection('games').add({
    drawTime: admin.firestore.FieldValue.serverTimestamp(),
    winningEmojis,
    status: 'completed'
  });

  // Buscar tickets ganadores
  const ticketsSnapshot = await db.collection('tickets')
    .where('gameId', '==', gameRef.id)
    .get();

  const winners: any[] = [];
  
  ticketsSnapshot.forEach(doc => {
    const ticket = doc.data();
    const matchCount = ticket.emojis.filter((emoji: string) => 
      winningEmojis.includes(emoji)).length;
    
    if (matchCount >= 3) {
      winners.push({
        ticketId: doc.id,
        walletAddress: ticket.walletAddress,
        matchCount
      });
    }
  });

  // Actualizar el juego con los ganadores
  await gameRef.update({ winners });

  return null;
});

// Función para procesar la compra de tickets
export const purchaseTicket = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { emojis } = data;
  if (!emojis || !Array.isArray(emojis) || emojis.length !== 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Emojis inválidos');
  }

  // Crear el ticket
  const ticketRef = await db.collection('tickets').add({
    walletAddress: context.auth.uid,
    emojis,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    gameId: Date.now().toString(), // Deberías usar el ID del juego actual
    status: 'active'
  });

  return { ticketId: ticketRef.id };
});

// Función para manejar mensajes del chat
export const sendChatMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { message, gameId } = data;
  if (!message || !gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje o gameId inválido');
  }

  await db.collection('chat').add({
    walletAddress: context.auth.uid,
    message,
    gameId,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
}); 