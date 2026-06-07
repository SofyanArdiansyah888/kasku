package hash

import "golang.org/x/crypto/bcrypt"

func Enkripsi(kataSandi string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(kataSandi), bcrypt.DefaultCost)
	return string(bytes), err
}

func Verifikasi(kataSandi, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(kataSandi)) == nil
}
