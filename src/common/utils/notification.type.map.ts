import { NotificationType } from '../../entities';

export const notificationTypeContentMap: Record<NotificationType, string> = {
  [NotificationType.Message]: 'sent you a message',
  [NotificationType.Mention_Reel]: 'mentioned you in a reel',
  [NotificationType.Mention_Tweet]: 'mentioned you in a tweet',
  [NotificationType.Follow]: 'followed you',
  [NotificationType.Reply_Reel]: 'replied to your reel',
  [NotificationType.Reply_Tweet]: 'replied to your tweet',
  [NotificationType.React_Reel]: 'reacted to your reel',
  [NotificationType.React_Tweet]: 'reacted to your tweet',
  [NotificationType.Repost_Reel]: 'reposted your reel',
  [NotificationType.Repost_Tweet]: 'reposted your tweet',
  [NotificationType.temp]: 'temp your tweet',
  [NotificationType.temp2]: 'temp your tweet',
  [NotificationType.temp3]: 'temp your tweet',
  [NotificationType.temp4]: 'temp your tweet',
};
