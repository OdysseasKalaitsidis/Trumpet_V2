-- Trumpet MySQL 8 Schema
-- Case-preserving table/column names (MySQL is case-insensitive on Linux)
CREATE DATABASE IF NOT EXISTS trumpet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trumpet;

CREATE TABLE IF NOT EXISTS Communities (
  Id              VARCHAR(255) PRIMARY KEY,
  Name            VARCHAR(500) NOT NULL DEFAULT '',
  Handle          VARCHAR(255) NOT NULL DEFAULT '',
  IntroductoryText TEXT,
  ParentCommunityId VARCHAR(255),
  FOREIGN KEY (ParentCommunityId) REFERENCES Communities(Id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Collections (
  Id              VARCHAR(255) PRIMARY KEY,
  Name            VARCHAR(500) NOT NULL DEFAULT '',
  Handle          VARCHAR(255) NOT NULL DEFAULT '',
  IntroductoryText TEXT,
  ParentCommunityId VARCHAR(255),
  FOREIGN KEY (ParentCommunityId) REFERENCES Communities(Id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Items (
  Id              VARCHAR(255) PRIMARY KEY,
  Name            VARCHAR(500) NOT NULL DEFAULT '',
  Handle          VARCHAR(255) NOT NULL DEFAULT '',
  LastModified    DATETIME,
  Withdrawn       TINYINT(1) NOT NULL DEFAULT 0,
  Archived        TINYINT(1) NOT NULL DEFAULT 0,
  CollectionId    VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (CollectionId) REFERENCES Collections(Id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MetadataValues (
  Id       INT AUTO_INCREMENT PRIMARY KEY,
  ItemId   VARCHAR(255) NOT NULL DEFAULT '',
  `Field`  VARCHAR(255) NOT NULL DEFAULT '',
  `Value`  TEXT,
  Language VARCHAR(20),
  FOREIGN KEY (ItemId) REFERENCES Items(Id),
  INDEX idx_meta_field (`Field`),
  INDEX idx_meta_itemid (ItemId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Bitstreams (
  Id            VARCHAR(255) PRIMARY KEY,
  ItemId        VARCHAR(255) NOT NULL DEFAULT '',
  Name          VARCHAR(500) NOT NULL DEFAULT '',
  MimeType      VARCHAR(255),
  SizeBytes     BIGINT NOT NULL DEFAULT 0,
  LocalFilePath VARCHAR(1000) NOT NULL DEFAULT '',
  FOREIGN KEY (ItemId) REFERENCES Items(Id)
) ENGINE=InnoDB;
