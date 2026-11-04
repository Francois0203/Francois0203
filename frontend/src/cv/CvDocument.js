import { Buffer } from 'buffer/';
import { Document, Page, View, Text, Image, Link, Font, StyleSheet, pdf } from '@react-pdf/renderer';
import onest400 from '@fontsource/onest/files/onest-latin-400-normal.woff?url';
import onest500 from '@fontsource/onest/files/onest-latin-500-normal.woff?url';
import onest600 from '@fontsource/onest/files/onest-latin-600-normal.woff?url';
import onest700 from '@fontsource/onest/files/onest-latin-700-normal.woff?url';
import bricolage600 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff?url';
import { periodOf, isCurrent, startKey } from '../content/records';
import { toCredential } from '../components/Credentials';

// The CV as a real A4 PDF, built in the browser. Loaded only when someone asks for it.

// react-pdf checks Buffer.isBuffer when loading images, which browsers do not have.
globalThis.Buffer ??= Buffer;

Font.register({
  family: 'Onest',
  fonts: [
    { src: onest400, fontWeight: 400 },
    { src: onest500, fontWeight: 500 },
    { src: onest600, fontWeight: 600 },
    { src: onest700, fontWeight: 700 },
  ],
});
Font.register({ family: 'Bricolage', fonts: [{ src: bricolage600, fontWeight: 600 }] });
// Whole words only, a hyphenated name or link reads badly on a CV.
Font.registerHyphenationCallback(word => [word]);

// A PDF cannot read CSS variables, so the few colours are restated here.
const INK = '#14151c';
const INK_2 = '#3c3f4d';
const INK_3 = '#71758a';
const ACCENT = '#2f3bd1';
const ACCENT_SOFT = '#e8eafc';
const RULE = '#dfe1ea';
const SIDE = '#f4f5f9';

const SIDE_W = 64;
const PAD = 13;
const GAP = 8;
const mm = (n) => `${n}mm`;

const s = StyleSheet.create({
  page: { paddingTop: '13mm', paddingBottom: '15mm', fontFamily: 'Onest', fontSize: 8.6, lineHeight: 1.4, color: INK },
  sideFill: { position: 'absolute', top: 0, bottom: 0, right: 0, width: mm(SIDE_W), backgroundColor: SIDE },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '2.2mm', backgroundColor: ACCENT },

  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: mm(PAD), paddingRight: mm(PAD) },
  headerText: { flex: 1, paddingRight: '6mm' },
  name: { fontFamily: 'Bricolage', fontWeight: 600, fontSize: 28, lineHeight: 1, letterSpacing: -0.7, color: INK },
  title: { marginTop: '2.2mm', fontSize: 11.5, fontWeight: 500, color: ACCENT },
  reach: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '3.4mm' },
  reachItem: { flexDirection: 'row', alignItems: 'center', marginRight: '5mm', marginTop: '0.8mm' },
  reachDot: { width: '1.3mm', height: '1.3mm', borderRadius: '0.65mm', backgroundColor: ACCENT, marginRight: '1.6mm' },
  reachText: { fontSize: 8.2, color: INK_2, textDecoration: 'none' },
  photo: { width: '27mm', height: '27mm', borderRadius: '13.5mm', objectFit: 'cover', borderWidth: 2.5, borderColor: '#ffffff' },
  photoRing: { padding: '0.8mm', borderRadius: '14.5mm', backgroundColor: ACCENT },

  divider: { marginTop: '6mm', marginLeft: mm(PAD), marginRight: mm(PAD), height: 0.75, backgroundColor: RULE },

  body: { flexDirection: 'row' },
  main: { flex: 1, paddingLeft: mm(PAD), paddingRight: mm(GAP) },
  side: { width: mm(SIDE_W), paddingLeft: mm(6.5), paddingRight: mm(PAD - 3) },

  section: { marginTop: '5.5mm' },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: '2.6mm' },
  headingText: { fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: ACCENT, marginRight: '2.5mm' },
  headingRule: { flex: 1, height: 0.75, backgroundColor: RULE },

  summary: { fontSize: 9, lineHeight: 1.5, color: INK_2 },

  entry: { flexDirection: 'row' },
  rail: { width: '5.5mm', alignItems: 'center' },
  railLine: { width: 0.9, backgroundColor: RULE },
  railTop: { height: '1.1mm' },
  railGap: { height: '4.7mm' },
  railRest: { flexGrow: 1 },
  node: { width: '2.5mm', height: '2.5mm', borderRadius: '1.25mm', backgroundColor: '#ffffff', borderWidth: 1.4, borderColor: ACCENT },
  nodeNow: { backgroundColor: ACCENT },
  entryBody: { flex: 1, paddingLeft: '1.5mm' },
  entryGap: { paddingTop: '3.6mm' },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  role: { flex: 1, fontSize: 10.4, fontWeight: 600, lineHeight: 1.25, marginRight: '4mm', color: INK },
  when: { fontSize: 7.8, fontWeight: 600, color: INK_3, marginTop: 1.6 },
  org: { marginTop: '0.4mm', fontSize: 8.8, fontWeight: 500, color: ACCENT },
  text: { marginTop: '1.2mm', color: INK_2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '1.6mm' },
  tag: { fontSize: 6.9, lineHeight: 1, color: ACCENT, backgroundColor: ACCENT_SOFT, borderRadius: '1mm', paddingVertical: '0.8mm', paddingHorizontal: '1.6mm', marginRight: '1.2mm', marginBottom: '1.1mm' },

  sideSection: { marginTop: '5.5mm' },
  groupName: { fontSize: 7.9, fontWeight: 600, color: INK, marginBottom: '1.2mm' },
  groupGap: { marginTop: '2.4mm' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginRight: '-1mm' },
  chip: { fontSize: 7, lineHeight: 1, color: INK_2, backgroundColor: '#ffffff', borderWidth: 0.6, borderColor: RULE, borderRadius: '1mm', paddingVertical: '0.8mm', paddingHorizontal: '1.6mm', marginRight: '1.1mm', marginBottom: '1.1mm' },
  itemTitle: { fontSize: 8.3, fontWeight: 600, lineHeight: 1.3, color: INK },
  itemText: { fontSize: 7.6, color: INK_3, marginTop: '0.3mm' },
  pairGap: { marginTop: '2mm' },
  url: { fontSize: 7.7, color: INK_2, textDecoration: 'none' },
  linkGap: { marginTop: '1mm' },
  plain: { fontSize: 8.2, color: INK_2 },

  footer: { position: 'absolute', top: '286mm', left: mm(PAD), right: mm(PAD), flexDirection: 'row', fontSize: 7, color: INK_3 },
});

