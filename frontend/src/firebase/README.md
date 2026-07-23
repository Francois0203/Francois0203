# Firebase

Firebase service layer. All Firestore reads, the contact form write, and Firebase Analytics initialisation live here.

---

## Files

| File | Purpose |
|---|---|
| `index.js` | Firebase app init - exports `db` and `initAnalytics` |
| `firestore.js` | All Firestore read helpers + `submitContactForm` re-export |
| `contact.js` | Contact form write (`submitContactForm`) |
| `storage.js` | Stub - images are served from the repo; Firebase Storage is not used |

---

## Firestore Structure

```
portfolio/            collection - semi-static sections (one read each)
  personal            {name, title, tagline, summary, dateOfBirth, …}
  contact             {email, phone, location, availability}
  social              {platforms: [{platform, key, url, color}, …]}
  donation            {enabled, title, message, link, buttonText}
  skills              {grouped: {…}, technical: […]}
  interests           {items: [{title, image?}, …]}

experience/           collection - ordered by `order` field
  <doc>               {title, company, location, period, description, order}

education/            collection - ordered by `order` field
  <doc>               {degree, institution, period, details, order}

projects/             collection - ordered by `order` field
  <doc>               {title, subtitle, description, summary, techStack, features, highlights, links, order}

contacts/             collection - contact form submissions (write-only from client)
  <doc>               {name, email, message, createdAt}
```

---

## Reading data

### Full portfolio (all sections in parallel)

```js
import { usePortfolioData } from '../hooks';

const { data, loading, error } = usePortfolioData();
```

### Individual section

```js
import { getExperience, getProjects } from '../firebase/firestore';

const jobs     = await getExperience(); // [{title, company, …}, …]
const projects = await getProjects();
```

### Contact form

```js
import { submitContactForm } from '../firebase/firestore';

await submitContactForm({ name, email, message });
```

---

## Security rules

**Firestore** - only `contacts` allows client writes; everything else is read-only:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /{col}/{doc} where col in ['experience','education','projects','githubProjects'] {
      allow read: if true;
      allow write: if false;
    }
    match /contacts/{doc} {
      allow create: if request.resource.data.keys().hasOnly(['name','email','message','createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.email is string
                    && request.resource.data.message is string;
      allow read, update, delete: if false;
    }
  }
}
```

---

## Environment variables

All config values come from `frontend/.env.local` (local) and GitHub Actions secrets (CI). See `.env.local` for the variable names - the file is gitignored and must not be committed.
