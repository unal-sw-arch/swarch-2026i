import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { ChevronDown, Flame, HandHeart, Heart, HeartHandshake, Send, Sparkles } from 'lucide-react';
import type {
  ChatMessage,
  ChatReactionKey,
  ChatReactions,
  RoomChatEvent,
  RoomMember,
} from '../types';

interface RoomChatProps {
  roomName: string;
  members: RoomMember[];
  currentUserId: number | null;
  currentUserName: string;
  initialMessages?: ChatMessage[];
  incomingEvent?: RoomChatEvent | null;
  onSendMessage?: (message: ChatMessage) => void;
  onReactToMessage?: (payload: {
    messageId: string | number;
    reactionKey: ChatReactionKey;
    nextCount: number;
    nextReactorUserIds: number[];
  }) => void;
}

const REACTION_KEYS: ChatReactionKey[] = ['love', 'clap', 'fire', 'encourage'];

const memberColors = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getMemberColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return memberColors[hash % memberColors.length];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function withDefaultSocialState(message: ChatMessage): ChatMessage {
  return {
    ...message,
    reactions: {
      love: message.reactions?.love ?? 0,
      clap: message.reactions?.clap ?? 0,
      fire: message.reactions?.fire ?? 0,
      encourage: message.reactions?.encourage ?? 0,
    },
    reaction_user_ids: message.reaction_user_ids ?? {},
  };
}

function reactionPresentation(key: ChatReactionKey) {
  if (key === 'love') return { label: 'Love', icon: Heart };
  if (key === 'clap') return { label: 'Clap', icon: HandHeart };
  if (key === 'encourage') return { label: 'Encourage', icon: HeartHandshake };
  return { label: 'Fire', icon: Flame };
}

function buildReactions(counts: Partial<ChatReactions> = {}): ChatReactions {
  return {
    love: counts.love ?? 0,
    clap: counts.clap ?? 0,
    fire: counts.fire ?? 0,
    encourage: counts.encourage ?? 0,
  };
}

