export function Pager({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pager">
      <button type="button" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        Previous
      </button>
      <span>
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </span>
      <button
        type="button"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPage(meta.page + 1)}
      >
        Next
      </button>
    </div>
  );
}
