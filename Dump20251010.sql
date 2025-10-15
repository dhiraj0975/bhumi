-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: bhumisha
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Natural\'s','Active'),(2,'Natural Wheat\'s Flours','Active'),(3,'Natural\'s Millet\'s','Active'),(4,'Natural Rice','Active'),(5,'Natural Dal','Active'),(6,'Natural Masala','Active'),(7,'Natural\'s Millet\'s Rava','Active'),(8,'Natural\'s Jaggery','Active'),(9,'Millet\'s Cookies','Inactive'),(18,'Dhiraj','Active');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `add_gst` tinyint(1) NOT NULL DEFAULT '0',
  `gst_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `min_balance` decimal(12,2) NOT NULL DEFAULT '5000.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `idx_customers_balance` (`balance`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Dhiraj','dhiraj@example.com','9876543210','123 MG Road, Delhi',0,0.00,0.00,5000.00,'2025-10-07 05:22:16','2025-10-10 05:18:55','Active'),(5,'Manav b','amit@example.com','9876543210','Pune, Maharashtra',0,0.00,0.00,5000.00,'2025-10-07 06:03:22','2025-10-09 17:39:53','Active'),(6,'Dinkar','dinkar@gmail.com','1234567890','UP',0,0.00,0.00,5000.00,'2025-10-07 06:50:35','2025-10-09 17:39:46','Active'),(10,'sharique khan','test@gmail.com','9131780746','bhopal 1',1,10.00,0.00,5000.00,'2025-10-09 04:57:33','2025-10-09 17:40:11','Active');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmer_bank_details`
--

DROP TABLE IF EXISTS `farmer_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farmer_bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_id` int DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(30) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `farmer_id` (`farmer_id`),
  CONSTRAINT `farmer_bank_details_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmer_bank_details`
--

