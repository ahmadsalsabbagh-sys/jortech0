import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Deliberately separate from {@link MarkChatReadDto}, which the unread route used to share. The read
 * route accepts `messageIds`; the unread route has nothing to do with them and ignores them, so
 * sharing the class published a field on `POST /chats/unread` that it silently discarded.
 */
export class MarkChatUnreadDto {
  @ApiProperty({
    description: "Chat ID in the active engine's native format (e.g. 1234567890@c.us on whatsapp-web.js)",
    example: '1234567890@c.us',
  })
  @IsString()
  @IsNotEmpty()
  // Engine-neutral structural check (localpart@host, no whitespace) so a different engine's JID
  // scheme (e.g. Baileys 1234@s.whatsapp.net) is accepted too; the adapter normalises further.
  @Matches(/^[^\s@]+@[^\s@]+$/, {
    message: 'chatId must be a valid chat JID in the form localpart@host',
  })
  chatId!: string;
}
