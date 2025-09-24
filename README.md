# 🎬 KinoXP  

KinoXP er et semesterprojekt, hvor vi udvikler et IT-system til en mindre biograf, der skal håndtere **reservationer, billetsalg og planlægning af fremtidige forestillinger**.  

## 📌 Projektbeskrivelse  
Biografen har i dag kun telefoniske reservationer, hvilket er besværligt og ineffektivt. Med det nye system kan både kunder og medarbejdere administrere billetter og forestillinger digitalt.  

**Forretningskontekst:**  
- Biografen har 2 sale:  
  - Lille sal: 20 rækker × 12 sæder  
  - Stor sal: 25 rækker × 16 sæder  
- Forestillinger planlægges 3 måneder frem, men programmet kan ændres (fx ekstra forestillinger eller fjernelse af film).  
- Film har forskellige kategorier (Horror, Romance, Action, Sci-Fi osv.) og aldersbegrænsninger.  
- Personalet består af:  
  - 2 medarbejdere (billetter, snacks, reservationer)  
  - 1 operatør (film)  
  - 1 inspektør (billetter & rengøring)  

> Systemet skal designes fleksibelt, så det nemt kan udvides til flere sale, flere rækker/sæder og flere medarbejdere uden store kodeændringer.  

## ⚙️ Teknologi & Projektstruktur  
Vi arbejder agilt efter **Scrum/XP-principper**:  
- **Projektstyring:** Jira (burndown charts, sprint boards, backlog)  
- **Versionkontrol:** GitHub (separate repos til frontend og backend)  
- **Branching strategi:**  
  - Feature branch → `dev` → `qa` → `prod`  
  - Alle merges sker via pull requests & code reviews  
- **Dokumentation & diagrammer:**  
  - Use case diagrammer (user stories)  
  - ER-diagram (datamodel)  
  - UI wireframes (look & feel)  

## 📝 User Stories (eksempler)  
- Som **kunde** vil jeg kunne reservere billetter online, så jeg ikke skal ringe til biografen.  
- Som **medarbejder** vil jeg kunne oprette nye forestillinger, så programmet altid er opdateret.  
- Som **operatør** vil jeg kunne se en oversigt over forestillinger, så jeg kan planlægge mit arbejde.  

## 👥 Team Roller  
- **Product Owner (PO):** Ansvarlig for backlog & prioritering  
- **Scrum Master (SM):** Faciliterer sprint-ritualer, fjerner blockers  
- **Developers (DEV):** Implementering, reviews, tests  
- **DevOps:** Opsætning af miljøer, GitHub, Azure  
- **UX/Design:** Leverer design & wireframes  

## 🚀 Deployment  
Systemet forventes deployet på Azure. Miljøerne opdeles i:  
- **Dev** → udvikling  
- **QA/Test** → kvalitetssikring  
- **Prod** → endeligt produkt  

## 📂 Repo struktur (forslag)  
```
KinoXP/
│── backend/        # Spring Boot / Java
│── frontend/       # HTML, CSS, JS
│── docs/           # Diagrammer, user stories, rapport
│── .github/        # CI/CD workflows
│── README.md
```

## ✅ Mål  
At levere et færdigt system, der gør KinoXP i stand til at:  
- Håndtere reservationer og billetsalg digitalt  
- Administrere programmet fleksibelt  
- Skabe et bedre flow for både kunder og medarbejdere  
