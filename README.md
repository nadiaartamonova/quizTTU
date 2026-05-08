# quizTTU
# QuizTTU 

Mobiilirakendus (React Native + Expo), kus kasutaja saab läbida viktoriini, laadides küsimused Open Trivia DB API kaudu.  
Rakenduses on küsimuste filtrid (kategooria, raskus, küsimuse tüüp), taimer, tulemuste vaade, leaderboard ja SQLite-põhine tulemuste salvestus.

---

## 1) Projekti kirjeldus

See projekt on praktiline töö teemal **React Native viktoriinirakendus**.

Rakendus võimaldab:
- valida mängija nime,
- valida küsimuste kategooria,
- valida raskusaste,
- valida küsimuse tüüp (multiple / true-false / any),
- läbida viktoriini küsimus-küsimuse haaval taimeriga,
- näha tulemusi (score, protsent, aeg),
- vaadata leaderboard’i (Top 5 + viimased mängud),
- salvestada tulemused lokaalsesse SQLite andmebaasi.

---

## 2) Kasutatud tehnoloogiad

- **React Native**
- **Expo**
- **TypeScript**
- **expo-sqlite**
- **Open Trivia DB API**  
  https://opentdb.com/api_config.php

---

## 3) Funktsionaalsus 

### Küsimuste laadimine (Trivia API)
- Küsimused laetakse Open Trivia DB API-st.
- Rakendus saadab API-sse parameetrid:
  - `category`
  - `difficulty`
  - `type`
  - küsimuste kogus (`amount`)

### Kasutaja valikud enne mängu
- Mängija nimi (`playerName`)
- Kategooria (`Category`)
- Raskus (`easy / medium / hard`)
- Küsimuse tüüp (`any / multiple / boolean`)

### Quiz loogika
- Küsimused kuvatakse ükshaaval.
- Kasutaja valib vastuse ja liigub järgmise küsimuse juurde.
- Pärast viimast küsimust kuvatakse tulemused:
  - õigete vastuste arv
  - protsent
  - kestus sekundites
- Võimalik on:
  - alustada uuesti (`Start again`)
  - minna peamenüüsse (`Main menu`)

### Taimer
- Iga küsimuse jaoks on ajapiirang.
- Kuvatakse ka visuaalne progress bar.

### Tulemused + Leaderboard
- **Best result**
- **Leaderboard (Top 5)**
- **Last games**

### SQLite andmebaas
Tulemused salvestatakse tabelisse `results`.

Salvestatavad väljad:
- `userName` — mängija nimi
- `score` — õigete vastuste arv
- `total` — küsimuste koguarv
- `percentage` — edukuse protsent
- `playedAt` — kuupäev ja kellaaeg (ISO)
- `durationSec` — testi kestus sekundites
- `questionCount` — küsimuste arv
- `correctAnswers` — õiged vastused
- `wrongAnswers` — valed vastused
- `categoryName` — valitud kategooria
- `difficulty` — valitud raskus
- `questionType` — valitud küsimuse tüüp
- `answersJson` — vastuste detailne ajalugu JSON kujul

---

## 4) Käivitamise juhend

## Eeldused
- Node.js (LTS soovitatav)
- npm või yarn
- Expo Go (telefonis) või Android/iOS emulator

## Install
```bash
npm install
```
## Käivita projekt
```bash
npx expo start
```
Seejärel:

- vajuta a (Android emulator),
- või i (iOS simulator, macOS),
- või skaneeri QR Expo Go rakendusega.

## 5) Projekti struktuur (lihtsustatud)
```bash
.
├── App.tsx
├── constants/
│   └── quiz.ts
│   └── categories.ts
├── database/
│   └── db.ts
├── mappers/
│   └── triviaMappers.ts
├── repositories/
│   └── quizRepository.ts
│   └── SQLLiteRepository.ts
├── screens/
│   ├── MainScreen.tsx
│   ├── QuizScreen.tsx
│   ├── ErrorScreen.tsx
│   └── ResultScreen.tsx
├── services/
│   └── triviaApi.ts
├── usecases/
│   └── loadStats.ts
│   └── completeQuizSession.ts
│   └── startQuizSession.ts
│   └── quizSession.ts
├── types/
│   └── Question.ts
└── utils/
    └── shuffle.ts
```

## 6) API ja andmevoog
1. Kasutaja valib menüüs filtrid (kategooria/raskus/tüüp).
2. Rakendus laeb küsimused Trivia API-st.
3. Küsimused salvestatakse lokaalselt tabelisse questions.
4. QuizScreen kuvab küsimusi ja salvestab vastuste ajaloo (answersJson).
5. Mängu lõpus salvestatakse tulemus tabelisse results.
6. ResultScreen kuvab:
- käesoleva mängu tulemust
- parimat tulemust
- Top 5 viimaseid mänge

## 7) Manual test checklist
-  Peamenüüs saab sisestada nime.
-  Kategooria valik töötab dropdown’ina.
-  Raskuse valik töötab.
-  Küsimuse tüübi valik töötab.
-  Quiz käivitub ja küsimused tulevad API-st.
-  Taimer jookseb iga küsimuse jaoks.
-  Pärast mängu kuvatakse score/protsent/aeg.
-  Tulemus salvestub SQLite-sse.
-  Top 5 ja Last games kuvatakse korrektselt.
-  Restart ja Main menu nupud töötavad.

## 8) Ekraanipildid 
Lisa siia oma pildid pärast tegemist.

Main screen
![Task list](screenshots/main.png)

Quiz screen
![Task list](screenshots/question.png)

Result screen
![Task list](screenshots/result.png)

Leaderboard / Last games
![Task list](screenshots/last.png)

9) Võimalikud edasised parandused
- Ühtlustada kogu UI tekst ühe keele peale (EN või ET).
- Kuvada Last games blokis lisaks kuupäev/kategooria/raskus/tüüp.
- Tõsta app-flow loogika eraldi hooki/usecase kihti.
- Lisada unit-testid mapperitele/usecase’idele.