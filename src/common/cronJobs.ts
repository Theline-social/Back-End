import { CronJob } from 'cron';
import { NotificationsService } from '../services/notification.service';
import { TagsService } from '../services/tag.service';

const notificationService = new NotificationsService();
const tagService = new TagsService();

export const deleteOldNotificationJob = new CronJob('0 0 * * *', async () => {
  console.log('Running cron job to delete old notifications...');
  await notificationService.deleteOldNotifications();
});

export const deleteTerminatedTagsJob = new CronJob('0 0 * * *', async () => {
  console.log('Running cron job to delete terminated tags...');
  await tagService.deleteTerminatedTags();
});
