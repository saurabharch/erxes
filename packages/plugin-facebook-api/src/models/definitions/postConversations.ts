import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IPostConversation {
  // id on erxes-api
  erxesApiId?: string;
  postId: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  customerId?: string;
  permalink_url: String;
}

export interface IPostConversationDocument
  extends IPostConversation,
    Document {}

export const postConversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  postId: { type: String, index: true },
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
  customerId: { type: String, optional: true },
  permalink_url: String
});

postConversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
