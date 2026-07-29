type Props = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteChatModal({
  open,
  title,
  onCancel,
  onConfirm,
}: Props) {
console.log("Modal open:", open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-[420px] rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

        <h2 className="font-display text-xl font-bold text-white">
          Delete Chat
        </h2>

        <p className="mt-4 text-slate-300">
          Are you sure you want to delete
        </p>

        <p className="mt-1 font-semibold text-white">
          "{title}"
        </p>

        <p className="mt-4 text-sm text-slate-400">
          This action cannot be undone.
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-2 text-white hover:bg-panel/10"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}