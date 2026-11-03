// Type alias + union type
export type TaskStatus = "Belum Selesai" | "Selesai";

// Interface
export interface Task {
  id: number;
  title: string;      // string
  course: string;
  deadline: string;
  done: boolean;      // boolean
  status: TaskStatus;
}

// Generics sederhana
export function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
