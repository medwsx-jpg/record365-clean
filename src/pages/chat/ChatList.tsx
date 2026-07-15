import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function ChatList() {
  const navigate = useNavigate();
  const role = api.getRole();
  const [chatRooms, setChatRooms] = useState<{ request: CleaningRequest; lastMessage: string; lastTime: string; unread: number }[]>([]);

  const loadChatRooms = () => {
    const all = api.getRequests();
    // 매칭 이후 상태의 의뢰만 채팅 가능
    const chatable = all.filter((r) =>
      ['matched', 'in_progress', 'waiting_confirm', 'completed', 'as_requested'].includes(r.status)
    );

    const rooms = chatable.map((req) => {
      const messages = api.getMessages(req.id);
      const last = messages[messages.length - 1];
      const unread = role ? api.getUnreadCount(req.id, role) : 0;
      return {
        request: req,
        lastMessage: last ? (last.type === 'image' ? '📷 사진' : last.content) : '대화를 시작해보세요',
        lastTime: last ? last.createdAt : req.createdAt,
        unread,
      };
    });

    // 최근 메시지순 정렬
    rooms.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
    setChatRooms(rooms);
  };

  useEffect(() => {
    loadChatRooms();
    const interval = setInterval(loadChatRooms, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">채팅</h1>
      </header>

      {chatRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-gray-300 mb-4">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-gray-400 text-sm text-center">진행 중인 채팅이 없습니다</p>
          <p className="text-gray-300 text-xs mt-1">의뢰가 매칭되면 채팅이 활성화됩니다</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {chatRooms.map(({ request, lastMessage, lastTime, unread }) => {
            const isClient = role === 'client';
            const otherName = isClient ? (request.cleanerName || '청소자') : '의뢰자';
            const otherInitial = otherName.charAt(0);
            const avatarBg = isClient ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600';

            return (
              <button
                key={request.id}
                onClick={() => navigate(`/clean/chat/${request.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                {/* 아바타 */}
                {request.cleanerPhoto && isClient ? (
                  <img src={request.cleanerPhoto} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${avatarBg}`}>
                    {otherInitial}
                  </div>
                )}

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm truncate">{otherName}</span>
                      <span className="text-[11px] text-gray-400 shrink-0">{CATEGORY_LABELS[request.category]}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">{timeAgo(lastTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
                    {unread > 0 && (
                      <span className="shrink-0 ml-2 bg-green-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
