<div align="center">

## 🚀 ATS Prism

Your AI-powered resume analyzer.

</div>


**Turn your resume into a stronger job application --- powered by Gemini
AI.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)


**Select a role → Upload your resume → Scan → Improve**
:::

------------------------------------------------------------------------

## 🎯 What is ATS Prism?

ATS Prism is an AI-powered resume analysis tool that helps students,
developers, and job seekers understand how well their resume fits a
target role.

Instead of giving a generic resume review, ATS Prism analyzes the resume
against the **specific role you're targeting** and provides actionable
feedback.

## 🔍 What It Checks

-   📊 **ATS Score** --- overall resume-to-role fit
-   🔑 **Keyword Matching** --- relevant keywords already present
-   ⚠️ **Missing Keywords** --- important keywords to consider adding
-   🧠 **Skills Analysis** --- skills relevant to the target role
-   💪 **Resume Strengths** --- what is already working
-   🛠️ **Weaknesses** --- areas that need improvement
-   🚀 **AI Suggestions** --- practical recommendations

------------------------------------------------------------------------

## ⚡ How It Works

``` text
Select Role 🎯
      ↓
Upload Resume 📄
      ↓
NestJS Backend 🔧
      ↓
Resume Text Extraction
      ↓
Gemini AI 🤖
      ↓
Structured ATS Analysis
      ↓
Score • Keywords • Skills • Suggestions 📊
```

------------------------------------------------------------------------

## ✨ Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  🎯 Role-based analysis              Analyze your resume for the job you
                                      actually want

  📄 Resume upload                    Upload your existing resume

  🤖 Gemini-powered insights          AI-powered role-specific analysis

  📊 ATS scoring                      Easy-to-understand score out of 100

  🔑 Keyword analysis                 Matched and missing role keywords

  🧩 Skill gap analysis               Identify useful missing skills

  💡 Actionable feedback              Specific improvement suggestions

  ⚡ Clean UI                         Focused resume-scanning experience
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🖥️ Preview

Add your screenshot here:

``` md
<img width="2882" height="1662" alt="image" src="https://github.com/user-attachments/assets/aa1ca81e-4514-4965-8023-7675d892460f" />
`

### 🎬 Recommended Demo GIF

Create a 5--10 second GIF showing:

``` text
Choose Role
   ↓
Upload Resume
   ↓
Scan Resume
   ↓
ATS Score Animation
   ↓
Keywords + Suggestions
```

Save it as `assets/ats-prism-demo.gif` and add:

``` md
<img src="./assets/ats-prism-demo.gif" width="850" alt="ATS Prism demo">
```

------------------------------------------------------------------------

## 🏗️ Tech Stack

**Frontend** - Next.js - React - TypeScript - Tailwind CSS

**Backend** - NestJS - TypeScript - REST API - PDF/resume text
processing

**AI** - Google Gemini API - Role-specific resume analysis - Structured
ATS insights

------------------------------------------------------------------------

## 🔐 Environment Variables

Create `backend/.env`:

``` env
GEMINI_API_KEY=your_gemini_api_key_here
```

Never commit your real API key.

Recommended `.gitignore`:

``` gitignore
.env
.env.*
!.env.example
node_modules/
dist/
```

Create `backend/.env.example`:

``` env
GEMINI_API_KEY=your_gemini_api_key_here
```

------------------------------------------------------------------------

## 🚀 Getting Started

### 1. Clone

``` bash
git clone YOUR_REPOSITORY_URL
cd ats-prism
```

### 2. Install frontend

``` bash
cd frontend
npm install
```

### 3. Install backend

``` bash
cd ../backend
npm install
```

### 4. Configure Gemini

Create:

``` text
backend/.env
```

Add your Gemini API key.

### 5. Start backend

``` bash
npm run start:dev
```

### 6. Start frontend

In another terminal:

``` bash
cd frontend
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 📁 Project Structure

``` text
ats-prism/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   ├── resume/
│   │   └── ...
│   ├── .env.example
│   └── ...
│
├── assets/
│   ├── preview.png
│   └── ats-prism-demo.gif
│
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## 🧠 Example Analysis

``` text
TARGET ROLE
Frontend Developer

ATS SCORE
━━━━━━━━━━━━━━━━━━━━━━━
78 / 100

✓ 12 keywords matched
⚠ 4 keywords to improve

MATCHED
✓ React
✓ JavaScript
✓ TypeScript
✓ Git
✓ REST APIs

MISSING
→ Next.js
→ Testing
→ CI/CD
→ Accessibility

AI SUGGESTIONS
→ Add measurable project outcomes
→ Mention Next.js when genuinely relevant
→ Strengthen project descriptions
```

------------------------------------------------------------------------

## 🛣️ Roadmap

-   [x] Resume upload UI
-   [x] Target role selection
-   [x] ATS dashboard UI
-   [x] Gemini API integration
-   [ ] Structured ATS JSON response
-   [ ] Advanced keyword scoring
-   [ ] Job Description upload
-   [ ] Resume ↔ JD matching
-   [ ] User authentication
-   [ ] Resume scan history
-   [ ] Resume improvement mode
-   [ ] Export analysis report
-   [ ] Production deployment

------------------------------------------------------------------------

## 🤝 Contributing

Contributions are welcome!

``` bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

------------------------------------------------------------------------

## ⚠️ Disclaimer

ATS Prism is an **AI-assisted resume analysis tool**. Its score is an
estimate intended to provide useful guidance and is not a guarantee that
a resume will pass a particular company's ATS.

Different ATS platforms and employers may use different screening
methods.

------------------------------------------------------------------------

::: {align="center"}
### 🚀 Build smarter. Apply better.

**ATS Prism**

Built with ❤️ by **True Engineer**

⭐ Star the repository if you find it useful!
:::
