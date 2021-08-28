CREATE DATABASE IF NOT EXISTS `sharex`;

USE `sharex`;

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token_user` varchar(36) NOT NULL,
  `token_value` varchar(36) NOT NULL,
  `token_usage` int(11) NOT NULL,
  `token_revoked` tinyint(4) NOT NULL DEFAULT '0',
  `token_lastused` datetime NOT NULL,
  `token_ip` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `token_id_UNIQUE` (`token_value`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;