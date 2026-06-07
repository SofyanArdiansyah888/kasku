package konfigurasi

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)
type Konfigurasi struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	JWTSecret  string
	JWTExpiry  time.Duration
	Port       string
	CORSOrigin string
}

func Muat() (*Konfigurasi, error) {
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	expiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	if err != nil {
		expiry = 24 * time.Hour
	}

	return &Konfigurasi{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "kasku"),
		DBPassword: getDBPassword(),
		DBName:     getEnv("DB_NAME", "kasku"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		JWTSecret:  getEnvValue("JWT_SECRET", "rahasia-dev"),		JWTExpiry:  expiry,
		Port:       getEnv("PORT", "8080"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}, nil
}

func (k *Konfigurasi) DSN() string {
	return "host=" + k.DBHost +
		" user=" + k.DBUser +
		" password=" + k.DBPassword +
		" dbname=" + k.DBName +
		" port=" + k.DBPort +
		" sslmode=" + k.DBSSLMode +
		" TimeZone=Asia/Jakarta"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvValue(key, fallback string) string {
	if v := readEnvOrFile("", key, ""); v != "" {
		return v
	}
	return fallback
}

func getDBPassword() string {
	if v := readEnvOrFile("DB_PASSWORD_FILE", "POSTGRES_PASSWORD", "DB_PASSWORD"); v != "" {
		return v
	}
	return "kasku"
}

func readEnvOrFile(fileKey, primaryKey, secondaryKey string) string {
	if fileKey != "" {
		if path := os.Getenv(fileKey); path != "" {
			if b, err := os.ReadFile(path); err == nil {
				return trimEnvValue(string(b))
			}
		}
	}
	if v := trimEnvValue(os.Getenv(primaryKey)); v != "" {
		return v
	}
	if secondaryKey != "" {
		if v := trimEnvValue(os.Getenv(secondaryKey)); v != "" {
			return v
		}
	}
	return ""
}

func trimEnvValue(v string) string {
	return strings.Trim(strings.TrimSpace(v), "'\"")
}