export default function RoomChat({
  members,
  currentUserId,
  currentUserName,
  initialMessages,
  incomingEvent,
  onSendMessage,
  onReactToMessage,
}: RoomChatProps) {
  const seedMessages = useMemo<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages.map(withDefaultSocialState);
    }
    return [];
  }, [initialMessages]);

  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [draft, setDraft] = useState('');
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  // Cargar mensajes iniciales
  useEffect(() => {
    setMessages(seedMessages);
  }, [seedMessages]);

  // Scroll al fondo cuando cargan los mensajes iniciales
  useEffect(() => {
    if (seedMessages.length > 0 && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [seedMessages]);

  // Eventos entrantes por WebSocket
  useEffect(() => {
    if (!incomingEvent) return;

    if (incomingEvent.type === 'CHAT_MESSAGE_CREATED') {
      const incoming = incomingEvent.payload.message;
      setMessages((prev) => {
        // Si ya existe un mensaje optimista con el mismo texto y nombre, reemplazarlo
        const hasOptimistic = prev.some(
          (m) => m.text === incoming.text && m.memberName === incoming.memberName && typeof m.id === 'number'
        );
        if (hasOptimistic) {
          return prev.map((m) =>
            m.text === incoming.text && m.memberName === incoming.memberName && typeof m.id === 'number'
              ? withDefaultSocialState(incoming)
              : m
          );
        }
        return [...prev, withDefaultSocialState(incoming)];
      });
      return;
    }

    if (incomingEvent.type === 'CHAT_MESSAGE_REACTION') {
      setMessages((prev) =>
        prev.map((message) => {
          if (String(message.id) !== String(incomingEvent.payload.messageId)) return message;
          return {
            ...message,
            reactions: {
              ...message.reactions,
              [incomingEvent.payload.reactionKey]: incomingEvent.payload.count,
            },
            reaction_user_ids: {
              ...(message.reaction_user_ids ?? {}),
              [incomingEvent.payload.reactionKey]: incomingEvent.payload.reactorUserIds ??
                (message.reaction_user_ids?.[incomingEvent.payload.reactionKey] ?? []),
            },
          };
        }),
      );
      return;
    }
  }, [incomingEvent]);

  // Mostrar botón de scroll al fondo
  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    const updateJumpState = () => {
      const distanceToBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      setShowJumpToLatest(distanceToBottom > 120);
    };

    updateJumpState();
    container.addEventListener('scroll', updateJumpState);
    return () => container.removeEventListener('scroll', updateJumpState);
  }, [messages.length]);

  const jumpToLatest = () => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    setShowJumpToLatest(false);
  };

  const sendMessage = () => {
    const content = draft.trim();
    if (!content) return;

    const ownMember = members.find((m) => m.id === currentUserId);
    const senderName = ownMember?.name || currentUserName || 'You';

    const nextMessage: ChatMessage = {
      id: Date.now(),
      memberId: currentUserId,
      memberName: senderName,
      text: content,
      createdAt: new Date().toISOString(),
      reactions: buildReactions(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    onSendMessage?.(nextMessage);
    setDraft('');
  };

  const toggleReaction = (messageId: string | number, reactionKey: ChatReactionKey) => {
    let nextCountForSocket = 0;
    let nextReactorUserIdsForSocket: number[] = [];

    setMessages((prev) =>
      prev.map((message) => {
        if (String(message.id) !== String(messageId)) return message;
        if (currentUserId === null) return message;

        const currentUsers = message.reaction_user_ids?.[reactionKey] ?? [];
        const alreadyReacted = currentUsers.includes(currentUserId);

        const nextUsers = alreadyReacted
          ? currentUsers.filter((id) => id !== currentUserId)
          : [...currentUsers, currentUserId];

        nextCountForSocket = nextUsers.length;
        nextReactorUserIdsForSocket = nextUsers;

        return {
          ...message,
          reactions: {
            ...message.reactions,
            [reactionKey]: nextUsers.length,
          },
          reaction_user_ids: {
            ...(message.reaction_user_ids ?? {}),
            [reactionKey]: nextUsers,
          },
        };
      }),
    );

    onReactToMessage?.({
      messageId,
      reactionKey,
      nextCount: nextCountForSocket,
      nextReactorUserIds: nextReactorUserIdsForSocket,
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 px-6 py-5 text-white">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Room Chat</h2>
        </div>
        <p className="text-sm text-blue-50 mt-1">
          Keep the vibe warm: celebrate progress, coordinate tasks, and support each other.
        </p>
      </div>

      <div className="relative">
        <div
          ref={messageListRef}
          className="max-h-[420px] overflow-y-auto p-5 bg-gradient-to-b from-slate-50 to-white space-y-4"
        >
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              No messages yet. Be the first to say something! 👋
            </p>
          )}

          {messages.map((message) => {
            const isOwn = message.memberName === currentUserName;
            return (
              <article
                key={message.id}
                className={`rounded-xl border p-4 transition-all ${
                  isOwn
                    ? 'ml-auto max-w-[92%] bg-blue-50 border-blue-200 shadow-blue-100/60 shadow-sm'
                    : 'mr-auto max-w-[92%] bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 border border-white shadow-sm">
                    <AvatarFallback className={getMemberColor(message.memberName) + ' text-white text-xs'}>
                      {getInitials(message.memberName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-gray-900 truncate">{message.memberName}</p>
                      <time className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(message.createdAt)}</time>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">{message.text}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {REACTION_KEYS.map((reactionKey) => {
                        const meta = reactionPresentation(reactionKey);
                        const Icon = meta.icon;
                        const count = message.reactions[reactionKey] ?? 0;
                        const reactedByCurrentUser =
                          currentUserId !== null &&
                          (message.reaction_user_ids?.[reactionKey] ?? []).includes(currentUserId);
                        return (
                          <button
                            key={reactionKey}
                            onClick={() => toggleReaction(message.id, reactionKey)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              reactedByCurrentUser
                                ? 'border-purple-300 bg-purple-100 text-purple-800'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {meta.label}
                            <span>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {showJumpToLatest && (
          <button
            onClick={jumpToLatest}
            className="absolute bottom-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200 bg-white text-purple-600 shadow-sm hover:bg-purple-50 transition-colors"
            aria-label="Jump to latest message"
            title="Jump to latest"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:ring-2 focus-within:ring-purple-300 transition-shadow">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={2}
            placeholder="Send encouragement, organize chores, or celebrate a completed task..."
            className="w-full resize-none border-none bg-transparent p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Be kind and clear. Strong rooms are built in conversation.
            </div>
            <Button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
