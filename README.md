
# AI-Exam  
Yapay zekâ destekli, kişiselleştirilmiş sınav ve öğrenme platformu.

## Özellikler  
- Yapay zekâ ile otomatik soru üretimi (Gemini API)  
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
- Gemini API (değerlendirme)

### Dağıtım  
- Frontend: Vercel  
- Backend: Railway  
## Proje Amacı  
Bu proje, bir sınav / değerlendirme uygulaması için arka uç (backend) ve ön uç (frontend) bileşenlerini içeriyor. Tam olarak tanımlı değil — README, açıklama veya ana sayfa bulunmuyor — bu nedenle geliştirici yorumu gerekir.

 Kurulum
1- Repoyu klonla
git clone https://github.com/cydaygn/ai-exam.git
cd ai-exam

2️- Backend’i çalıştır
cd backend
npm install
npm run dev

3️- Frontend’i çalıştır
cd frontend
npm install
npm run dev
