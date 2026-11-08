CREATE TABLE `guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`vip` int NOT NULL DEFAULT 0,
	`stayCount` int NOT NULL DEFAULT 1,
	`lastStayAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`confirmationCode` varchar(24) NOT NULL,
	`guestName` varchar(160) NOT NULL,
	`guestEmail` varchar(320),
	`roomNumber` varchar(16) NOT NULL,
	`roomType` varchar(64) NOT NULL,
	`checkIn` timestamp NOT NULL,
	`checkOut` timestamp NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'confirmed',
	`source` varchar(32) NOT NULL DEFAULT 'direct',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservations_confirmationCode_unique` UNIQUE(`confirmationCode`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomNumber` varchar(16) NOT NULL,
	`roomType` varchar(64) NOT NULL,
	`floor` int NOT NULL,
	`status` enum('available','occupied','cleaning','maintenance') NOT NULL DEFAULT 'available',
	`rate` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_roomNumber_unique` UNIQUE(`roomNumber`)
);
