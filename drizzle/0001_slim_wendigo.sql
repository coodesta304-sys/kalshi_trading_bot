CREATE TABLE `ai_decisions` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`market_id` varchar(64) NOT NULL,
	`decision` enum('buy','sell','hold') NOT NULL,
	`confidence` int NOT NULL,
	`reasoning` text,
	`news_ids` text,
	`sentiment_score` int,
	`technical_signal` varchar(64),
	`ai_analysis` text,
	`executed` enum('yes','no','pending') DEFAULT 'pending',
	`outcome` enum('profit','loss','neutral','pending'),
	`profit_loss` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kalshi_markets` (
	`id` varchar(64) NOT NULL,
	`ticker` varchar(32) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` varchar(64),
	`expiration_date` timestamp,
	`current_price` int,
	`yes_price` int,
	`no_price` int,
	`volume_24h` int,
	`last_updated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `kalshi_markets_id` PRIMARY KEY(`id`),
	CONSTRAINT `kalshi_markets_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
CREATE TABLE `news_events` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`source` varchar(128),
	`source_url` varchar(512),
	`sentiment` enum('positive','negative','neutral') DEFAULT 'neutral',
	`sentiment_score` int,
	`related_markets` text,
	`ai_summary` text,
	`published_at` timestamp,
	`fetched_at` timestamp DEFAULT (now()),
	CONSTRAINT `news_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`total_balance` int NOT NULL,
	`available_balance` int NOT NULL,
	`total_positions` int NOT NULL,
	`unrealized_pnl` int,
	`realized_pnl` int,
	`win_rate` int,
	`total_trades` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `portfolio_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trading_orders` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`market_id` varchar(64) NOT NULL,
	`side` enum('yes','no') NOT NULL,
	`quantity` int NOT NULL,
	`limit_price` int,
	`status` enum('pending','open','filled','cancelled','failed') DEFAULT 'pending',
	`executed_price` int,
	`executed_quantity` int,
	`stop_loss` int,
	`take_profit` int,
	`kalshi_order_id` varchar(128),
	`decision_id` varchar(64),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trading_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trading_settings` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`max_position_size` int DEFAULT 500,
	`stop_loss_percent` int DEFAULT 200,
	`take_profit_percent` int DEFAULT 150,
	`max_daily_loss` int DEFAULT 1000,
	`enable_auto_trading` enum('yes','no') DEFAULT 'no',
	`enable_notifications` enum('yes','no') DEFAULT 'yes',
	`min_confidence_threshold` int DEFAULT 70,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trading_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `trading_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `ai_decisions` ADD CONSTRAINT `ai_decisions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_decisions` ADD CONSTRAINT `ai_decisions_market_id_kalshi_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `kalshi_markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolio_snapshots` ADD CONSTRAINT `portfolio_snapshots_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trading_orders` ADD CONSTRAINT `trading_orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trading_orders` ADD CONSTRAINT `trading_orders_market_id_kalshi_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `kalshi_markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trading_settings` ADD CONSTRAINT `trading_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;