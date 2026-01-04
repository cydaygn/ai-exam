
# AI Exam — Yapay Zeka Destekli Sınav Hazırlık ve Analiz Uygulaması

## Özellikler  
- Yapay zekâ ile otomatik soru üretimi (Groq API)  
- Açıklamalı geri bildirim ve performans analizi  
- Gerçek zamanlı sınav sonuçları  
- JWT tabanlı güvenli kimlik doğrulama  
- Öğrenci ve admin panelleri  
- Modern, hızlı ve responsive kullanıcı arayüzü  
- MySQL tabanlı veri yönetimi  
- Railway & Vercel üzerinde dağıtım

##  Proje Mimarisi

```bash
ai-exam/
├── backend/
│   ├── routes/
│   │   ├── auth.js      # Authentication
│   │   ├── user.js      # User operations
│   │   ├── admin.js     # Admin operations
│   │   └── ai.js        # AI endpoints
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── pages/       # UI pages
│   │   ├── layout/      # Admin / Student layouts
│   │   └── App.jsx
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
````

## Teknolojiler

### Frontend  
- React  
- Vite  
- Tailwind CSS  
 

### Backend  
- Node.js  
- Express.js  
- MySQL  
- JWT Authentication  
- Groq API (değerlendirme)

### Dağıtım  
- Frontend: Vercel  
- Backend: Railway

#### Giriş Sayfası
<img width="1143" height="593" alt="image" src="https://github.com/user-attachments/assets/0641a587-da33-435b-a500-b01a4a941cdf" />


#### AI  Assistant
Öğrencilerin sınav sürecinde rehberlik almasını sağlar:
- Son sınavların analiz edilmesi  
- Hangi konuya çalışılması gerektiğine dair öneriler  
- Kişiye özel çalışma planları
- 
<img width="600" height="811" alt="image" src="https://github.com/user-attachments/assets/83917a3d-c543-4ad5-887b-92b1fbd5b0d7" />

#### Performans Analizi

Bu panel, öğrencinin gelişimini görsel olarak takip etmeyi sağlar:
- Haftalık başarı trendleri  
- Tamamlanan deneme sayıları  
- Günlük hedef takibi  
- Grafikler ile detaylı analiz
- 
<img width="600" height="550" alt="image" src="https://github.com/user-attachments/assets/2c985904-26c3-4059-8683-e916ab44477e" />

## Proje Amacı  
Bu proje,
yapay zekâ destekli eğitim sistemleri, öğrenci performans analizi ve modern full-stack web geliştirme konularını bir araya getiren bir uygulamadır.

## Kurulum
### 1- Repoyu klonla

git clone https://github.com/cydaygn/ai-exam.git

cd ai-exam

### 2️- Backend’i çalıştır

cd backend

npm install

npm run dev

### 3️- Frontend’i çalıştır

cd frontend

npm install

npm run dev
