FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api ./cmd/api

FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata wget

ENV TZ=Asia/Jakarta

WORKDIR /app

COPY --from=builder /api .

EXPOSE 8080

CMD ["./api"]
