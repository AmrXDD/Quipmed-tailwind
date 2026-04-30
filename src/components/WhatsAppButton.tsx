const WHATSAPP_NUMBER = "96569028587";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with QuipMed on WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.45)] ring-1 ring-white/20 transition-transform hover:scale-110 md:bottom-7 md:right-7"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 fill-white"
      >
        <path d="M19.11 17.46c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.18-1.34-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.28 0 1.34.98 2.64 1.12 2.82.14.18 1.94 2.96 4.7 4.15.66.29 1.17.46 1.57.59.66.21 1.26.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31zM16.02 5.33c-5.9 0-10.7 4.8-10.7 10.7 0 1.88.49 3.72 1.42 5.34L5 27l5.78-1.51c1.56.85 3.32 1.3 5.13 1.3 5.9 0 10.7-4.8 10.7-10.7s-4.69-10.76-10.59-10.76zm0 19.59c-1.62 0-3.21-.43-4.6-1.26l-.33-.2-3.43.89.92-3.34-.21-.34a8.86 8.86 0 0 1-1.36-4.74c0-4.92 4-8.92 8.92-8.92 2.38 0 4.62.93 6.31 2.61a8.86 8.86 0 0 1 2.61 6.31c0 4.92-4.01 9.02-8.83 9.02z" />
      </svg>
    </a>
  );
}
