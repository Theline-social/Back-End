import { NotificationType } from '../../entities';

export const notificationTypeContentMap: Record<
  NotificationType,
  Record<string, string>
> = {
  [NotificationType.Message]: {
    en: 'sent you a message',
    ar: 'أرسل لك رسالة',
  },
  [NotificationType.Mention_Reel]: {
    en: 'mentioned you in a reel',
    ar: 'ذكرك في قصة ',
  },
  [NotificationType.Mention_Tweet]: {
    en: 'mentioned you in a tweet',
    ar: 'ذكرك في مدونة',
  },
  [NotificationType.Follow]: {
    en: 'followed you',
    ar: 'قام بمتابعتك',
  },
  [NotificationType.Reply_Reel]: {
    en: 'replied to your reel',
    ar: 'رد على قصة خاصة بك',
  },
  [NotificationType.Reply_Tweet]: {
    en: 'replied to your tweet',
    ar: 'رد على مدونة خاصة بك',
  },
  [NotificationType.React_Reel]: {
    en: 'reacted to your reel',
    ar: 'تفاعل مع قصة خاصة بك',
  },
  [NotificationType.React_Tweet]: {
    en: 'reacted to your tweet',
    ar: 'تفاعل مع مدونة خاصة بك',
  },
  [NotificationType.Repost_Reel]: {
    en: 'reposted your reel',
    ar: 'أعاد نشر قصة خاصة بك',
  },
  [NotificationType.Repost_Tweet]: {
    en: 'reposted your tweet',
    ar: 'أعاد نشر مدونة خاصة بك',
  },
  [NotificationType.Quote_Tweet]: {
    en: 'quoted your tweet',
    ar: 'نقل مدونة خاصة بك',
  },
  [NotificationType.Quote_Reel]: {
    en: 'quoted your reel',
    ar: 'نقل  قصة خاصة بك',
  },
};
