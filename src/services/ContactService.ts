import { NotFoundError, RateLimitError, ValidationError } from "../errors/index.js";
import type { ContactMessage, ContactStatus } from "../models/index.js";
import {
  systemClock,
  type Clock,
  type ContactMessageRepository,
  type ContactNotifier,
} from "../repositories/index.js";
import { isEmail, newId, Validator } from "../utils/index.js";

export interface ContactFormInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Hidden field in the form. Real people leave it empty; bots fill it. */
  website?: string;
}

export interface ContactOptions {
  maxPerHour: number;
  minMessageLength: number;
  maxMessageLength: number;
}

const DEFAULTS: ContactOptions = { maxPerHour: 3, minMessageLength: 10, maxMessageLength: 5000 };
const SPAM_WORDS = ["casino", "viagra", "crypto giveaway", "seo services", "backlinks"];

export class ContactService {
  private readonly opts: ContactOptions;

  constructor(
    private readonly repo: ContactMessageRepository,
    private readonly notifier?: ContactNotifier,
    private readonly clock: Clock = systemClock,
    options: Partial<ContactOptions> = {},
  ) {
    this.opts = { ...DEFAULTS, ...options };
  }

  /** Called by the "Contact me" form. */
  async submit(input: ContactFormInput): Promise<{ id: string }> {
    const clean = {
      name: (input.name ?? "").trim(),
      email: (input.email ?? "").trim().toLowerCase(),
      subject: (input.subject ?? "").trim() || "New message from your website",
      message: (input.message ?? "").trim(),
    };

    const v = new Validator()
      .require(clean.name, "name")
      .require(clean.email, "email")
      .require(clean.message, "message")
      .maxLength(clean.name, 100, "name")
      .maxLength(clean.subject, 150, "subject")
      .maxLength(clean.message, this.opts.maxMessageLength, "message");
    if (clean.email) v.check(isEmail(clean.email), "email is not valid");
    if (clean.message) {
      v.check(clean.message.length >= this.opts.minMessageLength, `message must be at least ${this.opts.minMessageLength} characters`);
    }
    if (v.issues.length) throw new ValidationError(v.issues);

    const now = this.clock.now();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if ((await this.repo.countSince(clean.email, hourAgo)) >= this.opts.maxPerHour) {
      throw new RateLimitError("Too many messages, please try again later");
    }

    const msg: ContactMessage = {
      id: newId(),
      ...clean,
      status: this.looksLikeSpam(input) ? "spam" : "new",
      createdAt: now,
    };
    await this.repo.save(msg);

    // Only bother you for real messages. A notifier failure must not lose the message.
    if (msg.status === "new" && this.notifier) {
      try {
        await this.notifier.notify(msg);
      } catch {
        /* message is saved; you will still see it in the inbox */
      }
    }
    // Bots get the same success answer, so they don't learn they were caught.
    return { id: msg.id };
  }

  // ---- your inbox (admin) ----

  async listInbox(includeSpam = false): Promise<ContactMessage[]> {
    return (await this.repo.list())
      .filter((m) => includeSpam || m.status !== "spam")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async unreadCount(): Promise<number> {
    return (await this.repo.list()).filter((m) => m.status === "new").length;
  }

  async setStatus(id: string, status: ContactStatus): Promise<ContactMessage> {
    const m = await this.repo.getById(id);
    if (!m) throw new NotFoundError("ContactMessage", id);
    m.status = status;
    await this.repo.save(m);
    return m;
  }

  markRead = (id: string) => this.setStatus(id, "read");
  markReplied = (id: string) => this.setStatus(id, "replied");
  markSpam = (id: string) => this.setStatus(id, "spam");

  async deleteMessage(id: string): Promise<void> {
    if (!(await this.repo.delete(id))) throw new NotFoundError("ContactMessage", id);
  }

  private looksLikeSpam(input: ContactFormInput): boolean {
    if (input.website && input.website.trim() !== "") return true; // honeypot
    const text = `${input.subject ?? ""} ${input.message}`.toLowerCase();
    const links = (text.match(/https?:\/\//g) ?? []).length;
    return links > 3 || SPAM_WORDS.some((w) => text.includes(w));
  }
}
