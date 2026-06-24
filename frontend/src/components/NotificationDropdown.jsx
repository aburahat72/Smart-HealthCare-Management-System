import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../api/axios';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = () => {
    api.get('/notifications').then((res) => setNotifications(res.data));
    api.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  const handleClick = (n) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative rounded-lg p-2 hover:bg-gray-100">
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-card sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-primary-500">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 ${!n.read ? 'bg-primary-50/30' : ''}`}
                >
                  {n.link ? (
                    <Link to={n.link} onClick={() => handleClick(n)} className="flex-1">
                      <NotificationContent n={n} timeAgo={timeAgo} />
                    </Link>
                  ) : (
                    <div className="flex-1 cursor-pointer" onClick={() => handleClick(n)}>
                      <NotificationContent n={n} timeAgo={timeAgo} />
                    </div>
                  )}
                  <button onClick={(e) => deleteNotification(n._id, e)} className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationContent({ n, timeAgo }) {
  return (
    <>
      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
      <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
    </>
  );
}
