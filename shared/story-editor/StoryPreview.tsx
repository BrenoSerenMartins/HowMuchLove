import React from 'react';
import type { LoveStoryData, PlanFeatures } from '@/types';
import DurationCounter from '@/story/public/components/DurationCounter';
import { isFreePlan } from '@/shared/lib/plans';
import { uiCopy } from '@/shared/lib/ui-copy';

interface StoryPreviewProps {
  storyData: LoveStoryData | null;
  plan?: Partial<PlanFeatures> | null;
}

const FALLBACK_BACKGROUND =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const QuoteStartIcon: React.FC<{ className?: string }> = ({ className = 'text-white/40' }) => (
  <svg className={`inline-block h-6 w-6 -mt-1 mr-2 ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.5 10.5C6.5 12.43 8.07 14 10 14v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5C8.07 7 6.5 8.57 6.5 10.5zM14.5 10.5c0 1.93 1.57 3.5 3.5 3.5v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5c-1.93 0-3.5 1.57-3.5 3.5z" />
  </svg>
);

const InfoTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-sm">
    <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/45">{label}</p>
    <p className="mt-1.5 text-xs font-semibold text-white/90">{value}</p>
  </div>
);

const getLayoutLabel = (layoutPosition: LoveStoryData['layoutPosition']): string => {
  switch (layoutPosition) {
    case 'top':
      return 'Contador no topo';
    case 'center':
      return 'Contador centralizado';
    case 'bottom':
    default:
      return 'Contador na base';
  }
};

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData, plan }) => {
  if (!storyData) {
    return (
      <div className="flex h-full min-h-full w-full items-center justify-center rounded-[30px] border border-white/10 bg-slate-950 text-white">
        <p className="text-sm text-white/70">{uiCopy.dashboard.previewPlaceholder}</p>
      </div>
    );
  }

  const previewData = plan ? { ...storyData, plan } : storyData;
  const { startDate, message, images, layoutPosition = 'bottom', youtubeUrl, storyPassword, entryButtonText } = previewData;
  const startDateValue = startDate ? new Date(startDate) : null;
  const backgroundImageUrl = images?.[0]?.image_url || FALLBACK_BACKGROUND;
  const hasMessage = Boolean(message?.trim());
  const isFree = isFreePlan(plan);
  const imageCount = images?.length ?? 0;

  return (
    <div className="relative h-full min-h-full w-full overflow-hidden rounded-[30px] bg-[#070b16] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950/25 via-slate-950/60 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),_transparent_28%)]" />

      <div className="relative z-10 flex h-full flex-col gap-4 p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80 shadow-[0_0_12px_rgba(251,113,133,0.7)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80 shadow-[0_0_12px_rgba(252,211,77,0.6)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(74,222,128,0.6)]" />
          </div>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/50">
            {uiCopy.editor.previewPanelTitle}
          </span>
        </div>

        <div className="grid flex-1 min-h-0 gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <section className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-black/90" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 md:p-5">
              <span
                className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] ${
                  isFree
                    ? 'border-pink-400/30 bg-pink-500/15 text-pink-100'
                    : 'border-white/15 bg-white/10 text-white/80'
                }`}
              >
                {isFree ? 'Plano grátis' : 'Plano premium'}
              </span>
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur-md">
                {getLayoutLabel(layoutPosition)}
              </span>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-5 lg:p-7">
              <div className="max-w-4xl rounded-[24px] border border-white/10 bg-black/35 p-4 md:p-5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                {startDateValue ? (
                  <DurationCounter startDate={startDateValue} />
                ) : (
                  <div className="flex min-h-[160px] items-center justify-center rounded-[18px] border border-dashed border-white/15 bg-white/5 px-6 text-center">
                    <p className="max-w-md text-sm leading-6 text-white/70">
                      Escolha a data inicial da história para ativar o contador e ver a prévia completa.
                    </p>
                  </div>
                )}
              </div>

              {entryButtonText && (
                <div className="mt-4 inline-flex self-start rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  {entryButtonText}
                </div>
              )}
            </div>
          </section>

          <div className="flex min-h-0 flex-col gap-3">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.3em] text-white/55">
                  {hasMessage ? 'Mensagem da história' : 'Espaço da mensagem'}
                </h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                  {imageCount} foto{imageCount === 1 ? '' : 's'}
                </span>
              </div>

              {hasMessage ? (
                <p
                  className="max-h-[280px] overflow-y-auto pr-1 font-cursive text-xl leading-relaxed text-slate-100 sm:text-[1.7rem]"
                  style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.35)' }}
                >
                  <QuoteStartIcon className="text-slate-500" />
                  {message}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-base font-semibold text-white/85">
                    A história ainda não tem uma mensagem definida.
                  </p>
                  <p className="text-sm leading-6 text-white/65">
                    O preview continua equilibrado sem aquele vazio gigante, e você ainda consegue ver o contador,
                    o plano e os detalhes principais da publicação.
                  </p>
                </div>
              )}
            </section>

            <section className="grid gap-2 sm:grid-cols-2">
              <InfoTile
                label="Data inicial"
                value={startDateValue ? startDateValue.toLocaleDateString('pt-BR') : 'Não definida'}
              />
              <InfoTile label="Mídia" value={youtubeUrl ? 'Música habilitada' : 'Sem música'} />
              <InfoTile label="Fotos" value={`${imageCount} imagem(ns)`} />
              <InfoTile label="Acesso" value={storyPassword ? 'Protegida com senha' : 'Acesso livre'} />
            </section>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                {layoutPosition === 'top'
                  ? 'Layout superior'
                  : layoutPosition === 'center'
                    ? 'Layout central'
                    : 'Layout inferior'}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                {isFree ? "Marca d'água ativa" : "Sem marca d'água"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                Prévia em tempo real
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
