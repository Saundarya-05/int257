# P24 – Is This Internship Real? (Module 1, Step 1: Backend)

## Run
    npm install
    npm run dev

Edit `.env.local` first if you use MongoDB Atlas. Then open http://localhost:3000/api/internships

## Test create
    curl -X POST http://localhost:3000/api/internships -H "Content-Type: application/json" -d '{"companyName":"Acme Tech","role":"Frontend Intern","description":"Work with our team to build React interfaces and learn modern tooling.","stipend":8000,"location":"Pune","workMode":"hybrid","durationMonths":3,"skills":["React","CSS"],"applicationLink":"https://acme.example.com/careers/frontend","companyWebsite":"https://acme.example.com","contactEmail":"hr@acme.example.com","registrationFee":0}'

## Temporary stubs (replace by owners, keep function names)
- src/modules/verification/services/verificationService.js  (Module 2)
- src/modules/experiences/services/experienceService.js     (Module 3)
