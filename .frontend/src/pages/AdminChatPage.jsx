import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/shadcn/card';
import { ScrollArea } from '../components/shadcn/scroll-area';
import { Input } from '../components/shadcn/input';
import { Button } from '../components/shadcn/button';
import {
  fetchAdminConversations,
  fetchAdminMessages,
  sendAdminReply,
  updateConversationStatus
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

export default function AdminChatPage() {
  const { authState } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const selected = conversations.find((c) => Number(c.id) === Number(selectedId));

  const refreshConversationsSilently = useCallback(async () => {
    try {
      const data = await fetchAdminConversations();
      setConversations(data);
    } catch {
      // polling best-effort
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setError('');
      try {
        const data = await fetchAdminConversations();
        if (cancelled) return;
        setConversations(data);
        if (data.length) {
          setSelectedId((prev) => (prev != null ? prev : data[0].id));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load conversations.');
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(refreshConversationsSilently, 5000);
    return () => clearInterval(t);
  }, [refreshConversationsSilently]);

  useEffect(() => {
    if (conversations.length > 0 && selectedId == null) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setMessagesLoading(true);
    setError('');
    try {
      const msgs = await fetchAdminMessages(conversationId);
      setMessages(msgs);
    } catch (e) {
      setError(e.message || 'Could not load messages.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(() => {
      loadMessages(selectedId);
    }, 4000);
    return () => clearInterval(t);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (!selectedId || !authState?.accessToken) return;
    return subscribeToConversationMessages({
      accessToken: authState.accessToken,
      conversationId: selectedId,
      onMessage: (msg) => {
        setMessages((prev) => mergeMessageList(prev, msg));
      }
    });
  }, [selectedId, authState?.accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isClosed = selected?.status === 'CLOSED';

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !selectedId || isClosed) return;
    setSending(true);
    setError('');
    try {
      const sent = await sendAdminReply({
        conversationId: selectedId,
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

  async function handleClose() {
    if (!selectedId || isClosed) return;
    setClosing(true);
    setError('');
    try {
      const updated = await updateConversationStatus(selectedId, 'CLOSED');
      setConversations((prev) =>
        prev.map((c) => (Number(c.id) === Number(selectedId) ? { ...c, status: updated.status } : c))
      );
    } catch (e) {
      setError(e.message || 'Could not close conversation.');
    } finally {
      setClosing(false);
    }
  }

  return (
    <Container className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">Admin</p>
          <h1 className="font-display text-2xl font-bold text-ink-950 dark:text-white">Support inbox</h1>
        </div>
        <Link
          to="/admin"
          className="text-sm font-semibold text-ink-600 underline-offset-4 hover:text-ink-900 hover:underline dark:text-ink-300 dark:hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <Card className="h-[min(70vh,640px)] dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base dark:text-white">Conversations</CardTitle>
            <CardDescription className="dark:text-ink-400">All customer threads</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {listLoading ? (
              <div className="px-6 pb-6">
                <LoadingSpinner label="Loading…" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(min(70vh,640px)-7rem)]">
                <ul className="px-2 pb-4">
                  {conversations.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-ink-500 dark:text-ink-400">
                      No conversations yet.
                    </li>
                  ) : (
                    conversations.map((c) => {
                      const active = Number(c.id) === Number(selectedId);
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(c.id)}
                            className={classNames(
                              'flex w-full flex-col gap-0.5 rounded-xl px-3 py-3 text-left text-sm transition',
                              active
                                ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950'
                                : 'text-ink-800 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
                            )}
                          >
                            <span className="font-semibold">{c.customerFullName || 'Customer'}</span>
                            <span
                              className={classNames(
                                'truncate text-2xs',
                                active ? 'text-white/80 dark:text-ink-600' : 'text-ink-500 dark:text-ink-400'
                              )}
                            >
                              {c.customerEmail}
                            </span>
                            <span
                              className={classNames(
                                'mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-2xs font-semibold uppercase',
                                c.status === 'OPEN'
                                  ? active
                                    ? 'bg-emerald-500/20 text-emerald-100 dark:text-emerald-800'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : active
                                    ? 'bg-white/15 text-white dark:bg-ink-200 dark:text-ink-800'
                                    : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                              )}
                            >
                              {c.status}
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[min(70vh,640px)] flex-col dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-ink-100 dark:border-ink-800">
            <div>
              <CardTitle className="text-lg dark:text-white">
                {selected ? selected.customerFullName || 'Customer' : 'Select a conversation'}
              </CardTitle>
              {selected ? (
                <CardDescription className="dark:text-ink-400">{selected.customerEmail}</CardDescription>
              ) : null}
            </div>
            {selected && !isClosed ? (
              <Button type="button" variant="outline" size="sm" disabled={closing} onClick={handleClose}>
                {closing ? 'Closing…' : 'Close conversation'}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pt-4">
            {!selectedId ? (
              <p className="text-sm text-ink-500 dark:text-ink-400">Choose a conversation from the list.</p>
            ) : messagesLoading && messages.length === 0 ? (
              <LoadingSpinner label="Loading messages…" />
            ) : (
              <>
                {isClosed ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                    This conversation is closed. Reopen by setting status to OPEN via API if needed.
                  </p>
                ) : null}
                <ScrollArea className="min-h-0 flex-1 rounded-xl border border-ink-100 bg-ink-50/50 p-4 dark:border-ink-800 dark:bg-ink-950/50">
                  <ul className="space-y-3 pr-3">
                    {messages.length === 0 ? (
                      <li className="text-center text-sm text-ink-500 dark:text-ink-400">No messages yet.</li>
                    ) : (
                      messages.map((m) => {
                        const admin = m.sender === 'ADMIN';
                        return (
                          <li
                            key={m.id}
                            className={classNames('flex', admin ? 'justify-end' : 'justify-start')}
                          >
                            <div
                              className={classNames(
                                'max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm sm:max-w-[75%]',
                                admin
                                  ? 'rounded-br-md bg-ink-950 text-white dark:bg-white dark:text-ink-950'
                                  : 'rounded-bl-md border border-ink-100 bg-white text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100'
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                              <p
                                className={classNames(
                                  'mt-1 text-2xs',
                                  admin ? 'text-white/70 dark:text-ink-600' : 'text-ink-500 dark:text-ink-400'
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
                    placeholder={isClosed ? 'Conversation closed' : 'Reply…'}
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
      </div>
    </Container>
  );
}
