# GIANNA Nails & More — ιστοσελίδα ραντεβού

Ιστοσελίδα κράτησης ραντεβού για κατάστημα manicure/pedicure. Χτισμένη με
Next.js, Prisma και Tailwind CSS.

## Τοπική εκτέλεση

```bash
npm install
npm run dev
```

Άνοιξε [http://localhost:3000](http://localhost:3000).

Οι μεταβλητές περιβάλλοντος βρίσκονται στο `.env` (δεν ανεβαίνει στο git).
Ο αρχικός λογαριασμός διαχειριστή δημιουργείται αυτόματα με βάση τα
`ADMIN_EMAIL` / `ADMIN_PASSWORD` του `.env`, την πρώτη φορά που τρέχεις
`npx prisma migrate dev` (ή `npx prisma db seed`).

Τοπικά η βάση είναι ένα αρχείο SQLite (`prisma/dev.db`) — μηδενικό setup.

## Δομή

- `src/app/(site)` — δημόσιες σελίδες: Αρχική, Υπηρεσίες, Άλμπουμ, Ραντεβού,
  Συμβουλές
- `src/app/admin` — προστατευμένος πίνακας διαχείρισης (login, ραντεβού
  ημέρας με εκτύπωση, υπηρεσίες, συμβουλές/άρθρα, άλμπουμ, διακοπές, ρυθμίσεις)
- `src/lib/slots.ts` — λογική υπολογισμού διαθέσιμων ωρών ραντεβού
- `src/lib/email.ts` — αποστολή email επιβεβαίωσης/υπενθύμισης (βλ. παρακάτω)
- `prisma/schema.prisma` — μοντέλο βάσης δεδομένων

## Email επιβεβαίωσης & υπενθύμισης ραντεβού (προαιρετικό)

Αν ένας πελάτης δώσει email κατά την κράτηση, μπορεί να λάβει:
- Email επιβεβαίωσης αμέσως μόλις κλείσει το ραντεβού
- Email υπενθύμισης μία μέρα πριν (στέλνεται αυτόματα κάθε πρωί από ένα
  προγραμματισμένο "cron" που τρέχει στο Vercel)

Χωρίς να ρυθμίσεις τίποτα, η εφαρμογή δουλεύει κανονικά — απλά δεν στέλνει
email. Για να το ενεργοποιήσεις:

1. Δημιούργησε δωρεάν λογαριασμό στο [resend.com](https://resend.com)
   (έως 3.000 email/μήνα δωρεάν).
2. Πάρε το API key σου και βάλε το στο `RESEND_API_KEY` (στο Vercel:
   Project Settings → Environment Variables).
3. Προαιρετικά, αν αποκτήσεις δικό σου domain, μπορείς να το επαληθεύσεις
   στο Resend και να αλλάξεις το `EMAIL_FROM` ώστε τα email να έρχονται από
   δικό σας email αντί για το `onboarding@resend.dev` (καλύτερη
   παραδοσιμότητα, λιγότερες πιθανότητες να πάνε "ανεπιθύμητα").
4. (Προαιρετικό αλλά συνιστάται) Όρισε `CRON_SECRET` σε ένα τυχαίο string,
   ώστε μόνο το Vercel Cron να μπορεί να πυροδοτήσει την αποστολή
   υπενθυμίσεων.

Η υπενθύμιση τρέχει αυτόματα μία φορά τη μέρα (βλ. `vercel.json`) —
δουλεύει μόνο μετά το deploy στο Vercel, όχι τοπικά.

## Deploy (δωρεάν) στο Vercel + Neon Postgres

Η εφαρμογή τρέχει τοπικά με SQLite, αλλά για production χρειάζεται πραγματική
βάση δεδομένων (SQLite δεν επιβιώνει σε serverless hosting). Βήματα:

1. **Neon Postgres (δωρεάν)**: Δημιούργησε λογαριασμό στο
   [neon.tech](https://neon.tech), φτιάξε νέο project, αντίγραψε το
   connection string (`DATABASE_URL`).

2. **Άλλαξε το schema**: στο `prisma/schema.prisma`, άλλαξε
   `provider = "sqlite"` σε `provider = "postgresql"`.

3. **GitHub**: Δημιούργησε ένα δωρεάν repository στο
   [github.com](https://github.com) και ανέβασε τον κώδικα (`git init`,
   `git add`, `git commit`, `git push`).

4. **Vercel**: Δημιούργησε δωρεάν λογαριασμό στο [vercel.com](https://vercel.com),
   κάνε "Import" το GitHub repository. Στις ρυθμίσεις του project πρόσθεσε τα
   environment variables:
   - `DATABASE_URL` — το connection string από το Neon
   - `SESSION_SECRET` — ένα μεγάλο τυχαίο string (π.χ. από
     `openssl rand -base64 32`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — τα στοιχεία εισόδου της διαχειρίστριας
   - (προαιρετικά) `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET` — για τα
     email επιβεβαίωσης/υπενθύμισης, βλ. πάνω

5. **Migration στην production βάση**: μετά το πρώτο deploy, τρέξε τοπικά
   (με το production `DATABASE_URL` στο `.env`):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. Το Vercel θα σου δώσει ένα link τύπου `https://το-ονομα.vercel.app` — αυτό
   είναι το link που στέλνεις στους πελάτες, και το `/admin/login` για τη
   διαχειρίστρια.
