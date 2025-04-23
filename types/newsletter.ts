export interface NewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NewsletterSubscriptionData {
  email: string;
}