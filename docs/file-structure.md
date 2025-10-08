gratia-api/
├── src/
│ ├── app.ts # Ana uygulama dosyası
│ ├── server.ts # Server başlatma dosyası
│ │
│ ├── config/ # Konfigürasyon dosyaları
│ │ ├── database.ts
│ │ ├── env.ts
│ │ └── index.ts
│ │
│ ├── core/ # Temel altyapı (yeni)
│ │ ├── middleware/
│ │ │ ├── auth.middleware.ts
│ │ │ ├── error.middleware.ts
│ │ │ ├── validation.middleware.ts
│ │ │ ├── async-handler.middleware.ts
│ │ │ └── index.ts
│ │ ├── utils/
│ │ │ ├── logger.ts
│ │ │ ├── constants.ts
│ │ │ ├── response.helper.ts
│ │ │ ├── encryption.helper.ts
│ │ │ ├── jwt.helper.ts
│ │ │ ├── token.helper.ts
│ │ │ ├── errors/
│ │ │ │ ├── base.errors.ts
│ │ │ │ ├── auth.errors.ts
│ │ │ │ ├── user.errors.ts
│ │ │ │ └── index.ts
│ │ │ └── index.ts
│ │ └── types/
│ │ ├── api.types.ts
│ │ └── index.ts
│ │
│ ├── modules/ # Modüler yapı (yeni)
│ │ ├── auth/
│ │ │ ├── controllers/
│ │ │ │ ├── auth.controller.ts
│ │ │ │ └── index.ts
│ │ │ ├── services/
│ │ │ │ ├── auth.service.ts
│ │ │ │ └── index.ts
│ │ │ ├── repositories/
│ │ │ │ ├── auth.repository.ts
│ │ │ │ └── index.ts
│ │ │ ├── dto/
│ │ │ │ ├── auth.dto.ts
│ │ │ │ └── index.ts
│ │ │ ├── mappers/
│ │ │ │ ├── auth.mapper.ts
│ │ │ │ └── index.ts
│ │ │ ├── validation/
│ │ │ │ ├── auth.validation.ts
│ │ │ │ └── index.ts
│ │ │ ├── routes/
│ │ │ │ ├── auth.routes.ts
│ │ │ │ └── index.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── user/ # Gelecekte eklenecek modüller
│ │ │ └── ...
│ │ │
│ │ ├── email/ # Email modülü
│ │ │ ├── services/
│ │ │ │ ├── email.service.ts
│ │ │ │ └── index.ts
│ │ │ ├── repositories/
│ │ │ │ ├── email-verification.repository.ts
│ │ │ │ └── index.ts
│ │ │ └── index.ts
│ │ │
│ │ └── index.ts
│ │
│ ├── shared/ # Paylaşılan kaynaklar (yeni)
│ │ ├── models/
│ │ │ ├── User.ts
│ │ │ ├── EmailVerification.ts
│ │ │ └── index.ts
│ │ ├── interfaces/
│ │ │ ├── auth.interface.ts
│ │ │ ├── user.interface.ts
│ │ │ └── index.ts
│ │ └── constants/
│ │ ├── api.constants.ts
│ │ └── index.ts
│ │
│ └── routes/ # Ana route yöneticisi
│ ├── index.ts
│ └── v1/ # API versiyonlama
│ ├── auth.routes.ts
│ └── index.ts
│
├── tests/ # Test dosyaları (yeni)
│ ├── unit/
│ ├── integration/
│ └── fixtures/
│
├── docs/ # Dokümantasyon
│ ├── api/
│ ├── architecture/
│ └── deployment/
│
├── scripts/ # Yardımcı scriptler (yeni)
│ ├── seed.ts
│ ├── migrate.ts
│ └── build.ts
│
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js # Test konfigürasyonu (yeni)
├── docker-compose.yml # Docker desteği (yeni)
├── Dockerfile # Docker desteği (yeni)
└── README.md
