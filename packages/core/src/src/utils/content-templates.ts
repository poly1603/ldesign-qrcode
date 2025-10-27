/**
 * QR Code Content Template Helpers
 * Provides easy-to-use templates for common QR code content types
 */

/**
 * WiFi Network Configuration
 */
export interface WiFiConfig {
  /** Network SSID */
  ssid: string;
  /** Network password */
  password: string;
  /** Encryption type */
  encryption: 'WPA' | 'WPA2' | 'WEP' | 'nopass';
  /** Hidden network */
  hidden?: boolean;
}

/**
 * vCard Contact Information
 */
export interface VCardContact {
  /** Full name */
  name: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Organization/Company */
  organization?: string;
  /** Job title */
  title?: string;
  /** Phone numbers */
  phones?: Array<{ type: 'mobile' | 'home' | 'work' | 'fax'; number: string }>;
  /** Email addresses */
  emails?: Array<{ type: 'home' | 'work'; address: string }>;
  /** Addresses */
  addresses?: Array<{
    type: 'home' | 'work';
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }>;
  /** Website URL */
  url?: string;
  /** Birthday (YYYY-MM-DD) */
  birthday?: string;
  /** Notes */
  note?: string;
}

/**
 * Calendar Event
 */
export interface CalendarEvent {
  /** Event title */
  title: string;
  /** Start date/time */
  start: Date;
  /** End date/time */
  end: Date;
  /** Location */
  location?: string;
  /** Description */
  description?: string;
  /** All day event */
  allDay?: boolean;
}

/**
 * SMS Message
 */
export interface SMSMessage {
  /** Phone number */
  number: string;
  /** Message body */
  body?: string;
}

/**
 * Email Message
 */
export interface EmailMessage {
  /** Recipient email address */
  to: string;
  /** Subject */
  subject?: string;
  /** Body */
  body?: string;
  /** CC */
  cc?: string;
  /** BCC */
  bcc?: string;
}

/**
 * Payment Information
 */
export interface PaymentInfo {
  /** Payment type */
  type: 'upi' | 'alipay' | 'wechat' | 'bitcoin' | 'ethereum' | 'paypal';
  /** Payment address/ID */
  address: string;
  /** Amount */
  amount?: number;
  /** Currency */
  currency?: string;
  /** Note/Description */
  note?: string;
}

/**
 * Geographic Location
 */
export interface GeoLocation {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Altitude (optional) */
  altitude?: number;
}

/**
 * QR Code Content Template Helper
 */
export class QRContentHelper {
  /**
   * Generate WiFi network configuration string
   */
  static wifi(config: WiFiConfig): string {
    const { ssid, password, encryption, hidden = false } = config;
    return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};`;
  }

  /**
   * Generate vCard contact string
   */
  static vCard(contact: VCardContact): string {
    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

    // Name
    if (contact.firstName || contact.lastName) {
      lines.push(`N:${contact.lastName || ''};${contact.firstName || ''};;;`);
    }
    lines.push(`FN:${contact.name}`);

    // Organization and title
    if (contact.organization) {
      lines.push(`ORG:${contact.organization}`);
    }
    if (contact.title) {
      lines.push(`TITLE:${contact.title}`);
    }

    // Phone numbers
    if (contact.phones) {
      contact.phones.forEach(phone => {
        const type = phone.type.toUpperCase();
        lines.push(`TEL;TYPE=${type}:${phone.number}`);
      });
    }

    // Email addresses
    if (contact.emails) {
      contact.emails.forEach(email => {
        const type = email.type.toUpperCase();
        lines.push(`EMAIL;TYPE=${type}:${email.address}`);
      });
    }

    // Addresses
    if (contact.addresses) {
      contact.addresses.forEach(addr => {
        const type = addr.type.toUpperCase();
        const parts = [
          '', // PO Box
          '', // Extended address
          addr.street || '',
          addr.city || '',
          addr.state || '',
          addr.zip || '',
          addr.country || '',
        ];
        lines.push(`ADR;TYPE=${type}:${parts.join(';')}`);
      });
    }

    // URL
    if (contact.url) {
      lines.push(`URL:${contact.url}`);
    }

    // Birthday
    if (contact.birthday) {
      lines.push(`BDAY:${contact.birthday.replace(/-/g, '')}`);
    }

    // Note
    if (contact.note) {
      lines.push(`NOTE:${contact.note}`);
    }

    lines.push('END:VCARD');
    return lines.join('\n');
  }

  /**
   * Generate calendar event string (iCal format)
   */
  static event(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
    ];

    lines.push(`SUMMARY:${event.title}`);
    lines.push(`DTSTART:${formatDate(event.start)}`);
    lines.push(`DTEND:${formatDate(event.end)}`);

    if (event.location) {
      lines.push(`LOCATION:${event.location}`);
    }

    if (event.description) {
      lines.push(`DESCRIPTION:${event.description}`);
    }

    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.join('\n');
  }

  /**
   * Generate SMS message string
   */
  static sms(message: SMSMessage): string {
    const { number, body } = message;
    if (body) {
      return `SMSTO:${number}:${body}`;
    }
    return `sms:${number}`;
  }

  /**
   * Generate email string
   */
  static email(email: EmailMessage): string {
    const params: string[] = [];

    if (email.subject) {
      params.push(`subject=${encodeURIComponent(email.subject)}`);
    }

    if (email.body) {
      params.push(`body=${encodeURIComponent(email.body)}`);
    }

    if (email.cc) {
      params.push(`cc=${encodeURIComponent(email.cc)}`);
    }

    if (email.bcc) {
      params.push(`bcc=${encodeURIComponent(email.bcc)}`);
    }

    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return `mailto:${email.to}${query}`;
  }

  /**
   * Generate phone call string
   */
  static phone(number: string): string {
    return `tel:${number}`;
  }

  /**
   * Generate URL string
   */
  static url(url: string): string {
    // Ensure URL has protocol
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Generate plain text string
   */
  static text(text: string): string {
    return text;
  }

  /**
   * Generate payment string
   */
  static payment(payment: PaymentInfo): string {
    const { type, address, amount, currency, note } = payment;

    switch (type) {
      case 'upi':
        // UPI format: upi://pay?pa=ADDRESS&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
        const upiParams: string[] = [`pa=${encodeURIComponent(address)}`];
        if (amount) upiParams.push(`am=${amount}`);
        if (currency) upiParams.push(`cu=${currency}`);
        if (note) upiParams.push(`tn=${encodeURIComponent(note)}`);
        return `upi://pay?${upiParams.join('&')}`;

