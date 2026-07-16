import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest, ChatMessage } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const period = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour}:${m}`;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${day}요일`;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

// 메시지 버블 (daily-brief MessageBubble 패턴 적용)
function MessageBubble({ message, isMine, showTime, showName, senderName }: {
  message: ChatMessage;
  isMine: boolean;
  showTime: boolean;
  showName: boolean;
  senderName: string;
}) {
  const timeStr = formatTime(message.createdAt);

  // 시스템 메시지
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2 px-5">
        <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  if (isMine) {
    return (
      <div className="flex justify-end items-end gap-1.5 px-3 mb-1">
        <div className="flex flex-col items-end mb-0.5">
          {showTime && <span className="text-[10px] text-gray-400">{timeStr}</span>}
        </div>
        {message.type === 'image' ? (
          <img src={message.content} alt="사진" className="w-[200px] h-[200px] rounded-2xl rounded-br-sm object-cover" />
        ) : (
          <div className="max-w-[70%] bg-green-500 rounded-2xl rounded-br-sm px-3.5 py-2.5">
            <p className="text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 px-3 mb-1">
      {showName ? (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0 mt-0.5">
          {senderName.charAt(0)}
        </div>
      ) : (
        <div className="w-9 shrink-0" />
      )}
      <div className="flex-1 max-w-[78%]">
        {showName && <p className="text-xs font-semibold text-gray-500 mb-1">{senderName}</p>}
        <div className="flex items-end gap-1.5">
          {message.type === 'image' ? (
            <img src={message.content} alt="사진" className="w-[200px] h-[200px] rounded-2xl rounded-bl-sm object-cover" />
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <p className="text-[15px] leading-relaxed text-gray-900 whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}
          <div className="flex flex-col items-start mb-0.5">
            {showTime && <span className="text-[10px] text-gray-400">{timeStr}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// 메시지 입력 (daily-brief MessageInput 패턴 적용)
function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  };

  return (
    <div className="flex items-end gap-2 px-3 py-2 bg-white border-t border-gray-200">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="메시지 입력..."
        maxLength={1000}
        rows={1}
        className="flex-1 min-h-[40px] max-h-[100px] bg-gray-100 rounded-2xl px-4 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 resize-none outline-none focus:ring-1 focus:ring-green-300"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          text.trim() ? 'bg-green-500 active:bg-green-600' : 'bg-gray-200'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? 'white' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = api.getRole();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const loadMessages = async () => {
    if (!id) return;
    const msgs = await api.getMessages(id);
    setMessages(msgs);
    if (role) await api.markMessagesRead(id, role);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const req = await api.getRequestById(id);
      if (req) setRequest(req);
      await loadMessages();
      // 시스템 메시지 자동 생성 (최초 진입시)
      const existing = await api.getMessages(id);
      if (existing.length === 0 && req) {
        await api.sendMessage({
          requestId: id,
          senderRole: 'client',
          senderName: '시스템',
          content: `${CATEGORY_LABELS[req.category]} 의뢰가 매칭되었습니다. 대화를 시작해보세요.`,
          type: 'system',
        });
        await loadMessages();
      }
    })();
    const interval = setInterval(loadMessages, 1500);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
  };

  const handleSend = async (text: string) => {
    if (!id || !role || !request) return;
    const isClient = role === 'client';
    const profile = localStorage.getItem('cleanmatch_cleaner_profile');
    const cleanerName = profile ? JSON.parse(profile).name || '청소자' : '청소자';
    await api.sendMessage({
      requestId: id,
      senderRole: role,
      senderName: isClient ? '의뢰자' : cleanerName,
      content: text,
      type: 'text',
    });
    await loadMessages();
    setAutoScroll(true);
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">채팅방을 찾을 수 없습니다</p>
      </div>
    );
  }

  const isClient = role === 'client';
  const otherName = isClient ? (request.cleanerName || '청소자') : '의뢰자';

  return (
    <div className="min-h-screen bg-gray-100 max-w-[480px] mx-auto flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/clean/chat')} className="text-gray-600 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{otherName}</h1>
          <p className="text-[11px] text-gray-400 truncate">{CATEGORY_LABELS[request.category]} · {request.date}</p>
        </div>
      </header>

      {/* 의뢰 정보 배너 */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate max-w-[200px]">{request.address}</span>
        </div>
        <span className="text-xs font-semibold text-green-600">{request.price.toLocaleString('ko-KR')}원</span>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt);
          const isMine = msg.senderRole === role;
          // 같은 발신자가 연속이면 이름 숨기기
          const showName = !isMine && msg.type !== 'system' && (!prev || prev.senderRole !== msg.senderRole || prev.type === 'system');
          // 다음 메시지와 같은 발신자 + 같은 분이면 시간 숨기기
          const next = messages[idx + 1];
          const showTime = !next || next.senderRole !== msg.senderRole || next.type === 'system' ||
            formatTime(next.createdAt) !== formatTime(msg.createdAt);

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-gray-400 bg-gray-200/70 px-3 py-1 rounded-full">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isMine={isMine}
                showTime={showTime}
                showName={showName}
                senderName={msg.senderName}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력 */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
