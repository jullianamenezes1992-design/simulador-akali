"use client";

export default function ConsentLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("akali-open-consent"))}
      className="block text-left hover:text-white"
    >
      Preferências de cookies
    </button>
  );
}