// "https://www.github.com/name/" -> "github.com/name", broken after a slash when too long.
const URL_FITS = 34;
const shortUrl = (url = '') => {
  const short = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  const cut = short.length > URL_FITS ? short.lastIndexOf('/', URL_FITS) : -1;
  return cut > 0 ? `${short.slice(0, cut + 1)}\n${short.slice(cut + 1)}` : short;
};

// "January 2025 - April 2026" -> "Jan 2025 - Apr 2026"
const shortDates = (text = '') => String(text ?? '').replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/g, '$1');

// Drops street numbers: "39 Main Road, Melrose Arch, Johannesburg" -> "Melrose Arch, Johannesburg"
const area = (location = '') => String(location ?? '').split(',').map(x => x.trim()).filter(x => x && !/\d/.test(x)).slice(-2).join(', ');

// Newest first: current roles on top, then by end date, then by start date.
const newestFirst = (list) => [...list].sort((a, b) => {
  const end = (r) => (isCurrent(r) ? Infinity : startKey({ start: r.end }) ?? startKey(r) ?? -Infinity);
  return end(b) - end(a) || (startKey(b) ?? 0) - (startKey(a) ?? 0);
});

// Anything marked showOnCv: false stays on the website but off the CV.
const onCv = (r) => r?.showOnCv !== false;

const Heading = ({ title }) => (
  <View style={s.heading} minPresenceAhead={30}>
    <Text style={s.headingText}>{title}</Text>
    <View style={s.headingRule} />
  </View>
);

// One stop on the timeline: a dot and its line on the left, the details on the right.
const Entry = ({ first, last, current, title, when, org, text, tags }) => (
  <View style={s.entry} wrap={false}>
    <View style={s.rail}>
      <View style={[s.railLine, first ? s.railTop : s.railGap, first && { backgroundColor: 'transparent' }]} />
      <View style={[s.node, current && s.nodeNow]} />
      <View style={[s.railLine, s.railRest, last && { backgroundColor: 'transparent' }]} />
    </View>
    <View style={[s.entryBody, !first && s.entryGap]}>
      <View style={s.entryHead}>
        <Text style={s.role}>{title}</Text>
        {when && <Text style={s.when}>{when}</Text>}
      </View>
      {org && <Text style={s.org}>{org}</Text>}
      {text && <Text style={s.text}>{text}</Text>}
      {tags?.length > 0 && (
        <View style={s.tags}>
          {tags.map(tag => <Text key={tag} style={s.tag}>{tag}</Text>)}
        </View>
      )}
    </View>
  </View>
);

