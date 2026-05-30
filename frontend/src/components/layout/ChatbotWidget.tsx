import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { chatbotApi, type ProductSuggestion } from '../../services/api';
import { cartStorage } from '../../services/cart';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: ProductSuggestion[];
};

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào, mình là TMC Beauty Concierge. Mình có thể tư vấn sản phẩm theo nhu cầu da, ngân sách và mục tiêu chăm sóc của bạn.',
    },
  ]);

  useEffect(() => {
    setMessages((prev) => prev.map((m, i) => i === 0 && m.role === 'assistant' ? { ...m, content: t('chatbot.greeting') } : m));
  }, [t]);

  const sendMessage = async (content: string) => {
    const question = content.trim();
    if (!question || sending) return;
    const nextMessages = [...messages, { role: 'user' as const, content: question }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const response = await chatbotApi.send(nextMessages.map(({ role, content: text }) => ({ role, content: text })));
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.reply,
          suggestions: response.data.product_suggestions,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error?.response?.data?.detail || t('chatbot.busy'),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const handleAddSuggestionToCart = (product: ProductSuggestion) => {
    cartStorage.addItem({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      retail_price: product.retail_price,
      brand_name: product.brand_name,
      category_name: product.category_name,
    }, 1);
    setAddedProductId(product.id);
    window.setTimeout(() => setAddedProductId((current) => current === product.id ? null : current), 1600);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] flex flex-col items-end sm:bottom-6 sm:left-auto sm:right-6 lg:bottom-8 lg:right-8">
      <>
        {isOpen ? (
          <div
            className="mb-3 flex max-h-[calc(100dvh-7rem)] w-[min(100%,26rem)] flex-col overflow-hidden rounded-[1.75rem] border border-emerald-100/80 bg-[linear-gradient(180deg,rgba(247,251,248,0.98)_0%,rgba(239,247,242,0.96)_100%)] shadow-[0_30px_80px_rgba(56,106,82,0.2)] backdrop-blur sm:mb-4 sm:max-h-[min(85vh,42rem)] sm:w-[min(92vw,25rem)]"
          >
            <div className="relative shrink-0 overflow-hidden border-b border-emerald-300/20 bg-[linear-gradient(135deg,#254a39_0%,#356a52_52%,#4f8d6a_100%)] px-4 py-3.5 text-white sm:px-5 sm:py-5">
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute bottom-0 left-10 h-16 w-16 rounded-full bg-emerald-300/20 blur-2xl" />
              <button
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 transition hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                type="button"
                aria-label={t('chatbot.close')}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z" />
                </svg>
              </button>
              <div className="pr-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur sm:h-11 sm:w-11">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current sm:h-6 sm:w-6">
                      <path d="M12 3c5 0 9 3.6 9 8 0 2.3-1.1 4.4-3.1 5.9V22l-4.1-2.3c-.6.1-1.2.2-1.8.2-5 0-9-3.6-9-8s4-8.9 9-8.9Zm-3.9 8.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm3.9 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm3.9 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/80">{t('chatbot.subtitle')}</p>
                    <h3 className="mt-1 text-base font-bold leading-tight sm:text-xl">{t('chatbot.title')}</h3>
                  </div>
                </div>
                <p className="mt-2 max-w-xs text-xs leading-5 text-emerald-50/85 sm:mt-3 sm:text-sm sm:leading-6">{t('chatbot.desc')}</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-[1.35rem] px-4 py-3 sm:max-w-[88%] ${
                    message.role === 'user'
                      ? 'bg-[linear-gradient(135deg,#28503e_0%,#3d7a5d_100%)] text-white shadow-[0_12px_24px_rgba(53,106,82,0.22)]'
                      : 'border border-emerald-100 bg-white text-stone-800 shadow-[0_12px_24px_rgba(79,120,99,0.08)]'
                  }`}>
                    <p className="whitespace-pre-line text-sm leading-6">{message.content}</p>
                    {message.suggestions?.length ? (
                      <div className="mt-4 space-y-3">
                        {message.suggestions.map((product) => (
                          <div
                            key={product.id}
                            className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/70"
                          >
                            <a href={`/product/${product.id}`} className="flex items-center gap-3">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200 text-xs text-stone-500">TMC</div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-stone-900">{product.name}</p>
                                <p className="truncate text-xs text-stone-500">{product.brand_name || t('chatbot.no_brand')} • {product.category_name || t('chatbot.other_category')}</p>
                                <p className="mt-1 text-sm font-bold text-emerald-800">{currency(product.retail_price)}</p>
                              </div>
                            </a>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <a
                                href={`/product/${product.id}`}
                                className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                              >
                                {t('chatbot.view_detail')}
                              </a>
                              <button
                                className="rounded-full bg-[linear-gradient(135deg,#28503e_0%,#3d7a5d_100%)] px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_22px_rgba(53,106,82,0.2)] transition hover:brightness-105"
                                onClick={() => handleAddSuggestionToCart(product)}
                                type="button"
                              >
                                {addedProductId === product.id ? t('chatbot.added') : t('chatbot.add_to_cart')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] border border-emerald-100 bg-white px-4 py-3 shadow-[0_12px_24px_rgba(79,120,99,0.08)]">
                    <div className="flex gap-2">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0.1s' }} />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-700" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-emerald-100/80 bg-white/80 px-3 py-2.5 sm:px-4 sm:py-3">
              <button
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-emerald-50/60 sm:text-sm"
                onClick={() => setShowPrompts((prev) => !prev)}
                type="button"
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-emerald-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z" />
                  </svg>
                  {t('chatbot.quick_prompts')}
                </span>
                <span className={`material-symbols-outlined text-base transition-transform duration-300 ${showPrompts ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${showPrompts ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {[t('chatbot.prompt_1'), t('chatbot.prompt_2'), t('chatbot.prompt_3')].map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 sm:text-xs"
                      onClick={() => { void sendMessage(prompt); setShowPrompts(false); }}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <form className="mt-2.5 flex items-end gap-2 sm:gap-3" onSubmit={(event) => void handleSubmit(event)}>
                <div className="flex-1 rounded-[1.4rem] border border-emerald-200 bg-white px-4 py-3 shadow-inner">
                  <textarea
                    className="max-h-24 min-h-[44px] w-full resize-none bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 sm:max-h-28"
                    placeholder={t('chatbot.placeholder')}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                </div>
                <button
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#28503e_0%,#3d7a5d_100%)] text-white shadow-[0_18px_30px_rgba(53,106,82,0.26)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={sending || !input.trim()}
                  type="submit"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M3.4 20.4 21 12 3.4 3.6 3 10.1l12 1.9-12 1.9z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </>

      <button
        className={`group relative items-center justify-center rounded-full bg-[linear-gradient(135deg,#254a39_0%,#356a52_60%,#4f8d6a_100%)] text-white shadow-[0_18px_45px_rgba(53,106,82,0.34)] ${
          isOpen ? 'hidden sm:flex sm:h-auto sm:w-auto sm:gap-3 sm:px-5 sm:py-4' : 'flex h-16 w-16 sm:h-auto sm:w-auto sm:gap-3 sm:px-5 sm:py-4'
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        aria-label={isOpen ? t('chatbot.close') : t('chatbot.toggle_button')}
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 opacity-60 blur-md transition group-hover:opacity-80" />
        <span className="absolute inset-0 rounded-full border border-white/25" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/12 sm:h-10 sm:w-10">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
            <path d="M12 3c5 0 9 3.6 9 8 0 2.3-1.1 4.4-3.1 5.9V22l-4.1-2.3c-.6.1-1.2.2-1.8.2-5 0-9-3.6-9-8s4-8.9 9-8.9Zm-3.9 8.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm3.9 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm3.9 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
          </svg>
        </div>
        <div className="relative hidden text-left sm:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/72">{t('chatbot.subtitle')}</p>
          <p className="mt-0.5 text-sm font-semibold">{t('chatbot.toggle_button')}</p>
        </div>
        <div className="relative hidden h-2.5 w-2.5 sm:flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </div>
      </button>
    </div>
  );
}
