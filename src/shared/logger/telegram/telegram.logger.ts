import * as https from 'https'
import telegramTransporter from './telegram.transporter'

enum LOG_LEVEL {
    DEBUG = 'debug',
    INFO = 'info',
    ERROR = 'error',
    ALERT = 'alert',
    WARNING = 'warning',
}

export class TelegramLogger {
    token: string;
    defaultChannel: string;
    baseUrl: string;
    deliveryTag: string

    constructor(token: string, channel: string, service: string, env: string) {
        this.token = token;
        this.defaultChannel = channel;
        this.baseUrl = `https://api.telegram.org/bot${token}/`;
        this.deliveryTag = `[Service: ${service?.toUpperCase()} - ${env}]`;
    }

    sendRequest(url: string) {
        return https.get(url, (res) => {
            const { statusCode } = res;
            if (statusCode !== 200) {
                let data: string;
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    return data;
                });
            }
        }).on('error', (e) => {
            // tslint:disable-next-line:no-console
            console.log(e, 'got an error in https request');
        });
    }

    sendMessage(message: string, level = LOG_LEVEL.ERROR, channel = this.defaultChannel) {
        const emoji = this.emojiMap()[level];
        message = removeXmlTags(message);
        message = `${emoji} <b>[${level.toUpperCase()}] - ${this.deliveryTag}</b>

        <code>${message}</code>

    ${this.getDate()}`;
        const urlParams = encodeURI(`chat_id=${channel}&text=${message}&parse_mode=HTML`);
        const url = `${this.baseUrl}sendMessage?${urlParams}`;
        this.sendRequest(url);
    }
    emojiMap(): Record<string, string> {
        return {
            debug: '🚧',
            info: '‍💬',
            warning: '⚡️',
            error: '🚨',
            alert: '👀',
        };
    }

    getDate(): string {
        const date = new Date();
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'pm' : 'am';
        const strTime = `${hours}:${minutes} ${ampm}`;
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year} ${strTime}`;
    }

    getRandomNumber(min: number, max: number) {
        return Math.round(Math.random() * (max - min) + min)
    }

    setWinstonTransporter(tg: this) {
        return new telegramTransporter({ filename: 'error.log', level: 'info' }, tg)
    };

    error(error: any, channel = '') {
        const errorString = this.getErrorString(error);
        this.sendMessage(errorString, LOG_LEVEL.ERROR, channel || this.defaultChannel);
    }

    getErrorString(error: any) {
        if (error instanceof Error) {
            return `Error: ${error.message}\nStack Trace:\n${error.stack}`;
        } else if (typeof error !== 'string') {
            return JSON.stringify(error, null, 2);
        }
        return error;
    }
}


function removeXmlTags(xml: string) {
    return xml.replace(/<[^>]*>/g, '');
}