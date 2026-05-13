export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let nextId = 1;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let currentToasts: Toast[] = [];

function notify() {
  for (const listener of listeners) {
    listener([...currentToasts]);
  }
}

function add(type: Toast['type'], message: string) {
  const toast: Toast = { id: nextId++, type, message };
  currentToasts = [...currentToasts, toast];
  notify();
  setTimeout(() => remove(toast.id), 4000);
}

function remove(id: number) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  notify();
}

export const toast = {
  success: (message: string) => add('success', message),
  error: (message: string) => add('error', message),
  info: (message: string) => add('info', message),
  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  getToasts: () => [...currentToasts],
};