LOCK TABLES `farmer_bank_details` WRITE;
/*!40000 ALTER TABLE `farmer_bank_details` DISABLE KEYS */;
INSERT INTO `farmer_bank_details` VALUES (9,9,'','','','','','','2025-08-28 15:42:56','2025-08-28 15:42:56'),(10,10,'','','','','','','2025-08-30 05:25:04','2025-08-30 05:25:04'),(15,15,'','','','','','','2025-10-09 10:22:20','2025-10-09 10:22:20');
/*!40000 ALTER TABLE `farmer_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmers`
--

DROP TABLE IF EXISTS `farmers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farmers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `tehsil` varchar(100) DEFAULT NULL,
  `patwari_halka` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `khasara_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `balance` decimal(10,2) DEFAULT '0.00',
  `min_balance` decimal(10,2) DEFAULT '5000.00',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_farmer_balance_nonneg` CHECK ((`balance` >= 0)),
  CONSTRAINT `chk_farmer_min_balance_nonneg` CHECK ((`min_balance` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmers`
--

LOCK TABLES `farmers` WRITE;
/*!40000 ALTER TABLE `farmers` DISABLE KEYS */;
INSERT INTO `farmers` VALUES (9,'Sakti-Mannnn','Papa','USA','USA','USA','Cheliphorniya','784613','Dhio-0fi','2025-08-28 15:42:56','2025-10-09 10:30:11','Active',5001.00,5000.00),(10,'Niyati','Parihar','gxhahx','gvgxbhbxb','vggaxvsxb','xbnxsbxbsj','23456723456','234567834567','2025-08-30 05:25:04','2025-10-09 10:30:19','Active',50.00,5000.00),(15,'iPhone 14 Pro','q','q','q','q','q','qa1','KH-78945','2025-10-09 10:22:20','2025-10-09 10:26:29','Active',4999.00,5000.00);
/*!40000 ALTER TABLE `farmers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `purchase_rate` decimal(10,2) DEFAULT NULL,
  `transport_charge` decimal(10,2) DEFAULT NULL,
  `local_transport` decimal(10,2) DEFAULT NULL,
  `packaging_cost` decimal(10,2) DEFAULT NULL,
  `packing_weight` decimal(10,2) DEFAULT NULL,
  `hsn_code` varchar(50) DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `discount_30` decimal(10,2) DEFAULT NULL,
  `discount_25` decimal(10,2) DEFAULT NULL,
  `discount_50` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `gst` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (21,1,'Sharbati wheat','102',38.00,10.00,5.00,1.50,NULL,'10019910',54.50,11.40,9.50,19.00,81.75,'0','2025-09-09 10:37:16','2025-10-08 16:38:11'),(22,1,'Sona moti wheat ','112',52.00,10.00,5.00,1.50,NULL,'10019910',68.50,15.60,13.00,26.00,102.75,'0','2025-09-09 10:37:16','2025-10-08 16:02:35'),(23,1,' Khapli wheat','0',80.00,10.00,5.00,1.50,NULL,'10019910',96.50,24.00,20.00,NULL,144.75,'10','2025-09-09 10:37:16','2025-10-08 12:29:52'),(24,1,'Black wheat','0',52.00,10.00,5.00,1.50,NULL,'10019910',68.50,15.60,13.00,NULL,102.75,'0','2025-09-09 10:37:16','2025-10-08 06:57:26'),(25,2,'Sharbati Flour','0',60.00,10.00,5.00,1.50,NULL,'11010000',76.50,18.00,15.00,NULL,114.75,'0','2025-09-09 10:37:16','2025-10-08 07:26:35'),(26,2,'Khapli flour','0',100.00,10.00,5.00,1.50,NULL,'11010000',116.50,30.00,25.00,NULL,174.75,'0','2025-09-09 10:37:16','2025-10-08 07:26:27'),(27,1,' Mill wheat','11',33.00,10.00,5.00,1.50,NULL,'10019910',49.50,9.90,8.25,NULL,74.25,'0','2025-09-09 10:37:16','2025-10-09 12:30:12'),(28,1,'Bansi wheat','0',0.00,10.00,5.00,1.50,NULL,'10019910',16.50,0.00,0.00,NULL,24.75,'0','2025-09-09 10:37:16','2025-10-08 06:57:35'),(29,2,' Bansi flour','0',0.00,10.00,5.00,1.50,NULL,'11010000',16.50,0.00,0.00,NULL,24.75,'0','2025-09-09 10:37:16','2025-10-08 07:26:15'),(30,2,'Sonamoti','2',80.00,10.00,5.00,1.50,NULL,'11010000',96.50,24.00,20.00,NULL,144.75,'0','2025-09-09 10:37:16','2025-10-09 18:07:36'),(31,2,'Multimillet\'s flour','0',110.00,10.00,5.00,1.50,NULL,'11029029',126.50,33.00,27.50,NULL,189.75,'0','2025-09-09 10:37:16','2025-10-08 07:26:31'),(32,2,' Multigrains flour','0',100.00,10.00,5.00,1.50,NULL,'11042900',116.50,30.00,25.00,NULL,174.75,'0','2025-09-09 10:37:16','2025-10-08 07:26:21'),(33,2,'Jowar flour','105',93.00,10.00,5.00,1.50,NULL,' 1E+07',109.50,27.90,23.25,NULL,164.25,'0','2025-09-09 10:37:16','2025-10-09 05:47:14'),(34,2,'Bajra flour','100',76.00,10.00,5.00,1.50,NULL,'1E+07',92.50,22.80,19.00,NULL,138.75,'0','2025-09-09 10:37:16','2025-09-09 10:37:16'),(35,2,'Ragi flour','100',76.00,10.00,5.00,1.50,NULL,'1E+07',92.50,22.80,19.00,NULL,138.75,'0','2025-09-09 10:37:16','2025-09-09 10:37:16'),(36,3,'Jowar whole','100',52.00,10.00,5.00,1.50,NULL,' 1E+07',68.50,15.60,13.00,NULL,102.75,'0','2025-09-09 10:37:16','2025-09-09 10:37:16'),(37,3,'Bajra','100',45.00,10.00,5.00,1.50,NULL,'1E+07',61.50,13.50,11.25,NULL,92.25,'0','2025-09-09 10:38:28','2025-09-09 10:38:28'),(38,3,'Ragi','100',70.00,10.00,5.00,1.50,NULL,'1E+07',86.50,21.00,17.50,NULL,129.75,'0','2025-09-09 10:40:41','2025-09-09 10:40:41'),(39,3,'Kodo','100',80.00,10.00,5.00,1.50,NULL,' 1E+07',96.50,24.00,20.00,NULL,144.75,'0','2025-09-09 10:41:02','2025-09-09 10:41:02'),(40,3,'Kutki','100',90.00,10.00,5.00,1.50,NULL,'1E+07',106.50,27.00,22.50,NULL,159.75,'0','2025-09-09 10:41:23','2025-09-09 10:41:23'),(41,3,'Barnyard','100',85.00,10.00,5.00,1.50,NULL,' 1E+07',101.50,25.50,21.25,NULL,152.25,'0','2025-09-09 10:41:56','2025-09-09 10:41:56'),(42,3,'Browntop','100',165.00,10.00,5.00,1.50,NULL,'1E+07',181.50,49.50,41.25,NULL,272.25,'0','2025-09-09 10:44:53','2025-09-09 10:44:53'),(43,3,'Foxtail','100',80.00,10.00,5.00,1.50,NULL,' 1E+07',96.50,24.00,20.00,NULL,144.75,'0','2025-09-09 10:45:30','2025-09-09 10:45:30'),(44,5,' Tuar dal','101',135.00,10.00,5.00,1.50,NULL,'1E+07',151.50,40.50,33.75,NULL,227.25,'0','2025-09-09 10:47:23','2025-10-08 15:59:34'),(46,9,'s','863',5.00,10.00,5.00,1.50,NULL,'1',17.50,0.30,0.25,NULL,26.51,'1','2025-09-15 05:11:51','2025-10-09 06:40:06'),(48,5,'Chana Dal ','',45.00,10.00,5.00,1.50,NULL,'',61.50,13.50,11.25,NULL,92.25,'12','2025-10-08 12:23:12','2025-10-08 12:23:12'),(49,18,'p1','16',3.50,10.00,5.00,1.50,NULL,'',20.00,6.00,5.00,NULL,30.00,'2','2025-10-09 02:08:42','2025-10-10 05:30:41'),(50,18,'p2','500',317.00,10.00,5.00,1.50,NULL,'asdfghjkl',333.50,95.10,79.25,NULL,500.25,'5','2025-10-09 02:09:33','2025-10-09 02:11:24'),(51,18,'p3','4999',1317.00,10.00,5.00,1.50,NULL,'dfghjk',1333.50,395.10,329.25,NULL,2000.25,'12','2025-10-09 02:11:00','2025-10-09 12:36:04'),(52,3,'srq','1010',83.50,10.00,5.00,1.50,NULL,'srq123',100.00,25.05,20.88,NULL,150.00,'12','2025-10-09 05:01:10','2025-10-10 05:51:45');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productssssss`
--

DROP TABLE IF EXISTS `productssssss`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productssssss` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `bill_rate` decimal(10,2) DEFAULT NULL,
  `transport_charge` decimal(10,2) DEFAULT NULL,
  `local_transport` decimal(10,2) DEFAULT NULL,
  `packaging_cost` decimal(10,2) DEFAULT NULL,
  `packing_weight` decimal(10,2) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `discount_30` decimal(10,2) DEFAULT NULL,
  `discount_25` decimal(10,2) DEFAULT NULL,
  `discount_50` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `gst` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `productssssss_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productssssss`
--

LOCK TABLES `productssssss` WRITE;
/*!40000 ALTER TABLE `productssssss` DISABLE KEYS */;
INSERT INTO `productssssss` VALUES (1,1,'Sharbati Wheat',38.00,10.00,5.00,1.50,1.00,'10019910',54.50,0.00,0.00,0.00,66.00,'NIL','2025-09-03 10:16:24');
/*!40000 ALTER TABLE `productssssss` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `product_id` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `size` decimal(10,2) NOT NULL,
  `unit` enum('KG','GM','PCS','LTR') DEFAULT 'PCS',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total` decimal(10,2) GENERATED ALWAYS AS ((`rate` * `size`)) STORED,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `rate`, `size`, `unit`, `status`, `created_at`, `updated_at`) VALUES (3,3,21,100.00,2.00,'PCS','Active','2025-10-06 07:57:03','2025-10-06 07:57:03'),(4,3,22,50.00,5.00,'KG','Active','2025-10-06 07:57:03','2025-10-06 07:57:03'),(5,4,21,100.00,2.00,'PCS','Active','2025-10-06 09:27:01','2025-10-06 09:27:01'),(6,4,22,50.00,5.00,'KG','Active','2025-10-06 09:27:01','2025-10-06 09:27:01'),(7,7,22,52.00,1.00,'PCS','Active','2025-10-06 11:49:36','2025-10-06 11:49:36'),(8,8,23,80.00,1.00,'PCS','Active','2025-10-06 12:10:16','2025-10-06 12:10:16'),(9,9,24,52.00,10.00,'PCS','Active','2025-10-06 12:33:06','2025-10-06 12:33:06'),(10,10,26,100.00,1.00,'PCS','Active','2025-10-07 04:47:23','2025-10-07 04:47:23'),(12,11,24,52.00,50.00,'PCS','Active','2025-10-08 06:56:29','2025-10-08 06:56:29'),(18,13,46,1.00,500.00,'PCS','Active','2025-10-08 07:02:09','2025-10-08 07:02:09'),(21,14,27,33.00,11.00,'PCS','Active','2025-10-08 09:43:21','2025-10-08 09:43:21'),(22,15,46,10.00,1.00,'PCS','Active','2025-10-08 09:59:27','2025-10-08 09:59:27'),(23,16,46,10.00,1.00,'PCS','Active','2025-10-08 10:00:02','2025-10-08 10:00:02'),(24,17,46,10.00,1.00,'PCS','Active','2025-10-08 10:02:34','2025-10-08 10:02:34'),(25,18,46,100000.00,1.00,'PCS','Active','2025-10-08 10:23:02','2025-10-08 10:23:02'),(26,19,46,5.00,10.00,'PCS','Active','2025-10-08 10:24:46','2025-10-08 10:24:46'),(27,20,44,135.00,1.00,'PCS','Active','2025-10-08 15:59:34','2025-10-08 15:59:34'),(29,21,22,52.00,1.00,'PCS','Active','2025-10-08 16:02:35','2025-10-08 16:02:35'),(31,22,27,33.00,2.00,'PCS','Active','2025-10-09 05:47:14','2025-10-09 05:47:14'),(32,22,30,80.00,3.00,'PCS','Active','2025-10-09 05:47:14','2025-10-09 05:47:14'),(33,22,33,93.00,5.00,'PCS','Active','2025-10-09 05:47:14','2025-10-09 05:47:14'),(34,12,46,5.00,500.00,'PCS','Active','2025-10-09 06:40:06','2025-10-09 06:40:06'),(35,23,52,83.50,10.00,'PCS','Active','2025-10-10 05:51:45','2025-10-10 05:51:45');
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `gst_no` varchar(50) DEFAULT NULL,
  `bill_no` varchar(50) NOT NULL,
  `bill_date` date NOT NULL,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (3,6,'27ABCDE1234F1Z5','BILL001','2025-10-06',450.00,'Active','2025-10-06 07:57:03','2025-10-06 07:57:03'),(4,6,'27ABCDE1234F1Z5','BILL001','2025-10-06',450.00,'Active','2025-10-06 09:27:01','2025-10-06 09:27:01'),(7,11,'22222222222','BILL-1011','2025-10-06',52.00,'Active','2025-10-06 11:49:36','2025-10-06 11:49:36'),(8,6,'22222222222','BILL-1007','2025-10-06',80.00,'Active','2025-10-06 12:10:16','2025-10-06 12:10:16'),(9,12,'KHDIHIT5854848','BILL-1012','2025-10-06',520.00,'Active','2025-10-06 12:33:06','2025-10-06 12:33:06'),(10,67,'458525125','BILL-1007','2025-10-07',100.00,'Active','2025-10-07 04:47:23','2025-10-07 04:47:23'),(11,11,'TDTCVHUG55569494','BILL-1050','2025-10-07',676.00,'Active','2025-10-08 06:54:05','2025-10-08 06:56:28'),(12,11,'TDTCVHUG55569494','BILL-10030','2025-10-05',500.00,'Active','2025-10-08 06:58:50','2025-10-09 06:40:06'),(13,12,'KHDIHIT5854848','BILL-1005','2025-10-06',10.00,'Active','2025-10-08 07:01:11','2025-10-08 07:02:09'),(14,67,'458525125','qqqqqqq','2025-10-07',34.00,'Active','2025-10-08 09:42:28','2025-10-08 09:43:21'),(15,11,'TDTCVHUG55569494','BILL-1004','2025-10-08',10.00,'Active','2025-10-08 09:59:27','2025-10-08 09:59:27'),(16,11,'TDTCVHUG55569494','BILL-1004','2025-10-08',10.00,'Active','2025-10-08 10:00:02','2025-10-08 10:00:02'),(17,6,'22222222222','BILL-1007','2025-10-08',10.00,'Active','2025-10-08 10:02:34','2025-10-08 10:02:34'),(18,6,'22222222222','BILL-1007','2025-10-08',100000.00,'Active','2025-10-08 10:23:02','2025-10-08 10:23:02'),(19,11,'TDTCVHUG55569494','','2025-10-08',50.00,'Active','2025-10-08 10:24:46','2025-10-08 10:24:46'),(20,11,'TDTCVHUG55569494','BILL-1012','2025-10-08',135.00,'Active','2025-10-08 15:59:34','2025-10-08 15:59:34'),(21,65,'29ABCDE1234F1Z5','BILL-10050','2025-10-07',52.00,'Active','2025-10-08 16:02:20','2025-10-08 16:02:35'),(22,6,'22222222222','BILL-100','2025-10-09',33.00,'Active','2025-10-09 05:43:51','2025-10-09 05:43:51'),(23,6,'22222222222','BILL-1003','2025-10-10',835.00,'Active','2025-10-10 05:51:45','2025-10-10 05:51:45');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `discount_rate` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `taxable_amount` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(5,2) DEFAULT '0.00',
  `gst_amount` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `unit` enum('KG','GM','PCS','LTR') DEFAULT 'PCS',
  `total` decimal(10,2) GENERATED ALWAYS AS (round((((coalesce(`rate`,0) * coalesce(`qty`,0)) - coalesce(`discount_amount`,0)) + coalesce(`gst_amount`,0)),2)) STORED,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sale_items_sale` (`sale_id`),
  KEY `idx_sale_items_product` (`product_id`),
  CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `rate`, `qty`, `discount_rate`, `discount_amount`, `taxable_amount`, `gst_percent`, `gst_amount`, `net_total`, `unit`, `status`, `created_at`, `updated_at`) VALUES (40,5,44,10.00,1.00,3.00,0.30,9.70,2.00,0.19,9.89,'PCS','Active','2025-10-07 12:40:34','2025-10-07 12:40:34'),(41,5,34,20.00,10.00,2.00,4.00,196.00,2.00,3.92,199.92,'PCS','Active','2025-10-07 12:40:34','2025-10-07 12:40:34'),(42,6,23,25.00,1.00,18.00,4.50,20.50,21.00,4.31,24.81,'PCS','Active','2025-10-07 12:42:56','2025-10-07 12:42:56'),(43,6,25,21.00,1.00,10.00,2.10,18.90,12.00,2.27,21.17,'PCS','Active','2025-10-07 12:42:56','2025-10-07 12:42:56'),(49,7,21,10.00,1.00,20.00,2.00,8.00,0.00,0.00,8.00,'PCS','Active','2025-10-08 07:28:41','2025-10-08 07:28:41'),(50,7,27,9.00,1.00,0.00,0.00,9.00,0.00,0.00,9.00,'PCS','Active','2025-10-08 07:28:42','2025-10-08 07:28:42'),(51,7,46,10.00,1.00,0.00,0.00,10.00,0.00,0.00,10.00,'PCS','Active','2025-10-08 07:28:42','2025-10-08 07:28:42'),(53,8,46,26.51,10.00,0.00,0.00,265.10,1.00,2.65,267.75,'PCS','Active','2025-10-08 08:52:11','2025-10-08 08:52:11'),(60,11,21,81.75,2.00,1.00,1.64,161.87,0.00,0.00,161.87,'PCS','Active','2025-10-08 16:38:11','2025-10-08 16:38:11'),(62,13,27,111.38,1.00,0.00,0.00,111.38,0.00,0.00,111.38,'PCS','Active','2025-10-09 12:30:12','2025-10-09 12:30:12'),(63,14,51,3000.38,1.00,0.00,0.00,3000.38,12.00,360.05,3360.42,'PCS','Active','2025-10-09 12:36:04','2025-10-09 12:36:04'),(64,15,49,750.38,1.00,0.00,0.00,750.38,2.00,15.01,765.38,'PCS','Active','2025-10-09 12:52:59','2025-10-09 12:52:59'),(65,16,30,217.13,1.00,0.00,0.00,217.13,0.00,0.00,217.13,'PCS','Active','2025-10-09 18:07:36','2025-10-09 18:07:36'),(66,17,49,45.00,1.00,0.00,0.00,45.00,2.00,0.90,45.90,'PCS','Active','2025-10-09 18:10:50','2025-10-09 18:10:50'),(67,18,49,45.00,1.00,0.00,0.00,45.00,2.00,0.90,45.90,'PCS','Active','2025-10-09 18:26:06','2025-10-09 18:26:06'),(68,19,49,45.00,1.00,0.00,0.00,45.00,2.00,0.90,45.90,'PCS','Active','2025-10-10 05:30:41','2025-10-10 05:30:41');
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_payments`
--

DROP TABLE IF EXISTS `sale_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('Cash','Card','Online','Credit Card','UPI') DEFAULT 'Cash',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_sale` (`sale_id`),
  KEY `idx_payments_customer` (`customer_id`),
  KEY `idx_payments_customer_paydate` (`customer_id`,`payment_date`),
  KEY `idx_payments_created_at` (`created_at`),
  CONSTRAINT `fk_sale_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sale_payments_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_payments`
--

LOCK TABLES `sale_payments` WRITE;
/*!40000 ALTER TABLE `sale_payments` DISABLE KEYS */;
INSERT INTO `sale_payments` VALUES (1,14,10,'2025-10-09',200.00,'Cash',NULL,'2025-10-09 12:36:04'),(2,16,1,'2025-10-09',396.13,'Cash',NULL,'2025-10-09 18:07:36'),(3,17,10,'2025-10-09',3925.80,'Cash',NULL,'2025-10-09 18:10:50'),(4,18,1,'2025-10-09',250.00,'Cash',NULL,'2025-10-09 18:26:06'),(5,19,1,'2025-10-10',58.00,'Cash',NULL,'2025-10-10 05:30:41');
/*!40000 ALTER TABLE `sale_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `bill_no` varchar(50) NOT NULL,
  `bill_date` date NOT NULL,
  `total_taxable` decimal(10,2) DEFAULT '0.00',
  `total_gst` decimal(10,2) DEFAULT '0.00',
  `payment_status` enum('Paid','Unpaid','Partial') DEFAULT 'Unpaid',
  `payment_method` enum('Cash','Card','Online','Credit Card','UPI') DEFAULT 'Cash',
  `remarks` text,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sales_bill_no` (`bill_no`),
  KEY `idx_sales_customer` (`customer_id`),
  KEY `idx_sales_bill_date` (`bill_date`),
  KEY `idx_sales_customer_billdate` (`customer_id`,`bill_date`),
  KEY `idx_sales_created_at` (`created_at`),
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (5,6,'BILL-001','2025-09-28',30.00,0.00,'Paid','Credit Card','',30.00,'Active','2025-10-07 12:06:02','2025-10-07 12:40:34'),(6,5,'BILL-002','2025-10-07',39.40,6.57,'Paid','UPI','',45.97,'Active','2025-10-07 12:42:56','2025-10-07 12:42:56'),(7,1,'BILL-003','2025-10-05',17.00,0.00,'Paid','UPI','',17.00,'Active','2025-10-07 15:22:20','2025-10-08 07:28:42'),(8,1,'BILL-004','2025-10-07',265.10,2.65,'Paid','UPI','',267.75,'Active','2025-10-08 08:51:13','2025-10-08 08:52:11'),(11,5,'BILL-005','2025-10-05',161.87,0.00,'Paid','UPI','',161.87,'Active','2025-10-08 16:11:32','2025-10-08 16:38:11'),(13,1,'BILL-006','2025-10-09',111.38,0.00,'Unpaid','Cash','',111.38,'Active','2025-10-09 12:30:12','2025-10-09 12:30:12'),(14,10,'BILL-007','2025-10-09',3000.38,360.05,'Partial','Cash','',3360.42,'Active','2025-10-09 12:36:04','2025-10-09 12:36:04'),(15,10,'BILL-008','2025-10-09',750.38,15.01,'Unpaid','Cash','',765.38,'Active','2025-10-09 12:52:59','2025-10-09 12:52:59'),(16,1,'BILL-009','2025-10-09',217.13,0.00,'Partial','Cash','',217.13,'Active','2025-10-09 18:07:36','2025-10-09 18:07:36'),(17,10,'BILL-010','2025-10-09',45.00,0.90,'Partial','Cash','',45.90,'Active','2025-10-09 18:10:50','2025-10-09 18:10:50'),(18,1,'BILL-011','2025-10-09',45.00,0.90,'Partial','Cash','',45.90,'Active','2025-10-09 18:26:06','2025-10-09 18:26:06'),(19,1,'BILL-012','2025-10-10',45.00,0.90,'Partial','Cash','',45.90,'Active','2025-10-10 05:30:41','2025-10-10 05:30:41');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_bank_details`
--

DROP TABLE IF EXISTS `vendor_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(30) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendor_bank_details_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_bank_details`
--

LOCK TABLES `vendor_bank_details` WRITE;
/*!40000 ALTER TABLE `vendor_bank_details` DISABLE KEYS */;
INSERT INTO `vendor_bank_details` VALUES (5,6,'jhhtrsdzxvvhjkm','Test','test','234','Test','Test','2025-08-27 11:29:04','2025-09-15 09:19:40'),(7,11,'JIHIR548494N','Dhiraj bhia MBBS','Bank of India','1800300015','SBIN0002020','USA','2025-08-28 02:52:25','2025-10-06 11:13:06'),(8,12,'JHIHIEB629','q','State Bank of Indiaaaaaaaaaaaaa','123456789012','BOI015234BOI','3','2025-08-28 02:54:30','2025-10-06 11:13:30'),(9,13,'JIHIR548494N','Dhiraj bhia MBBS','Bank of India','123456789012','SBIN0001234','3','2025-08-28 04:41:01','2025-10-06 11:14:03'),(40,64,'JHIHIEB629','Mahendra','SBI','1111111111111','SBIN0002020','Seoni','2025-09-14 08:41:20','2025-10-06 11:14:38'),(41,65,'ABCDE1234F','Amit Kumar Updated','ICICI Bank','987654321098','ICIC0005678','Nehru Place','2025-10-03 06:28:01','2025-10-03 06:29:38'),(42,67,'12fghf335654','Arvind','SBI','123456789012','SBIN0001234','Chourai','2025-10-07 04:47:06','2025-10-09 09:32:41');
/*!40000 ALTER TABLE `vendor_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(100) DEFAULT NULL,
  `firm_name` varchar(255) NOT NULL,
  `gst_no` varchar(50) NOT NULL,
  `address` text,
  `contact_number` varchar(15) DEFAULT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `min_balance` decimal(12,2) NOT NULL DEFAULT '5000.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gst_no` (`gst_no`),
  KEY `idx_vendors_balance` (`balance`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (6,'NItya','Nitya mam ','22222222222','Bhopal, MP Nagar','222222222',0.00,5000.00,'2025-08-27 11:29:04','2025-10-09 09:23:42','active'),(11,'Dhiraj','Dhiraj','TDTCVHUG55569494','Seoni,Madhaya Pradesh','6262090975',0.00,5000.00,'2025-08-28 02:52:24','2025-10-06 11:13:06','active'),(12,'Aman','Aman','KHDIHIT5854848','Chhindwara, Madhaya Pradesh','896374563',0.00,5000.00,'2025-08-28 02:54:30','2025-10-06 17:08:33','active'),(13,'Shiddhant ','Shiddhant ','HINVIBHOI4848','Bhopal , mp','1234567890',0.00,5000.00,'2025-08-28 04:41:01','2025-10-06 17:08:35','active'),(64,'Shiddhant ','Shiddhant ','HITBDKD','Bhopal','1234567890',0.00,5000.00,'2025-09-14 08:41:20','2025-10-06 11:14:38','active'),(65,'Amit Kumar Updated','Amit Traders Pvt Ltd','29ABCDE1234F1Z5','456 New Street, Delhi','9876543210',0.00,5000.00,'2025-10-03 06:28:01','2025-10-09 09:33:08','active'),(67,'Arvind','Arvind pvt ltd','458525125','Balaghat','123456789',10.99,5000.00,'2025-10-07 04:47:06','2025-10-09 09:33:00','active');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10 11:35:59
