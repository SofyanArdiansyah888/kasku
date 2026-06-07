package jwt

import (
	"errors"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Klaim struct {
	PenggunaID uuid.UUID `json:"penggunaId"`
	Email      string    `json:"email"`
	jwtlib.RegisteredClaims
}

type Layanan struct {
	rahasia string
	expiry  time.Duration
}

func Baru(rahasia string, expiry time.Duration) *Layanan {
	return &Layanan{rahasia: rahasia, expiry: expiry}
}

func (l *Layanan) BuatToken(penggunaID uuid.UUID, email string) (string, error) {
	klaim := Klaim{
		PenggunaID: penggunaID,
		Email:      email,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(time.Now().Add(l.expiry)),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
		},
	}
	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, klaim)
	return token.SignedString([]byte(l.rahasia))
}

func (l *Layanan) Verifikasi(tokenStr string) (*Klaim, error) {
	token, err := jwtlib.ParseWithClaims(tokenStr, &Klaim{}, func(t *jwtlib.Token) (interface{}, error) {
		return []byte(l.rahasia), nil
	})
	if err != nil {
		return nil, err
	}
	klaim, ok := token.Claims.(*Klaim)
	if !ok || !token.Valid {
		return nil, errors.New("token tidak valid")
	}
	return klaim, nil
}
