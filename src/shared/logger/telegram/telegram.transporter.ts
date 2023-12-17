import * as Transport from 'winston-transport';

export default class TelegramTransport extends Transport {
  tg: any;

  constructor(options: any, tg: any) {
    super(options);
    this.tg = tg;
  }

  log(info: { message: string, level: string }, callback: () => void) {
    if (typeof info.message !== 'string') {
      info.message = JSON.stringify(info.message, null, 2);
    }
    this.tg.sendMessage(info.message, info.level);
    callback();
  }
};
