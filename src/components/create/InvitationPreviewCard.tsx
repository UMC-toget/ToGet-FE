import type { ReactNode } from 'react';
import InvitationVisual from '../invitation/InvitationVisual';
import { getInviteThemeColor } from '../invitation/inviteTheme';

interface Props {
  characterId?: number | null;
  backgroundId?: number | null;
  title: string;
  content: string;
  fromName: string;
  overlay?: ReactNode;
  compact?: boolean;
}

export default function InvitationPreviewCard({
  characterId,
  backgroundId,
  title,
  content,
  fromName,
  overlay,
  compact = false,
}: Props) {
  const accentColor = getInviteThemeColor(backgroundId);

  if (compact) {
    return (
      <div className="relative h-[198px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="pointer-events-none absolute left-1/2 -top-[51px] w-[402px] -translate-x-1/2 origin-top scale-[0.37]">
          <InvitationVisual characterId={characterId} backgroundId={backgroundId} title={null} />
        </div>
        <article className="absolute left-1/2 top-[112px] z-20 min-h-[74px] w-[138px] -translate-x-1/2 rounded-lg bg-white px-2.5 py-2.5 text-left shadow-[0_3px_10px_rgba(0,0,0,0.12)]">
          <p className="truncate text-[9px] font-bold text-gray-900">{title}</p>
          <p className="mt-1 line-clamp-2 whitespace-pre-line text-[6px] text-gray-500">{content}</p>
          <p className="mt-2 text-right text-[6px] font-medium" style={{ color: accentColor }}>
            from. {fromName}
          </p>
        </article>
        {overlay}
      </div>
    );
  }

  const card = (
    <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
      <div className="relative h-[334px] overflow-hidden">
        <div className="absolute -top-[44px] left-1/2 w-[402px] -translate-x-1/2 origin-top scale-[0.86]">
          <InvitationVisual
            characterId={characterId}
            backgroundId={backgroundId}
            title={
              <p className="text-center text-[18px] font-bold leading-[23px] text-gray-900">
                따뜻한 축하를
                <br />
                함께 전해주시겠어요?
              </p>
            }
          />
        </div>
      </div>
      <article className="relative z-20 mx-4 min-h-[164px] rounded-2xl bg-white px-5 py-6 text-left shadow-[0_4px_18px_rgba(0,0,0,0.10)]">
        <p className="text-[18px] font-bold leading-6 text-gray-900">{title}</p>
        <p className="mt-4 whitespace-pre-line text-[10px] leading-[14px] text-gray-500">{content}</p>
        <p className="mt-5 text-right text-sm font-bold" style={{ color: accentColor }}>
          from. {fromName}
        </p>
      </article>
      <div className="h-11" />
      {!compact && overlay}
    </div>
  );

  return card;
}
