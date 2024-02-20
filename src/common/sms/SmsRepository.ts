export default interface SmsRepository {
    sendSms(to: string, body: string): Promise<void>;
    verify(to: string, code: string): Promise<boolean>;
    sendVerify(to: string): Promise<boolean>;
}
