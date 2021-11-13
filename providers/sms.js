const config = require('config');

const FormData = require('form-data');
const { default: axios } = require('axios');

/**
 * Messaging Service for MSG91
 */
class MessagingProvider {
  /**
   * @type {number} Number of minutes OTP should expire in
   */
  expiry = 1440;
  /**
   * @type {number} Length of OTP
   */
  otpLength = 4;
  /**
   * @type {string} Sender ID
   */
  sender = "ONTRKT"
  /**
   * Template to use for OTP.
   * @deprecated
   * @private
   */
  template = ""
  /** @private */
  _otpEndpoint = "https://control.msg91.com/api/";
  /** @private */
  _dltEndpoint = "https://api.msg91.com/api/v5/flow";

  /**
   * Instantiate Messaging Service class
   * @param {string} key API / Auth key provided by MSG 91
   */
  constructor (key, template) {
    this.key = key;
    this.template = template || "Your otp is {{otp}}. Please do not share it with anybody"
  }

  /**
   * Returns the 4 digit otp
   * @returns {number} 4 digit otp
   * @private
   */
  _generateOTP() {
    return Math.floor(parseInt("1".padEnd(this.otpLength, "0")) + Math.random() * parseInt("9".padEnd(this.otpLength,"0")));
  }

  /**
   * Set Global OTP template
   * @param {string} template Template for OTP
   * @deprecated
   */
  setOTPTemplate(template) {
    this.template = template;
  }

  /**
   * Send/retry OTP to Recipient
   * @param {string} mobile Recipient mobile number
   * @param {boolean} isRetry Is this a retry attempt
   * @param {string} senderId Sender ID
   * @param {boolean} retryVoice Retry with voice
   */
  sendOTP(mobile, isRetry = false, senderId = null, retryVoice = false) {
    const ep = this._otpEndpoint + (isRetry ? "retryotp.php" : "sendotp.php");
    const generatedOTP = this._generateOTP();
    const formData = new FormData();
    formData.append('authKey', this.key);
    formData.append('mobile', mobile);
    if (isRetry) {
      formData.append('retryType', retryVoice ? 'voice' : 'text');
    } else {
      formData.append('sender',senderId || this.sender);
      formData.append('message',this.template.replace('{{otp}}', generatedOTP));
      formData.append('otp',generatedOTP);
      formData.append('otp_expiry',this.expiry)
    }
    return axios.post(ep, formData, { headers: formData.getHeaders({ 'authKey': this.key }) })
  }

  /**
   * Verify OTP against mobile number
   * @param {string} mobile Recipient mobile number with country code
   * @param {string | number} otp OTP received by user to verify
   */
  verifyOTP(mobile, otp) {
    const options = { queryString: {
      mobile,
      otp,
      authkey: this.key
    } }
    const urlAppend = "?" + Object.keys(options.queryString).reduce((a, k, i, c) => a.concat(k, "=", encodeURIComponent(options.queryString[k]), i !== c.length - 1 ? "&" : ""), "");
    return axios.get(this._otpEndpoint + "verifyRequestOTP.php" + urlAppend, { headers: { 'authKey': this.key } });
  }

  /**
   * Send Message with particular flow
   * @param {Array<string> | string} mobiles Recipient mobile number with country code  
   * @param {string} flow Flow ID given by registrar  
   * @param {Array<string>} variables Array of variables (preserves order) i.e. `If passed ["a", "b"] then it becomes { VAR1 : "a", VAR2 : "b" }`
   * @returns 
   */
  sendMessage(mobiles, flow, variables) {
    const vars = {};
      typeof variables === 'object' && variables.forEach((s, i) => {
        vars["VAR" + (i + 1)] = s;
      });
    mobiles = Array.isArray(mobiles) ? mobiles.map(m => m.startsWith("+") ? m : ("+" + m)) : mobiles;
    return axios.post(this._dltEndpoint, { flow_id: flow, mobiles, sender: this.sender, ...vars }, { headers: { 'authKey': this.key } });
  }
}

module.exports.provider = new MessagingProvider(config.get('msg91Key'));
/**
 * Check if data is suitable for this particular provider  
 * NOTE: This function is necessary for provider to work otherwise provider will be skipped
 * @param {any} data Notification data from other service
 */
module.exports.isValidData = function (data) {
  const shouldHave = ['mobile', 'flow', 'vars'];
  return Object.keys(data).reduce((a,c) => a && shouldHave.includes(c), true);
}
/**
 * Tranform data to mongo compatible object  
 * NOTE: This is not necessary but helps when there is custom processing involved in notification processing
 * @param {any} data Notification data from other service
 */
module.exports.tranformToNotification = function (data) {
  return data;
}
