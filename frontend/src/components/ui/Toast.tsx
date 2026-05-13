import { useEffect, useState } from 'react';
import { toast, type Toast as ToastItem } from '../../services/toast';

const iconMap: Record<ToastItem['type'], string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

const bgMap: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-sky-600',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>(toast.getToasts());

  useEffect(() => toast.subscribe(setToasts), []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3.5 text-white shadow-2xl animate-[slideUp_0.35s_ease-out] ${bgMap[item.type]}`}
        >
          <span className="material-symbols-outlined text-xl">{iconMap[item.type]}</span>
          <span className="text-sm font-semibold">{item.message}</span>
        </div>
      ))}
    </div>
  );
}
