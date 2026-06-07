package konfigurasi

import (
	"os"
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
		DBPassword: getEnv("DB_PASSWORD", getEnv("POSTGRES_PASSWORD", "kasku")),
		DBName:     getEnv("DB_NAME", "kasku"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		JWTSecret:  getEnv("JWT_SECRET", "rahasia-dev"),
		JWTExpiry:  expiry,
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
