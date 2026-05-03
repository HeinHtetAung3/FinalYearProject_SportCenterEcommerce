import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/shadcn/card';
import { ScrollArea } from '../components/shadcn/scroll-area';
import { Input } from '../components/shadcn/input';
import { Button } from '../components/shadcn/button';
import {
  fetchCustomerMessages,
  fetchMyConversations,
  sendCustomerMessage,
  startCustomerConversation
} from '../services/chatService';
import { subscribeToConversationMessages } from '../services/chatStomp';
import { formatChatTimestamp } from '../utils/chatFormat';
import { classNames } from '../utils/format';

function mergeMessageList(prev, incoming) {
  const byId = new Map(prev.map((m) => [m.id, m]));
  byId.set(incoming.id, incoming);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export default function CustomerSupportChatPage() {
  const { authState, isAdmin } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  if (isAdmin) {
    return <Navigate to="/admin/chat" replace />;
  }

  const refreshThread = useCallback(async () => {
    if (!conversation?.id) return;
    try {
      const [msgs, list] = await Promise.all([
        fetchCustomerMessages(conversation.id),
        fetchMyConversations()
      ]);
      setMessages(msgs);
      const row = list.find((c) => Number(c.id) === Number(conversation.id));
      if (row) {
        setConversation((prev) =>
          prev ? { ...prev, status: row.status, id: row.id, createdAt: row.createdAt } : prev
        );
      }
    } catch {
      // polling best-effort
    }
  }, [conversation?.id]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError('');
      try {
        const conv = await startCustomerConversation();
        if (cancelled) return;
        setConversation(conv);
        const msgs = await fetchCustomerMessages(conv.id);
        if (cancelled) return;
        setMessages(msgs);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load support chat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const id = setInterval(refreshThread, 4000);
    return () => clearInterval(id);
  }, [conversation?.id, refreshThread]);

  useEffect(() => {
    if (!conversation?.id || !authState?.accessToken) return;
    return subscribeToConversationMessages({
      accessToken: authState.accessToken,
      conversationId: conversation.id,
      onMessage: (msg) => {
        setMessages((prev) => mergeMessageList(prev, msg));
      }
    });
  }, [conversation?.id, authState?.accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isClosed = conversation?.status === 'CLOSED';

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversation?.id || isClosed) return;
    setSending(true);
    setError('');
    try {
      const sent = await sendCustomerMessage({
        conversationId: conversation.id,
        content: text
      });
      setMessages((prev) => mergeMessageList(prev, sent));
      setInput('');
    } catch (e) {
      setError(e.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Container className="py-8">
      <Card className="mx-auto max-w-3xl dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="dark:text-white">Customer support</CardTitle>
          <CardDescription className="dark:text-ink-400">
            Chat with our team. Replies typically arrive shortly during business hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}
          {isClosed ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              This conversation is closed. Contact us again if you need more help.
            </p>
          ) : null}

          {loading ? (
            <LoadingSpinner label="Loading messages…" />
          ) : (
            <>
              <ScrollArea className="h-[min(60vh,480px)] rounded-xl border border-ink-100 bg-ink-50/50 p-4 dark:border-ink-800 dark:bg-ink-950/50">
                <ul className="space-y-3 pr-3">
                  {messages.length === 0 ? (
                    <li className="text-center text-sm text-ink-500 dark:text-ink-400">
                      No messages yet. Say hello to start the conversation.
                    </li>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender === 'CUSTOMER';
                      return (
                        <li
                          key={m.id}
                          className={classNames(
                            'flex',
                            mine ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={classNames(
                              'max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm sm:max-w-[75%]',
                              mine
                                ? 'rounded-br-md bg-ink-950 text-white dark:bg-white dark:text-ink-950'
                                : 'rounded-bl-md border border-ink-100 bg-white text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            <p
                              className={classNames(
                                'mt-1 text-2xs',
                                mine ? 'text-white/70 dark:text-ink-600' : 'text-ink-500 dark:text-ink-400'
                              )}
                            >
                              {formatChatTimestamp(m.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })
                  )}
                  <li ref={bottomRef} />
                </ul>
              </ScrollArea>

              <form onSubmit={handleSend} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input
                  value={input}
                  onChange={(ev) => setInput(ev.target.value)}
                  placeholder={isClosed ? 'Conversation closed' : 'Type a message…'}
                  disabled={isClosed || sending}
                  className="dark:border-ink-700 dark:bg-ink-950 dark:text-white"
                  maxLength={4000}
                />
                <Button
                  type="submit"
                  disabled={isClosed || sending || !input.trim()}
                  className="shrink-0 sm:w-auto"
                >
                  {sending ? 'Sending…' : 'Send'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
