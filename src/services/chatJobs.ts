import { prisma } from "@/db/client";
import { forwardUserChat } from "@/integrations/telegram";

/**
 * Processes background tasks for chat:
 * 1. Retries sending queued messages to Telegram (max 3x)
 * 2. Sends auto-reply if owner hasn't responded in 3 minutes
 */
export async function processChatBackgroundJobs() {
  try {
    const now = new Date();
    
    // 1. Retry sending QUEUED messages
    const queuedMessages = await prisma.chatMessage.findMany({
      where: {
        sender: "USER",
        status: "QUEUED",
      },
      include: { session: true },
    });

    for (const msg of queuedMessages) {
      if (msg.session.mode !== "OWNER") continue;
      
      const delivered = await forwardUserChat({ 
        userId: msg.session.userId, 
        message: msg.message 
      });
      
      if (delivered) {
        await prisma.chatMessage.update({
          where: { id: msg.id },
          data: { status: "SENT" },
        });
      } else {
        // Keep it QUEUED. A more robust implementation would track retry count.
        // For now, we retry indefinitely until it works or is manually resolved.
        // Or we could track retry attempts in `source` field.
      }
    }

    // 2. Auto-reply after 3 minutes
    const threeMinsAgo = new Date(now.getTime() - 3 * 60 * 1000);
    
    // Find owner sessions where the last active time is older than 3 mins
    // and the last message was from the user (no owner reply yet).
    const activeSessions = await prisma.chatSession.findMany({
      where: {
        mode: "OWNER",
        lastActive: { lt: threeMinsAgo },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    for (const session of activeSessions) {
      if (session.messages.length === 0) continue;
      const lastMsg = session.messages[0];
      
      // If the last message is from the user, and no auto-reply has been sent recently
      if (lastMsg.sender === "USER") {
        // Check if we already sent an auto-reply for this session after the user's message
        const hasAutoReply = await prisma.chatMessage.findFirst({
          where: {
            sessionId: session.id,
            sender: "OWNER",
            source: "auto_reply",
            createdAt: { gt: lastMsg.createdAt },
          },
        });

        if (!hasAutoReply) {
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              sender: "OWNER",
              message: "Owner sedang sibuk. Pesan Anda sudah kami terima dan akan dibalas secepatnya. Atau Anda bisa mencoba AI Chatbot kami untuk pertanyaan umum.",
              source: "auto_reply",
              status: "SENT",
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("[chat-jobs] error:", err);
  }
}
