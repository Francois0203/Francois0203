# Portfolio Cloud Functions

One function, `onContactMessage`: a Firestore trigger that fires when a visitor
submits the Connect form (a new doc in the `contacts` collection) and emails a
formatted summary to you. Replying to the notification replies to the visitor
(their address is set as `Reply-To`).

## One-time setup

Cloud Functions require the **Blaze** (pay-as-you-go) plan. It has a generous
free tier — a personal contact form costs effectively nothing — but a card must
be on file. Upgrade at: Firebase Console → ⚙️ → Usage and billing → Modify plan.

1. **Install deps**
   ```bash
   cd functions
   npm install
   ```

2. **Create a sending password.** With Gmail you need 2-Step Verification on,
   then create an **App Password** (Google Account → Security → App passwords).
   It's a 16-character code. Store it as a secret:
   ```bash
   firebase functions:secrets:set SMTP_PASSWORD
   # paste the app password when prompted
   ```

3. **Set the non-secret config.** Copy the template and edit it:
   ```bash
   cp .env.example .env
   ```
   Set `SMTP_USER` to the Gmail address that will send the mail. `NOTIFY_TO`
   defaults to `francoismeiring0203@gmail.com`. (Not using Gmail? Change
   `SMTP_HOST`/`SMTP_PORT` — e.g. SendGrid: `smtp.sendgrid.net` / `587`, with
   `SMTP_USER=apikey`.)

4. **Deploy**
   ```bash
   firebase deploy --only functions
   ```

## Test it

Submit the Connect form on the site (or add a doc to `contacts` in the console).
Within a few seconds you should get the email. If not:

```bash
firebase functions:log
```

Bad credentials or SMTP errors are logged there (the message is still saved in
Firestore regardless — the function never blocks or drops it).

## Notes

- Gmail sends `From` as your authenticated account; the visitor's address is on
  `Reply-To`, so **Reply** goes straight to them.
- To change the recipient later: edit `NOTIFY_TO` in `.env` and redeploy.
- To rotate the password: `firebase functions:secrets:set SMTP_PASSWORD` then redeploy.
- If deploy complains about the trigger **region/location**, your Firestore database
  isn't in the US multi-region. Find its location in the console (Firestore →
  top of the Data page) and set it on the trigger in `index.js`, e.g.
  `region: 'europe-west1'` (and matching `database` if you use a named DB).
