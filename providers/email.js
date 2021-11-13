const config = require('config');
const mailgun = require('mailgun.js');
const formData = require('form-data');

class EmailProvider {

    /**
     * This value is harcoded for safety reasons. DO NOT change
     * @type {string} master bcc
     * @private
     */
    masterBcc = 'info@on-track.in';

    /**
     * @type {string | null} API key for mailgun account
     * @private
     */
    apiKey = null;

    /**
     * @type {string | null} domain name
     * @private
     */
    domain = null;

    /**
     * @type {import('mailgun.js/dist/lib/client').default} Mailgun instance
     * @private
     */
    mailgunClient = null;

    /**
     * Create instance of Mailgun provider for email trigger
     * @param {string} apiKey API key for mailgun account
     * @param {string} domain domain name form which the email is supposed to be sent
     */
    constructor (apiKey, domain) {
        this.apiKey = apiKey;
        this.domain = domain;
        const _mgInstance = new mailgun(formData);
        this.mailgunClient = _mgInstance.client({ key: this.apiKey, username: 'api' });
    }

    /**
     * Send email in raw format
     * @param {string} from sender email
     * @param {string | string[] | { email: string, data: any } | { email: string, data: any }[]} to list of receivers
     * @param {string} subject subject of the email
     * @param {string} body email content
     * @param {{filename: string, url: string} | {filename: string, url: string}[] | null} attachment attachment files public url - should be accessible/downloadable form anywhere
     * @public
     */
    sendEmailRaw(from, to, subject, body, attachment = null) {
        const messageRequest = { from, to, subject, html: body, ...this.processEmailExtras(to,null,attachment) };
        return this.mailgunClient.messages.create(this.domain, messageRequest);
    }
    
    /**
     * Send Mailgun templated email
     * @param {string} from sender email
     * @param {string | string[]} to list of receivers
     * @param {string} subject subject of the email
     * @param {string} template name of the mailgun template
     * @param {{[key: string]: any}} data template data
     * @param {{filename: string, url: string}|{filename: string, url: string}[] | null} attachment attachment files public url - should be accessible/downloadable from anywhere
     * @public
     */
    sendMailgunTemplateEmail(from, to, subject, template, data = null, attachment = null) {
        const messageRequest = { from, to, subject, template , ...this.processEmailExtras(null,data,attachment)};
        return this.mailgunClient.messages.create(this.domain, messageRequest);
    }

    /**
     * Process extra email attributes
     * @param {string | string[] | { email: string, data: any } | { email: string, data: any }[]} toData list of receivers
     * @param {{[key: string]: any}} templateData template data
     * @param {{filename: string, url: string}|{filename: string, url: string}[] | null} attachment attachment files public url - should be accessible/downloadable from anywhere
     * @private
     */
    processEmailExtras(toData, templateData, attachment) {
        const extras = {};
        if (this.masterBcc) {
            extras.bcc = this.masterBcc;
        }
        if (templateData && Object.keys(templateData).length) {
            extras['h:X-Mailgun-Variables'] = JSON.stringify(templateData);
        }
        const processedAttachment = attachment ? this.processAttachment(...(Array.isArray(attachment) ? attachment : [attachment])) : null;
        if (processedAttachment) {
            extras.attachment = processedAttachment;
        }
        const recipientData = this.processRecepientData(toData);
        if (recipientData) {
            extras['recipient-variables'] = recipientData;
        }
        return extras;
    }

    /**
     * Get Recipient variable object from list of senders
     * @param {string | string[] | { email: string, data: any } | { email: string, data: any }[]} toData list of receivers
     * @private
     */
    processRecepientData(toData) {
        if (toData && Array.isArray(toData) && toData.length && typeof toData[0] === 'object' && !Array.isArray(toData[0]) && toData[0].data) {
            return toData.reduce((a,c) => { a[c.email] = c.data; return a; }, {});
        }
        return {};
    }
    
    /**
     * Process url and download file
     * @param  {...{ filename: string, url: string }} attachment public downloadable urls
     * @private
     */
    processAttachment(...attachment) {
        // write download file code here
        return null;
    }


}

/**
 * EmailProvider
 */
module.exports.provider = new EmailProvider(config.get('mailgun.key'), config.get('mailgun.domain'));
/**
 * Check if data is suitable for this particular provider  
 * NOTE: This function is necessary for provider to work otherwise provider will be skipped
 * @param {any} data Notification data from other service
 */
module.exports.isValidData = function (data) {
    const shouldHave = ['email', 'subject', 'body'];
    const dataKeys = Object.keys(data);
    return shouldHave.reduce((a,c) => a && dataKeys.includes(c), true);
}
