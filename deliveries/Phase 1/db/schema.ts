import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  lastActive: integer("last_active", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("users_wallet_address_idx").on(t.walletAddress),
  index("users_last_active_idx").on(t.lastActive),
]);

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  voiceCommand: text("voice_command").notNull(),
  parsedIntent: text("parsed_intent", { mode: "json" }).notNull().$type<{
    action: string;
    amount: string;
    token: string;
    recipient: string;
    conditions?: string[];
  }>(),
  recipientAddress: text("recipient_address").notNull(),
  amount: text("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status", { enum: ["pending", "confirmed", "failed", "cancelled"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
}, t => [
  index("transactions_user_id_idx").on(t.userId),
  index("transactions_status_idx").on(t.status),
  index("transactions_created_at_idx").on(t.createdAt),
  index("transactions_hash_idx").on(t.transactionHash),
]);

export const voiceSessions = sqliteTable("voice_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  responseAudioUrl: text("response_audio_url"),
  responseText: text("response_text"),
  processingStatus: text("processing_status", { enum: ["processing", "completed", "failed"] }).notNull().default("processing"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("voice_sessions_user_id_idx").on(t.userId),
  index("voice_sessions_created_at_idx").on(t.createdAt),
]);

export const tokens = sqliteTable("tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  decimals: integer("decimals").notNull(),
  chainId: text("chain_id").notNull(),
  assetId: text("asset_id"),
  isNative: integer("is_native", { mode: "boolean" }).notNull().default(false),
  priceUsd: text("price_usd"),
  lastPriceUpdate: integer("last_price_update", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("tokens_symbol_idx").on(t.symbol),
  index("tokens_chain_id_idx").on(t.chainId),
]);

export const walletConnections = sqliteTable("wallet_connections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  walletType: text("wallet_type", { enum: ["polkadot-js", "talisman", "subwallet", "ledger", "trezor"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastUsed: integer("last_used", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("wallet_connections_user_id_idx").on(t.userId),
  index("wallet_connections_wallet_type_idx").on(t.walletType),
]);

export const voiceCommands = sqliteTable("voice_commands", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull().references(() => voiceSessions.id),
  command: text("command").notNull(),
  intent: text("intent", { mode: "json" }).$type<{
    action: string;
    entities: Record<string, any>;
    confidence: number;
  }>(),
  processingTime: integer("processing_time"),
  success: integer("success", { mode: "boolean" }).notNull(),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("voice_commands_user_id_idx").on(t.userId),
  index("voice_commands_session_id_idx").on(t.sessionId),
  index("voice_commands_created_at_idx").on(t.createdAt),
]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details", { mode: "json" }).$type<Record<string, any>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: integer("success", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("audit_logs_user_id_idx").on(t.userId),
  index("audit_logs_action_idx").on(t.action),
  index("audit_logs_created_at_idx").on(t.createdAt),
]);

export const xcmTransactions = sqliteTable("xcm_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  transactionId: text("transaction_id").notNull().references(() => transactions.id),
  sourceChain: text("source_chain").notNull(),
  destinationChain: text("destination_chain").notNull(),
  xcmMessageHash: text("xcm_message_hash"),
  xcmStatus: text("xcm_status", { enum: ["pending", "delivered", "failed", "timeout"] }).notNull().default("pending"),
  fees: text("fees", { mode: "json" }).$type<{
    sourceFee: string;
    destinationFee: string;
    currency: string;
  }>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
}, t => [
  index("xcm_transactions_transaction_id_idx").on(t.transactionId),
  index("xcm_transactions_source_chain_idx").on(t.sourceChain),
  index("xcm_transactions_xcm_status_idx").on(t.xcmStatus),
]);

export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  voiceSettings: text("voice_settings", { mode: "json" }).$type<{
    language: string;
    voiceId?: string;
    confirmationRequired: boolean;
    biometricEnabled: boolean;
  }>(),
  securitySettings: text("security_settings", { mode: "json" }).$type<{
    maxTransactionAmount: string;
    requireMfaAbove: string;
    allowedTokens: string[];
    trustedAddresses: string[];
  }>(),
  notificationSettings: text("notification_settings", { mode: "json" }).$type<{
    emailNotifications: boolean;
    transactionAlerts: boolean;
    securityAlerts: boolean;
  }>(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, t => [
  index("user_preferences_user_id_idx").on(t.userId),
]);

export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  voiceSessions: many(voiceSessions),
  walletConnections: many(walletConnections),
  voiceCommands: many(voiceCommands),
  auditLogs: many(auditLogs),
  preferences: one(userPreferences),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  xcmTransaction: one(xcmTransactions),
}));

export const voiceSessionsRelations = relations(voiceSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [voiceSessions.userId],
    references: [users.id],
  }),
  commands: many(voiceCommands),
}));

export const walletConnectionsRelations = relations(walletConnections, ({ one }) => ({
  user: one(users, {
    fields: [walletConnections.userId],
    references: [users.id],
  }),
}));

export const voiceCommandsRelations = relations(voiceCommands, ({ one }) => ({
  user: one(users, {
    fields: [voiceCommands.userId],
    references: [users.id],
  }),
  session: one(voiceSessions, {
    fields: [voiceCommands.sessionId],
    references: [voiceSessions.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const xcmTransactionsRelations = relations(xcmTransactions, ({ one }) => ({
  transaction: one(transactions, {
    fields: [xcmTransactions.transactionId],
    references: [transactions.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));
