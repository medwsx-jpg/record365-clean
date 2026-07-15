import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '../types';
import { api } from '../store';
import BottomNav from '../components/BottomNav';

const NOTI_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  matched:         { icon: '🤝', color: 'text-green-600', bg: 'bg-green-50' },
  in_progress:     { icon: '🧹', color: 'text-blue-600',  bg: 'bg-blue-50' },
  waiting_confirm: { icon: '⏳', color: 'text-orange-600', bg: 'bg-orange-50' },
  completed:       { icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
  as_requested:    { icon: '🔧', color: 'text-red-600',   bg: 'bg-red-50' },
  review:          { icon: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  chat:            { icon: '💬', color: 'text-purple-600', bg: 'bg-purple-50' },
  system:          { icon: '📢', color: 'text-gray-600',  bg: 'bg-gray-50' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = () => {
    setNotifications(api.getNotifications());
  };

  useEffect(() => {
    // 데모용: 알림이 없으면 샘플 알림 생성
    const existing = api.getNotifications();
    if (existing.length === 0) {
      const requests = api.getRequests();
      requests.forEach((req) => {
        if (req.status === 'matched') {
          api.addNotification({
            type: 'matched',
            title: '매칭 완료',
            message: `${req.cleanerName || '청소자'}님이 의뢰를 수락했습니다.`,
            requestId: req.id,
          });
        }
        if (req.status === 'waiting_confirm') {
          api.addNotification({
            type: 'waiting_confirm',
            title: '청소 완료 보고',
            message: '청소가 완료되었습니다. 확인해주세요.',
            requestId: req.id,
          });
        }
        if (req.status === 'as_requested') {
          api.addNotification({
            type: 'as_requested',
            title: 'A/S 요청',
            message: req.asComment || 'A/S 재방문이 요청되었습니다.',
            requestId: req.id,
          });
        }
        if (req.status === 'completed' && req.reviewId) {
          api.addNotification({
            type: 'review',
            title: '리뷰 등록',
            message: '의뢰자가 리뷰를 남겼습니다.',
            requestId: req.id,
          });
        }
      });
      // 시스템 알림
      api.addNotification({
        type: 'system',
        title: '슥싹 매칭에 오신 것을 환영합니다!',
        message: '청소 의뢰를 등록하거나 청소자로 활동을 시작해보세요.',
      });
    }
    load();
  }, []);

  const handleClick = (noti: AppNotification) => {
    api.markNotificationRead(noti.id);
    load();
    if (noti.requestId) {
      const role = api.getRole();
      if (role === 'client') {
        navigate(`/clean/client/review/${noti.requestId}`);
      } else if (role === 'cleaner') {
        navigate(`/clean/cleaner/complete/${noti.requestId}`);
      }
    }
  };

  const handleMarkAllRead = () => {
    api.markAllNotificationsRead();
    load();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-green-600 font-medium">
            모두 읽음
          </button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-gray-300 mb-4">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-gray-400 text-sm">알림이 없습니다</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((noti) => {
            const cfg = NOTI_CONFIG[noti.type] || NOTI_CONFIG.system;
            return (
              <button
                key={noti.id}
                onClick={() => handleClick(noti)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors active:bg-gray-100 ${
                  noti.read ? 'bg-white' : 'bg-green-50/30'
                }`}
              >
                {/* 아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <span className="text-lg">{cfg.icon}</span>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold ${noti.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {noti.title}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">{timeAgo(noti.createdAt)}</span>
                  </div>
                  <p className={`text-sm truncate ${noti.read ? 'text-gray-400' : 'text-gray-600'}`}>
                    {noti.message}
                  </p>
                </div>

                {/* 안읽음 표시 */}
                {!noti.read && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