const CvDocument = ({ name, photo, personal, contact, social: allSocial, experience: allExperience, education: allEducation, certifications: allCerts, skills: allSkills, skillGroups, interests: allInterests, languages: allLanguages, summary, t, badges }) => {
  const experience = newestFirst(allExperience.filter(onCv));
  const education = newestFirst(allEducation.filter(onCv));
  const social = allSocial.filter(onCv);
  const hiddenGroups = new Set(skillGroups.filter(g => !onCv(g)).map(g => g.name));
  const interests = personal.cvInterests === false ? [] : allInterests;
  const languages = personal.cvLanguages === false ? [] : allLanguages;
  const portrait = personal.cvPhoto === false ? null : photo;

  const groups = [];
  allSkills.filter(x => !hiddenGroups.has(x.group)).forEach(({ label, group }) => {
    const key = group || '';
    let g = groups.find(x => x.name === key);
    if (!g) groups.push(g = { name: key, items: [] });
    if (!g.items.includes(label)) g.items.push(label);
  });

  const certs = allCerts.filter(onCv).map(toCredential)
    .filter(c => c.status !== 'planned' && c.name)
    .sort((a, b) => (a.status === 'earned' ? 0 : 1) - (b.status === 'earned' ? 0 : 1) || a.order - b.order);

  const reach = [
    contact.email && [contact.email, `mailto:${contact.email}`],
    contact.phone && [contact.phone, `tel:${String(contact.phone).replace(/[^\d+]/g, '')}`],
    contact.location && [area(contact.location) || contact.location],
  ].filter(Boolean);

  const updated = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <Document title={`${name} CV`} author={name} subject={personal.title ?? 'CV'}>
      <Page size="A4" style={s.page}>
        <View style={s.sideFill} fixed />
        <View style={s.accentBar} fixed />

        <View style={s.header}>
          <View style={s.headerText}>
            <Text style={s.name}>{name}</Text>
            {personal.title && <Text style={s.title}>{personal.title}</Text>}
            {reach.length > 0 && (
              <View style={s.reach}>
                {reach.map(([value, href]) => (
                  <View key={value} style={s.reachItem}>
                    <View style={s.reachDot} />
                    {href ? <Link src={href} style={s.reachText}>{value}</Link> : <Text style={s.reachText}>{value}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
          {portrait && (
            <View style={s.photoRing}>
              <Image style={s.photo} src={portrait} />
            </View>
          )}
        </View>

        <View style={s.divider} />

        <View style={s.body}>
          <View style={s.main}>
            {summary && (
              <View style={s.section}>
                <Heading title={t.profileHeading} />
                <Text style={s.summary}>{summary}</Text>
              </View>
            )}

            {experience.length > 0 && (
              <View style={s.section}>
                <Heading title={t.experienceHeading} />
                <View>
                  {experience.map((e, i) => (
                    <Entry
                      key={e.id ?? i}
                      first={i === 0}
                      last={i === experience.length - 1}
                      current={isCurrent(e)}
                      title={e.role}
                      when={shortDates(periodOf(e))}
                      org={[e.company, area(e.location)].filter(Boolean).join(', ')}
                      text={e.description}
                      tags={e.tags}
                    />
                  ))}
                </View>
              </View>
            )}

            {education.length > 0 && (
              <View style={s.section}>
                <Heading title={t.educationHeading} />
                <View>
                  {education.map((e, i) => (
                    <Entry
                      key={e.id ?? i}
                      first={i === 0}
                      last={i === education.length - 1}
                      current={isCurrent(e)}
                      title={[e.degree, e.field].filter(Boolean).join(', ') || e.institution}
                      when={shortDates(periodOf(e))}
                      org={e.institution}
                      text={e.description}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={s.side}>
            {groups.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.skillsHeading} />
                {groups.map((g, i) => (
                  <View key={g.name} style={i > 0 && s.groupGap} wrap={false}>
                    {g.name && <Text style={s.groupName}>{g.name}</Text>}
                    <View style={s.chips}>
                      {g.items.map(item => <Text key={item} style={s.chip}>{item}</Text>)}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {certs.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.certificationsHeading} />
                {certs.map((c, i) => (
                  <View key={c.id ?? i} style={i > 0 && s.pairGap} wrap={false}>
                    <Text style={s.itemTitle}>{c.name}</Text>
                    <Text style={s.itemText}>
                      {c.status === 'earned'
                        ? [c.issuer, shortDates(c.date)].filter(Boolean).join(', ')
                        : [t.cvInProgress, c.status === 'booked' && c.date && `${badges.statusBooked} ${c.date}`].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {social.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvProfilesHeading} />
                {social.map((x, i) => (
                  <View key={x.key ?? i} style={i > 0 && s.linkGap} wrap={false}>
                    <Link src={x.url} style={s.url}>{shortUrl(x.url)}</Link>
                  </View>
                ))}
              </View>
            )}

            {languages.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvLanguagesHeading} />
                <Text style={s.plain}>{languages.join(', ')}</Text>
              </View>
            )}

            {interests.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvInterestsHeading} />
                <Text style={s.plain}>{interests.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={{ flex: 1 }}>{name}, {t.cvUpdated.toLowerCase()} {updated}</Text>
          <Text style={{ flex: 1, textAlign: 'right' }} render={({ pageNumber, totalPages }) => `${t.cvPage} ${pageNumber} ${t.cvOf} ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

// The photo is inlined first, so a blocked image drops it instead of failing the CV.
const inline = async (url) => {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const renderCv = async (props) => {
  const photo = await inline(props.photo);
  return pdf(<CvDocument {...props} photo={photo} />).toBlob();
};