      case 'bitcoin':
        // Bitcoin format: bitcoin:ADDRESS?amount=AMOUNT&label=NOTE
        const btcParams: string[] = [];
        if (amount) btcParams.push(`amount=${amount}`);
        if (note) btcParams.push(`label=${encodeURIComponent(note)}`);
        const btcQuery = btcParams.length > 0 ? `?${btcParams.join('&')}` : '';
        return `bitcoin:${address}${btcQuery}`;

      case 'ethereum':
        // Ethereum format: ethereum:ADDRESS?value=AMOUNT
        const ethParams: string[] = [];
        if (amount) ethParams.push(`value=${amount}`);
        const ethQuery = ethParams.length > 0 ? `?${ethParams.join('&')}` : '';
        return `ethereum:${address}${ethQuery}`;

      case 'paypal':
        // PayPal format: https://www.paypal.me/USERNAME/AMOUNT
        if (amount) {
          return `https://www.paypal.me/${address}/${amount}`;
        }
        return `https://www.paypal.me/${address}`;

      case 'alipay':
      case 'wechat':
        // These typically use their own app-specific formats
        return address;

      default:
        return address;
    }
  }

  /**
   * Generate geographic location string
   */
  static location(location: GeoLocation): string {
    const { latitude, longitude, altitude } = location;
    if (altitude !== undefined) {
      return `geo:${latitude},${longitude},${altitude}`;
    }
    return `geo:${latitude},${longitude}`;
  }

  /**
   * Generate Google Maps URL
   */
  static googleMaps(location: GeoLocation | string): string {
    if (typeof location === 'string') {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  /**
   * Generate WhatsApp message string
   */
  static whatsapp(phone: string, message?: string): string {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (message) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    }
    return `https://wa.me/${cleanPhone}`;
  }

  /**
   * Generate Telegram message string
   */
  static telegram(username: string, message?: string): string {
    if (message) {
      return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
    }
    return `https://t.me/${username}`;
  }

  /**
   * Generate app store link
   */
  static appStore(options: { ios?: string; android?: string }): string {
    const { ios, android } = options;

    // If both provided, create a universal link that detects platform
    if (ios && android) {
      return `https://onelink.to/app?ios=${encodeURIComponent(ios)}&android=${encodeURIComponent(android)}`;
    }

    if (ios) {
      return `https://apps.apple.com/app/${ios}`;
    }

    if (android) {
      return `https://play.google.com/store/apps/details?id=${android}`;
    }

    throw new Error('At least one app store ID must be provided');
  }

  /**
   * Generate social media profile link
   */
  static socialMedia(platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube', username: string): string {
    const baseUrls: Record<string, string> = {
      twitter: 'https://twitter.com/',
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      linkedin: 'https://linkedin.com/in/',
      youtube: 'https://youtube.com/@',
    };

    return `${baseUrls[platform]}${username}`;
  }

  /**
   * Generate blockchain address payment link (NEW)
   */
  static blockchain(config: {
    chain: 'bitcoin' | 'ethereum' | 'polygon' | 'bnb' | 'solana';
    address: string;
    amount?: number;
    memo?: string;
  }): string {
    const { chain, address, amount, memo } = config;

    switch (chain) {
      case 'bitcoin':
        let btcUrl = `bitcoin:${address}`;
        if (amount) btcUrl += `?amount=${amount}`;
        if (memo) btcUrl += `${amount ? '&' : '?'}label=${encodeURIComponent(memo)}`;
        return btcUrl;

      case 'ethereum':
      case 'polygon':
      case 'bnb':
        let ethUrl = `ethereum:${address}`;
        if (amount) ethUrl += `@${amount}`;
        return ethUrl;

      case 'solana':
        let solUrl = `solana:${address}`;
        if (amount) solUrl += `?amount=${amount}`;
        if (memo) solUrl += `${amount ? '&' : '?'}memo=${encodeURIComponent(memo)}`;
        return solUrl;

      default:
        return address;
    }
  }

  /**
   * Generate NFT metadata link (NEW)
   */
  static nft(config: {
    contract: string;
    tokenId: string;
    chain?: 'ethereum' | 'polygon' | 'bnb';
    marketplace?: 'opensea' | 'rarible' | 'looksrare';
  }): string {
    const { contract, tokenId, chain = 'ethereum', marketplace = 'opensea' } = config;

    const marketplaceUrls: Record<string, string> = {
      opensea: `https://opensea.io/assets/${chain}/${contract}/${tokenId}`,
      rarible: `https://rarible.com/token/${contract}:${tokenId}`,
      looksrare: `https://looksrare.org/collections/${contract}/${tokenId}`,
    };

    return marketplaceUrls[marketplace];
  }

  /**
   * Generate digital certificate verification link (NEW)
   */
  static certificate(config: {
    id: string;
    issuer: string;
    verificationUrl?: string;
  }): string {
    const { id, issuer, verificationUrl } = config;

    if (verificationUrl) {
      return `${verificationUrl}?id=${encodeURIComponent(id)}&issuer=${encodeURIComponent(issuer)}`;
    }

    // Generic format
    return `cert:${issuer}:${id}`;
  }

  /**
   * Generate health pass QR code data (NEW)
   */
  static healthPass(config: {
    name: string;
    dob: Date;
    idNumber: string;
    verificationCode: string;
  }): string {
    const { name, dob, idNumber, verificationCode } = config;

    // SHC (SMART Health Card) format
    const data = {
      iss: 'health-authority',
      nbf: Math.floor(Date.now() / 1000),
      vc: {
        type: ['https://smarthealth.cards#health-card'],
        credentialSubject: {
          fhirBundle: {
            entry: [
              {
                resource: {
                  name: [{ text: name }],
                  birthDate: dob.toISOString().split('T')[0],
                  identifier: [{ value: idNumber }],
                },
              },
            ],
          },
        },
      },
    };

    return `shc:/${verificationCode}/${btoa(JSON.stringify(data))}`;
  }

  /**
   * Generate electronic ticket data (NEW)
   */
  static ticket(config: {
    event: string;
    ticketId: string;
    holder: string;
    dateTime: Date;
    venue: string;
    seat?: string;
  }): string {
    const { event, ticketId, holder, dateTime, venue, seat } = config;

    const ticketData = {
      event,
      id: ticketId,
      holder,
      date: dateTime.toISOString(),
      venue,
      seat: seat || 'General Admission',
    };

    // Return as JSON for scanning apps
    return JSON.stringify(ticketData);
  }

  /**
   * Generate logistics tracking link (NEW)
   */
  static logistics(config: {
    trackingNumber: string;
    carrier: string;
    trackingUrl?: string;
  }): string {
    const { trackingNumber, carrier, trackingUrl } = config;

    if (trackingUrl) {
      return trackingUrl;
    }

    // Common carrier URLs
    const carrierUrls: Record<string, string> = {
      ups: 'https://www.ups.com/track?tracknum=',
      fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
      usps: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
      dhl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
    };

    const baseUrl = carrierUrls[carrier.toLowerCase()];
    if (baseUrl) {
      return `${baseUrl}${trackingNumber}`;
    }

    return `track:${carrier}:${trackingNumber}`;
  }

  /**
   * Generate multi-chain wallet connect (NEW)
   */
  static walletConnect(config: {
    uri: string;
    chains?: number[];
  }): string {
    const { uri, chains } = config;

    if (chains && chains.length > 0) {
      return `${uri}?chains=${chains.join(',')}`;
    }

    return uri;
  }
}

// Export default
export default QRContentHelper;
