'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { WeLetter, WeLetterParty } from '@/lib/we-letters';
import CustomDatePicker from '@/components/CustomDatePicker';
import AttachmentModal from '@/components/AttachmentModal';

type MailboxTab = 'inbox' | 'sent';
type ViewState = 'list' | 'read' | 'write';

function getOtherParty(viewer: WeLetterParty): WeLetterParty {
  return viewer === 'hui' ? 'dudu' : 'hui';
}

function getPartyName(party: WeLetterParty) {
  return party === 'hui' ? 'Hui' : 'DuDu';
}

function getRelativeDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function WeLettersPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>('list');
  const [viewer, setViewer] = useState<WeLetterParty>('hui');
  const [activeTab, setActiveTab] = useState<MailboxTab>('inbox');
  const [letters, setLetters] = useState<WeLetter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [deliverAt, setDeliverAt] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'none' | 'photo'>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [attachmentIsPortrait, setAttachmentIsPortrait] = useState(false);
  const [paperStyle, setPaperStyle] = useState<'default' | 'handwritten'>('handwritten');
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  const loadLetters = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/we-letters', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 503) {
        setConfigured(false);
        setPreviewMode(false);
        setLetters([]);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load letters.');
      }

      const nextLetters = Array.isArray(payload.letters) ? payload.letters : [];
      setConfigured(true);
      setPreviewMode(Boolean(payload.preview));
      if (payload.currentUser === 'hui' || payload.currentUser === 'dudu') {
        setViewer(payload.currentUser);
      }
      setLetters(nextLetters);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load letters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLetters();
  }, []);

  useEffect(() => {
    if (attachmentType !== 'photo' || !attachmentUrl) {
      setAttachmentIsPortrait(false);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      setAttachmentIsPortrait(image.naturalHeight > image.naturalWidth);
    };
    image.src = attachmentUrl;
  }, [attachmentType, attachmentUrl]);

  const inboxLetters = useMemo(
    () => letters.filter((letter) => letter.to === viewer),
    [letters, viewer]
  );
  const sentLetters = useMemo(
    () => letters.filter((letter) => letter.from === viewer),
    [letters, viewer]
  );
  const activeLetters = activeTab === 'inbox' ? inboxLetters : sentLetters;
  const selectedLetter = letters.find((letter) => letter.id === selectedId) || null;

  // Mark as read when entering read view
  useEffect(() => {
    if (view !== 'read' || !selectedLetter) return;
    if (selectedLetter.to !== viewer || selectedLetter.readAt) return;

    const markAsRead = async () => {
      const response = await fetch('/api/we-letters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLetter.id }),
      });

      if (!response.ok) return;
      const payload = await response.json().catch(() => ({}));
      if (!payload.letter) return;

      setLetters((current) =>
        current.map((letter) =>
          letter.id === selectedLetter.id
            ? { ...letter, readAt: payload.letter.readAt || new Date().toISOString() }
            : letter
        )
      );
    };

    void markAsRead();
  }, [view, selectedLetter, viewer]);

  const openLetter = (id: string) => {
    setSelectedId(id);
    setView('read');
  };

  const handleReply = (letter: WeLetter) => {
    setReplyToId(letter.id);
    setTitle(`回复：${letter.title}`);
    setContent('');
    setDeliverAt('');
    setAttachmentType('none');
    setAttachmentUrl('');
    setPaperStyle('handwritten');
    setView('write');
  };

  const handleNewLetter = () => {
    setReplyToId(undefined);
    setTitle('');
    setContent('');
    setDeliverAt('');
    setAttachmentType('none');
    setAttachmentUrl('');
    setPaperStyle('handwritten');
    setView('write');
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim() || sending) return;
    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/we-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          replyToId,
          deliverAt: deliverAt ? new Date(deliverAt).toISOString() : undefined,
          attachment: attachmentType !== 'none' && attachmentUrl.trim() ? { type: attachmentType, url: attachmentUrl.trim() } : undefined,
          paperStyle,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Failed to send letter.');

      setContent('');
      setReplyToId(undefined);
      setActiveTab('sent');
      setView('list');
      await loadLetters();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send letter.');
    } finally {
      setSending(false);
    }
  };

  const replySource = replyToId
    ? letters.find((letter) => letter.id === replyToId) || null
    : null;

  const handleLogout = async () => {
    try {
      await fetch('/api/we-auth/logout', { method: 'POST' });
    } finally {
      router.replace('/we/login');
      router.refresh();
    }
  };

  const handleDelete = async (letter: WeLetter) => {
    if (deleting) return;

    const confirmed = window.confirm(
      '删除后，这封信会先从你的信箱里消失；只有当对方也删除后，它才会真正被清除。确定要删除吗？'
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/we-letters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: letter.id }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to delete letter.');
      }

      if (Array.isArray(payload.letters)) {
        setLetters(payload.letters);
      } else {
        setLetters((current) => current.filter((item) => item.id !== letter.id));
      }
      setSelectedId(null);
      setView('list');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete letter.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf9f3] text-[#4f4033] selection:bg-[#d9c0a1] selection:text-[#4f4033]">
      <div className="pointer-events-none fixed right-5 top-20 z-40 md:right-8 md:top-8">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="pointer-events-auto rounded-full border border-[#eadfce] bg-white/85 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f7c69] shadow-[0_10px_25px_rgba(96,73,48,0.06)] backdrop-blur-sm transition-colors hover:border-[#d9c0a1] hover:text-[#4f4033]"
        >
          Log Out
        </button>
      </div>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-3xl px-5 pb-24 pt-16 md:px-8 md:pt-24"
          >
            <header className="mb-16 flex flex-col items-center text-center">
              <h1 className="font-serif text-3xl tracking-[0.25em] text-[#4f4033] md:text-4xl">
                慢 信 箱
              </h1>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[#a89580]">
                留给彼此的慢交流
              </p>

              <div className="mt-10 inline-flex items-center gap-3 border-b border-[#e5d8c8] pb-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#bea991]">
                  Signed In
                </span>
                <span className="font-serif text-[15px] tracking-[0.08em] text-[#4f4033]">
                  {getPartyName(viewer)}
                </span>
              </div>
              
              {previewMode && (
                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#c89c54]">
                  Local Preview Mode
                </p>
              )}
            </header>

            {!configured ? (
              <div className="text-center text-[13px] leading-loose text-[#8e7c69]">
                <p>需要配置 Gist 以启用信箱。</p>
                <p>请在环境变量中设置 `WE_LETTERS_GIST_ID` 和 `WE_LETTERS_GITHUB_TOKEN`。</p>
              </div>
            ) : (
              <>
                <div className="mb-12 flex items-center justify-between border-b border-[#f2ebe0] pb-4">
                  <div className="flex gap-6">
                    {([
                      ['inbox', 'INBOX'],
                      ['sent', 'SENT'],
                    ] as const).map(([tab, label]) => {
                      const active = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`relative font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                            active
                              ? 'text-[#4f4033]'
                              : 'text-[#b9a691] hover:text-[#806f5e]'
                          }`}
                        >
                          {label}
                          {active && (
                            <motion.div
                              layoutId="activeTabIndicator"
                              className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-[#4f4033]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleNewLetter}
                    className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#806f5e] transition-colors hover:text-[#4f4033]"
                  >
                    <span>Write</span>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">✎</span>
                  </button>
                </div>

                {loading ? (
                  <div className="py-20 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[#c5b099]">
                    Loading...
                  </div>
                ) : activeLetters.length === 0 ? (
                  <div className="py-20 text-center text-[13px] text-[#a69280]">
                    这里空空如也。
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {activeLetters.map((letter) => {
                      const unread = activeTab === 'inbox' && !letter.readAt;
                      const isDelayed = letter.deliverAt ? new Date(letter.deliverAt) > new Date() : false;
                      const canOpen = letter.from === viewer || !isDelayed;
                      
                      return (
                        <button
                          key={letter.id}
                          type="button"
                          onClick={() => canOpen && openLetter(letter.id)}
                          className={`group relative flex items-center justify-between border-b border-[#f2ebe0] py-6 text-left transition-colors ${canOpen ? 'hover:border-[#d4c3b0] cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                        >
                          <div className="flex items-center gap-6">
                            {/* Wax seal indicator */}
                            <span
                              className={`h-2 w-2 rounded-full transition-colors ${
                                isDelayed && !canOpen 
                                  ? 'bg-[#d0c2b2]' // Grey for future
                                  : unread 
                                    ? 'bg-[#c89c54] shadow-[0_0_8px_rgba(200,156,84,0.4)]' // Gold for unread
                                    : 'bg-transparent border border-[#e5d8c8]' // Empty/Read
                              }`}
                            />
                            <div className="flex flex-col gap-1">
                              <span className="font-serif text-[15px] text-[#4f4033] transition-colors">
                                {isDelayed && !canOpen ? '一封来自过去的信 (未到时间)' : letter.title}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a89580] transition-colors group-hover:text-[#8f7d6a]">
                                {letter.from === viewer ? 'To' : 'From'}:{' '}
                                {letter.from === viewer
                                  ? getPartyName(letter.to)
                                  : getPartyName(letter.from)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b3a18e]">
                              {isDelayed && !canOpen 
                                ? `To be opened on ${getRelativeDate(letter.deliverAt!)}` 
                                : getRelativeDate(letter.createdAt)}
                            </span>
                            {canOpen && (
                              <span className="font-mono text-[10px] text-[#d4c3b0] opacity-0 transition-opacity group-hover:opacity-100">
                                ↗
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {view === 'read' && selectedLetter && (
          <motion.div
            key="read"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`mx-auto max-w-2xl px-6 pb-32 pt-12 md:pt-20 relative ${
              (() => {
                const hour = new Date(selectedLetter.createdAt).getHours();
                const isNight = hour >= 22 || hour < 5;
                const daysOld = (Date.now() - new Date(selectedLetter.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                const isOld = daysOld > 30;
                
                let classes = '';
                if (isNight) classes += ' bg-[#2a241e] text-[#d4c3b0] shadow-[0_0_40px_rgba(0,0,0,0.2)] rounded-sm p-8 -mx-8 ';
                if (isOld && !isNight) classes += ' shadow-[inset_0_0_60px_rgba(200,156,84,0.15)] rounded-sm p-8 -mx-8 ';
                return classes;
              })()
            }`}
          >
            <div className={`mb-20 flex flex-col gap-6 border-b pb-6 ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'border-[#40362b]' : 'border-[#f2ebe0]'}`}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'text-[#8c7b68] hover:text-[#d4c3b0]' : 'text-[#9b8975] hover:text-[#4f4033]'}`}
                >
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                  <span>返回信箱</span>
                </button>
                <div className={`text-right font-mono text-[10px] uppercase tracking-[0.15em] ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'text-[#8c7b68]' : 'text-[#b3a18e]'}`}>
                  {getRelativeDate(selectedLetter.createdAt)}
                </div>
              </div>
              <h2 className={`font-serif text-[22px] tracking-wide md:text-[24px] ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'text-[#e5d8c8]' : 'text-[#4f4033]'}`}>
                {selectedLetter.title}
              </h2>
            </div>

            <article 
                className={`prose prose-stone max-w-none text-justify text-[15px] leading-[2.6] md:text-[16px] md:leading-[2.8] ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'text-[#c4b5a3]' : 'text-[#4f4033]'}`}
                style={selectedLetter.paperStyle === 'handwritten' ? { fontFamily: '"Kaiti SC", STKaiti, "AR PL UKai CN", "AR PL UKai HK", "AR PL UKai TW", Kaiti, serif', fontSize: '1.1em', letterSpacing: '0.05em' } : { fontFamily: 'var(--font-serif)' }}
              >
              {selectedLetter.content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6 indent-8">
                  {paragraph}
                </p>
              ))}
            </article>

            {/* Photo attachment fade in */}
            {selectedLetter.attachment?.type === 'photo' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="mt-16 w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedLetter.attachment.url} 
                  alt="Attached photo" 
                  className="w-full h-auto object-cover rounded-sm shadow-sm"
                  loading="lazy"
                />
              </motion.div>
            )}

            <div className={`mt-32 border-t pt-8 ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'border-[#40362b]' : 'border-[#f2ebe0]'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5 ? 'text-[#8c7b68]' : 'text-[#bca792]'}`}>
                  {selectedLetter.from === viewer
                    ? selectedLetter.readAt
                      ? `Read at ${getRelativeDate(selectedLetter.readAt)}`
                      : 'Delivered, unread'
                    : 'End of Letter'}
                </span>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedLetter)}
                    disabled={deleting}
                    className={`group relative rotate-[-2deg] border-b border-dashed px-2 py-1 font-serif text-[13px] italic tracking-[0.04em] shadow-[0_1px_0_rgba(201,169,110,0.12)] transition-colors disabled:opacity-40 ${
                      new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5
                        ? 'border-[#6e5a49] bg-[#302821] text-[#b89f86] hover:bg-[#392f27] hover:text-[#e0d0bf]'
                        : 'border-[#d8c1a0] bg-[#fcf7ef] text-[#9a7560] hover:bg-[#f7efdf] hover:text-[#6c5643]'
                    }`}
                  >
                    <span className="relative z-10">{deleting ? '删除中...' : '从我的信箱删除'}</span>
                    <span
                      className={`absolute left-2 right-2 bottom-[5px] h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                        new Date(selectedLetter.createdAt).getHours() >= 22 || new Date(selectedLetter.createdAt).getHours() < 5
                          ? 'bg-[#7d6755]'
                          : 'bg-[#d8c1a0]'
                      }`}
                    />
                  </button>
                  {selectedLetter.to === viewer && (
                    <button
                      type="button"
                      onClick={() => handleReply(selectedLetter)}
                      className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#806f5e] transition-colors hover:text-[#4f4033]"
                    >
                      <span>Reply</span>
                      <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-2xl flex-col overflow-y-auto px-6 pb-24 pt-12 md:h-screen md:pt-20"
            data-lenis-prevent
          >
            <div className="mb-16 flex items-center justify-between border-b border-[#f2ebe0] pb-6">
              <button
                type="button"
                onClick={() => setView('list')}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9b8975] transition-colors hover:text-[#4f4033]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!content.trim() || sending}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6d5846] transition-colors hover:text-[#3d3126] disabled:opacity-30"
              >
                {sending ? 'Sending...' : 'Send Letter'}
              </button>
            </div>

            {replySource && (
              <div className="mb-12 border-l border-[#d9c0a1] pl-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#baa48a]">
                  Replying to
                </p>
                <p className="mt-3 line-clamp-3 font-serif text-[14px] leading-loose text-[#8e7c69]">
                  {replySource.content}
                </p>
              </div>
            )}

            <div className="mb-10 flex flex-col gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a89580]">
                To: {getPartyName(getOtherParty(viewer))}
              </p>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="信件标题..."
                className="w-full border-b border-[#f2ebe0] bg-transparent pb-3 font-serif text-[20px] text-[#4f4033] outline-none transition-colors placeholder:text-[#d0c2b2] focus:border-[#d9c0a1] md:text-[22px]"
                autoFocus={!replyToId}
              />
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="在这里写下你的信..."
                className="h-[38vh] min-h-[280px] w-full resize-none rounded-sm border border-[#f2ebe0] bg-[#fdfaf5] px-4 py-4 font-serif text-[15px] leading-[2.6] text-[#4f4033] outline-none transition-colors placeholder:text-[#d0c2b2] focus:border-[#d9c0a1] md:text-[16px] md:leading-[2.8]"
                autoFocus={!!replyToId}
                style={{ fontFamily: '"Kaiti SC", STKaiti, Kaiti, serif', fontSize: '1.1em', letterSpacing: '0.05em' }}
              />
              
              {/* Image Preview within content area */}
              {attachmentType === 'photo' && attachmentUrl && (
                <div
                  className={`pointer-events-none absolute bottom-5 right-5 overflow-hidden rounded-[2px] border-[6px] border-white bg-white shadow-[0_14px_32px_rgba(79,64,51,0.14)] opacity-95 ${
                    attachmentIsPortrait
                      ? 'w-[120px] md:w-[136px]'
                      : 'w-[170px] md:w-[190px]'
                  }`}
                  style={{ transform: attachmentIsPortrait ? 'rotate(3deg)' : 'rotate(-2deg)' }}
                >
                  <div className={`${attachmentIsPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]'} bg-[#f5efe6]`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachmentUrl}
                      alt="Attached preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="border-t border-[#efe4d4] bg-white px-3 py-2 text-left">
                    <span className="font-serif text-[11px] italic tracking-[0.08em] text-[#9f8a72]">
                      tucked into this letter
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 border-t border-[#f2ebe0] pt-8 md:grid-cols-2">
              {/* Future Delivery */}
              <div className="flex flex-col gap-3">
                <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#baa48a]">
                  延时寄送 (Deliver At - 留空则立即寄出)
                </label>
                <div className="relative">
                  <div 
                    className="flex w-full cursor-pointer items-center justify-between rounded-sm border border-[#f2ebe0] bg-[#fdfaf5] px-3 py-2 font-mono text-[12px] text-[#4f4033] transition-colors hover:border-[#d9c0a1]"
                    onClick={() => setShowDatePicker((current) => !current)}
                  >
                    <span>
                      {deliverAt ? new Date(deliverAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '点击选择寄出时间...'}
                    </span>
                    <span className="text-[#d9c0a1]">📅</span>
                  </div>
                  {showDatePicker && (
                    <CustomDatePicker 
                      value={deliverAt} 
                      onChange={setDeliverAt} 
                      onClose={() => setShowDatePicker(false)} 
                    />
                  )}
                </div>
              </div>

              {/* Attachment */}
              <div className="flex flex-col gap-3 pb-8">
                <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#baa48a]">
                  随信附上 (Attachment)
                </label>
                <div className="mb-2 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => { setAttachmentType('none'); setAttachmentUrl(''); }}
                    className={`font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${attachmentType === 'none' ? 'text-[#4f4033] border-b border-[#4f4033]' : 'text-[#baa48a] hover:text-[#8e7c69]'}`}
                  >
                    无
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAttachmentType('photo'); setShowPhotoModal(true); }}
                    className={`font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${attachmentType === 'photo' ? 'text-[#4f4033] border-b border-[#4f4033]' : 'text-[#baa48a] hover:text-[#8e7c69]'}`}
                  >
                    照片 (Photo)
                  </button>
                </div>

                {attachmentType === 'photo' && attachmentUrl && (
                  <div className="mt-2 flex items-center gap-4 rounded-sm border border-[#e5d8c8] bg-[#fdfcf9] p-2 w-max">
                    <div className="w-16 h-10 overflow-hidden rounded-sm border border-[#e5d8c8]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={attachmentUrl} alt="Selected" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      className="rotate-[-2deg] border-b border-dashed border-[#c9a96e] bg-[#fcf7ef] px-2 py-1 font-serif text-[13px] italic tracking-[0.04em] text-[#9a7c5f] shadow-[0_1px_0_rgba(201,169,110,0.18)] transition-colors hover:bg-[#f7efdf] hover:text-[#6c5643]"
                    >
                      换一张照片试试
                    </button>
                  </div>
                )}

              </div>
            </div>

            {error && (
              <p className="mt-8 text-center font-mono text-[10px] text-[#c26753]">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AttachmentModal 
        isOpen={showPhotoModal} 
        onClose={() => setShowPhotoModal(false)} 
        onSelect={(url) => { setAttachmentType('photo'); setAttachmentUrl(url); }} 
      />
    </main>
  );
}
