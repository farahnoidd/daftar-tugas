import "./style.css";
import { Task, TaskStatus, loadFromStorage, saveToStorage } from "./types";

const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? "Daftar Tugas";
const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
const KEY = "tasks";

let tasks: Task[] = loadFromStorage<Task[]>(KEY, []); // array
let editingId: number | null = null;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("task-form");
const list = $<HTMLUListElement>("task-list");
const empty = $<HTMLParagraphElement>("empty");
const titleEl = $<HTMLInputElement>("title");
const courseEl = $<HTMLInputElement>("course");
const deadlineEl = $<HTMLInputElement>("deadline");
const submitBtn = $<HTMLButtonElement>("submit-btn");
const cancelBtn = $<HTMLButtonElement>("cancel-btn");

$("app-title").textContent = APP_NAME;
$("app-footer").textContent = `${APP_NAME} v${APP_VERSION}`;
document.title = APP_NAME;

const statusOf = (done: boolean): TaskStatus => (done ? "Selesai" : "Belum Selesai");
const persist = () => saveToStorage<Task[]>(KEY, tasks);

function resetForm(): void {
  form.reset();
  editingId = null;
  submitBtn.textContent = "Tambah";
  cancelBtn.hidden = true;
}

function render(): void {
  list.innerHTML = "";
  empty.hidden = tasks.length > 0;
  for (const t of tasks) {
    const li = document.createElement("li");
    li.className = t.done ? "done" : "";
    const info = document.createElement("div");
    info.className = "info";
    const strong = document.createElement("strong");
    strong.textContent = t.title;
    const meta = document.createElement("small");
    meta.textContent = `${t.course} • Deadline ${t.deadline}`;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.status;
    info.append(strong, meta, badge);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      btn(t.done ? "Batalkan" : "Selesai", () => toggle(t.id)),
      btn("Edit", () => startEdit(t.id)),
      btn("Hapus", () => remove(t.id), "danger")
    );
    li.append(info, actions);
    list.append(li);
  }
}

function btn(label: string, onClick: () => void, cls = ""): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.className = cls;
  b.addEventListener("click", onClick);
  return b;
}

function toggle(id: number): void {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done, status: statusOf(!t.done) } : t
  );
  persist();
  render();
}

function remove(id: number): void {
  if (!confirm("Hapus tugas ini?")) return;
  tasks = tasks.filter((t) => t.id !== id);
  persist();
  render();
}

function startEdit(id: number): void {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  editingId = id;
  titleEl.value = t.title;
  courseEl.value = t.course;
  deadlineEl.value = t.deadline;
  submitBtn.textContent = "Simpan";
  cancelBtn.hidden = false;
  titleEl.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    title: titleEl.value.trim(),
    course: courseEl.value.trim(),
    deadline: deadlineEl.value,
  };
  if (editingId === null) {
    tasks.push({ id: Date.now(), ...data, done: false, status: "Belum Selesai" });
  } else {
    tasks = tasks.map((t) => (t.id === editingId ? { ...t, ...data } : t));
  }
  persist();
  resetForm();
  render();
});
cancelBtn.addEventListener("click", resetForm);

render();
