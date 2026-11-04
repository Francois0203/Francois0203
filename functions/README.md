# Portfolio Cloud Functions

Two functions:

- `sendMessage`: the Connect form posts here. It drops bots (a hidden trap field
  and forms sent in under 3 seconds), then limits each sender to 2 letters per
  10 minutes and 5 per day, each email address to 5 per day, and everyone
  together to 40 per day. Repeats of the same letter are ignored. Only this
  function can write to `contacts`; the database rules block everything else.
  Limits are tracked in `rateLimits` with one-way scrambled keys that delete
  themselves after a day. Change the numbers in `LIMITS` in `index.js`.
- `onContactMessage`: fires when a letter is saved and emails it to you.
  Replying to the email replies to the visitor.

## One-time setup

Cloud Functions require the **Blaze** (pay-as-you-go) plan. It has a generous
free tier - a personal contact form costs effectively nothing - but a card must
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
   `SMTP_HOST`/`SMTP_PORT` - e.g. SendGrid: `smtp.sendgrid.net` / `587`, with
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
Firestore regardless - the function never blocks or drops it).

## Notes

- Gmail sends `From` as your authenticated account; the visitor's address is on
  `Reply-To`, so **Reply** goes straight to them.
- To change the recipient later: edit `NOTIFY_TO` in `.env` and redeploy.
- To rotate the password: `firebase functions:secrets:set SMTP_PASSWORD` then redeploy.
- If deploy complains about the trigger **region/location**, your Firestore database
  isn't in the US multi-region. Find its location in the console (Firestore →
  top of the Data page) and set it on the trigger in `index.js`, e.g.
  `region: 'europe-west1'` (and matching `database` if you use a named DB).
