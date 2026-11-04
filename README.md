# AK – Adolescentní Knihovna

Malá webová aplikace, která eviduje knihy školní knihovny. Každá kniha má svůj záznam (název, autor, ISBN, předmět, klíčová slova, obálka, fotky obsahu…) a kdokoli v něm může hledat a procházet.

**Web: <https://jemolotrab.github.io/AK-Database/>**

> [!NOTE]
> **Pro koho je tento návod?**
> *Uživatelé* (učitelé, studenti): kapitoly [Jak používat knihovnu](#jak-používat-knihovnu) a [Jak přidat knihu](#jak-přidat-knihu).
> *Budoucí správci a majitelé repozitáře*: kapitoly [Jak to funguje](#jak-to-funguje) a [Nastavení a údržba](#nastavení-a-údržba). Jsou psané tak, aby podle nich projekt udržel i někdo, kdo ho nikdy neviděl.
> Podrobný technický popis (součásti, spojení, postupy, bezpečnost) je v dokumentu **[docs/jak-to-funguje.md](docs/jak-to-funguje.md)**.

---

## Obsah

1. [Jak to funguje](#jak-to-funguje)
2. [Jak používat knihovnu](#jak-používat-knihovnu)
3. [Jak přidat knihu](#jak-přidat-knihu)
4. [Úprava a mazání knih](#úprava-a-mazání-knih)
5. [STK a soubor knihy](#stk-a-soubor-knihy)
6. [Nastavení a údržba](#nastavení-a-údržba)
7. [Známá omezení](#známá-omezení)
8. [Řešení problémů](#řešení-problémů)
9. [Našel jsi chybu? Majitelé a předání projektu](#našel-jsi-chybu-majitelé-a-předání-projektu)
10. [Autoři a použité nástroje](#autoři-a-použité-nástroje)

---

## Jak to funguje

### Proč GitHub?

Na GitHubu je **uloženo úplně všechno**: samotný web (`index.html`, který zobrazuje GitHub Pages), záznam každé knihy i všechny fotky. Hodí se na to ze tří důvodů:

- web i soubory jsou zdarma,
- každá změna je *commit*, takže existuje **celá historie** a omylem upravenou nebo smazanou knihu lze vždy vrátit,
- data jsou obyčejné soubory (jeden malý JSON na knihu), které se snadno čtou, zálohují i přenášejí jinam.

Háček: **web na GitHub Pages je statický.** Umí data zobrazit, ale nic uložit. A klíč, který dovoluje do repozitáře zapisovat (*token*), se nesmí dát do kódu stránky, protože by si ho mohl přečíst každý, kdo stránku otevře. Bez dalšího kroku by se tedy přidání knihy dělalo **ručně na GitHubu**: vytvořit složku, JSON a nahrát fotky.

### Proč Cloudflare?

Tuhle práci dělá **Cloudflare Worker**, malý program na straně serveru (`worker/worker.js`), který stojí mezi webem a GitHubem:

- uchovává **tajné hodnoty** (klíč k GitHubu a heslo editoru). Jsou uložené v Cloudflare, nikdy v repozitáři,
- kontroluje heslo a potom **zapisuje do GitHubu** za stránku (přidání, úprava i smazání knihy),
- **vyhledává knihy podle ISBN** v knihovních katalozích,
- propojuje **telefon s počítačem** při skenování (viz [Skenování telefonem](#c-skenování-telefonem)).

```mermaid
graph TD;
    A[ Prohlížeč<br/>index.html z GitHub Pages ];
    B[ Cloudflare Worker<br/>heslo + klíč k GitHubu ];
    C[( GitHub repozitář<br/>BOOK_FILES/ );]
    D[ Knihovní katalogy<br/>Knihovny.cz, Open Library,<br/>K10plus, DNB ];
    E[( Cloudflare D1<br/>párování a historie změn )];

    A -->| čte knihy | C;
    A -->| přidat, upravit, smazat | B;
    B -->| commity | C;
    A -->| ISBN, české knihy | D;
    B -->| ISBN | D;
    B <--> E;
```

Čtení knihovny **nepotřebuje ani heslo, ani Worker**: stránka si knihy načítá přímo z GitHubu. Přes Worker procházejí jen změny.

### Varování: ukládání může selhat

Spojení mezi webem, Cloudflare a GitHubem může občas selhat (výpadek internetu, výpadek GitHubu nebo Cloudflare, vypršelý klíč…). Pak se místo zelené zprávy o uložení objeví **červená zpráva ❌**.

**Když vidíš ❌, kniha uložená není a to, co jsi vyplnil, je pryč**, protože formulář se už zavřel. Knihu je nutné zadat znovu (i s fotkami). Počkej proto vždy na zelené potvrzení, než stránku zavřeš nebo knihu odložíš.

---

## Jak používat knihovnu

Otevři [web](https://jemolotrab.github.io/AK-Database/). Pro procházení není potřeba žádné přihlášení.

- **Hledání**: podle názvu, autora, klíčových slov, kódu STK nebo **ISBN** (s pomlčkami i bez, ISBN-10 a ISBN-13 téže knihy se najdou obě, funguje i část čísla).
- **📷 ve vyhledávání**: namiř kameru na čárový kód na zadní straně knihy a knihovna ji najde.
- **Filtry**: podle předmětu, kategorie a (u češtiny) *maturitní četby*.
- **Řazení**: výchozí, nejnovější nahoře, A → Z, Z → A. (Knihy přidané před zavedením dat nemají datum a v řazení „nejnovější“ jsou na konci.)
- **Náhodná kniha**: otevře náhodnou knihu z těch, které jsou zrovna zobrazené (chceš-li náhodnou *dějepisnou*, nejdřív vyfiltruj historii).
- **Mřížka / seznam**: přepíná se tlačítky vedle hledání.
- **🕘 Historie změn**: v detailu knihy je odkaz **Historie knihy** (co se s ní dělo a kdy). Přehled celé knihovny je v okně **Statistiky → Poslední změny**. U úprav se píše, co přesně se změnilo (např. „Autor: Němcová → Božena Němcová“).
- **Statistiky**: přehled knihovny (knihy podle předmětů a budov, nejčastější autoři, nejnovější knihy) a **export do Excelu**: všechny knihy + statistiky, nebo jen právě zobrazené knihy.

Kliknutím na knihu otevřeš její detail (fotky obsahu, popis, umístění, data).

---

## Jak přidat knihu

1. Klikni na **„Chci přidat knihu!“** a zadej **heslo editoru** (zeptej se správce knihovny). Heslo se zadává při každém přidání, úpravě i smazání.
2. Vyber, jak knihu vyplnit (**„Ruční zadání informací“** nebo **„Zadání podle ISBN“**):

### a) Ručně

Vyplň pole sám. Povinné jsou název, autor, rok, předmět, kategorie a tři klíčová slova. **Kód STK** se vytvoří automaticky.

### b) Podle ISBN (automaticky)

Přepni na **„Zadání podle ISBN“** (je označené *Experimentální*, automatické vyplnění je pomocník, ne záruka). Vyplní se název, autor, rok, klíčová slova a, pokud ho katalog má, i popis. Můžeš:

- **napsat ISBN** a stisknout *Načíst informace*, nebo
- kliknout na *Skenovat čárový kód kamerou* a naskenovat kód kamerou zařízení (na telefonu to jde skvěle), nebo
- kliknout na *Skenovat telefonem*, viz dále.

> [!WARNING]
> **Údaje vždy zkontroluj.** Pocházejí z knihovních katalogů a mohou být chybné, neúplné nebo v jiném jazyce. Anglické knihy dorazí s anglickými klíčovými slovy a popisem: přelož je, nebo je nech. Předmět, kategorie, budova, obálka a fotky obsahu jsou vždy **tvoje** práce.

### c) Skenování telefonem

Užitečné, když máš knihu v ruce a počítač na stole:

1. **V počítači**: ve formuláři zvol „Zadání podle ISBN“ a klikni na **Skenovat telefonem**. Objeví se QR kód.
2. **V telefonu**: otevři web, klepni na **Připojit k počítači** a namiř kameru na QR kód (jde to i běžnou aplikací Fotoaparát).
3. Namiř telefon na čárový kód knihy. ISBN se pošle do počítače, který formulář vyplní.
4. Telefon zůstává připojený, takže můžeš skenovat dál. Když počítač založí **nové** párování (ukáže nový QR kód), stačí na něj namířit kameru telefonu. Stránku opouštět nemusíš.

Párování platí 2 hodiny a přenáší jen čísla ISBN. Telefon nikdy nemůže nic uložit, upravit ani smazat.

### Fotky

- **Obálka**: jedna fotka.
- **Obsah**: až **10 fotek**, pořadí se mění tlačítky ▲ ▼.
- Povolené formáty: `.jpg`, `.jpeg`, `.png`.
- Velké fotky se před nahráním **automaticky zmenší** v prohlížeči (obsah na nejvýše 2000 px, obálky na 1200 px), takže klidně nahrávej přímo fotky z telefonu.

### Duplicity

Formulář při psaní upozorní, když už kniha v knihovně je:

- ⛔ **stejný název ve stejném předmětu**: uložit nejde (přepsalo by to existující knihu),
- ⚠️ **stejné ISBN**, nebo **stejný název a autor**: budeš požádán o potvrzení.

### Uložení

Klikni na **„Zaznamenat knihu!“** a počkej na zelené potvrzení (viz [varování výše](#varování-ukládání-může-selhat)). Ostatním návštěvníkům se nová kniha zobrazí zhruba do minuty (fotky až za několik minut kvůli ukládání do mezipaměti na GitHubu).

---

## Úprava a mazání knih

V detailu knihy jsou dole tlačítka. Obě vyžadují heslo.

**Upravit knihu** otevře stejný formulář s uloženými údaji. Změnit lze cokoli: texty, předmět a kategorii, obálku, fotky obsahu (odebrat, přeuspořádat, přidat). Pozor:

- Změna **názvu** automaticky přejmenuje složku knihy.
- Změna **předmětu nebo kategorie** změní první části kódu STK (poslední čtyři písmena zůstávají, protože jsou nalepená na knize, případně knihu přeznač).
- Aktualizuje se datum poslední změny.

**Každá úprava i smazání se zapíše do [historie změn](#jak-používat-knihovnu)**, aby bylo vidět, co se s knihou dělo.

**Smazat knihu** smaže knihu **i všechny její fotky**. Aby se to nestalo omylem, musíš **název knihy ručně opsat** (kopírování a vkládání je záměrně vypnuté, na velikosti písmen a diakritice nezáleží).

> [!TIP]
> Nic není navždy ztraceno: každá úprava i smazání je commit v historii repozitáře. Starší verzi najdeš v historii složky `BOOK_FILES/…` na GitHubu.

---

## STK a soubor knihy

### Kód STK

Každá kniha má jedinečný kód ve tvaru **`XX-YY-ZZZZ`**, např. `01-03-QWXZ`:

| Část | Význam | Příklad |
|---|---|---|
| `XX` | předmět (01 Čeština, 02 Angličtina, 03 Němčina, 04 Španělština, 05 Matematika, 06 Ekonomie, 07 Fyzika, 08 Chemie, 09 Biologie, 10 Zeměpis, 11 Historie, 12 IT, 13 Hudebka, 14 Tělocvik, 15 Výtvarka, 16 Vaření) | `01` = Čeština |
| `YY` | kategorie v předmětu (např. u češtiny: 01 Učebnice, 02 Pracovní sešit, 03 Epika, 04 Lyrika, 05 Drama, 06 Ostatní) | `03` = Epika |
| `ZZZZ` | čtyři náhodná velká písmena, jedinečná v celé knihovně | `QWXZ` |

STK je napsané na knize a podle něj se kniha najde v regálu.

### Kde jsou data uložená

Každá kniha má v repozitáři vlastní složku:

```
BOOK_FILES/
└── 01-Cestina/                  ← složka předmětu (plný seznam viz „Nastavení“)
    └── Babička/                 ← složka pojmenovaná podle názvu knihy
        ├── Babička.json         ← záznam knihy (všechna data)
        ├── obalka.jpg           ← obálka
        ├── obsah-1.jpg          ← obsah, strana 1
        └── obsah-2.jpg          ← obsah, strana 2
```

Web sestaví seznam knih tak, že přečte všechny soubory `*.json` v `BOOK_FILES/`. **To je celá „databáze“.** Není nic dalšího, co by se muselo udržovat v souladu.

### Příklad souboru knihy

*(Vymyšlená ukázková data.)*

```json
{
  "stk": "01-03-QWXZ",
  "title": "Babička",
  "author": "Božena Němcová",
  "isbn": "9788000000008",
  "year": "1855",
  "description": "Příběh o životě na vsi a o babičce, která svou moudrostí spojuje celou rodinu.",
  "location": { "Budova": "Vojtova" },
  "keywords": ["próza", "venkov", "rodina"],
  "matura": true,
  "cover": "https://raw.githubusercontent.com/jemolotrab/AK-Database/main/BOOK_FILES/01-Cestina/Babi%C4%8Dka/obalka.jpg",
  "contents": [
    "https://raw.githubusercontent.com/jemolotrab/AK-Database/main/BOOK_FILES/01-Cestina/Babi%C4%8Dka/obsah-1.jpg",
    "https://raw.githubusercontent.com/jemolotrab/AK-Database/main/BOOK_FILES/01-Cestina/Babi%C4%8Dka/obsah-2.jpg"
  ],
  "added": "2026-10-01T08:30:00.000Z",
  "updated": "2026-10-03T12:00:00.000Z"
}
```

| Pole | Poznámka |
|---|---|
| `stk` | viz výše |
| `matura` | používá se jen u češtiny (maturitní četba) |
| `contents` | seznam odkazů na fotky (starší knihy mohou mít jediný textový odkaz, funguje obojí) |
| `added` / `updated` | nastavují se automaticky; starší knihy nemají data, dokud je někdo neupraví |

> [!CAUTION]
> Upravovat tyto soubory **ručně na GitHubu jde, ale nedoporučuje se**: překlep v odkazu nebo v názvu složky knihu rozbije. Použij raději tlačítko pro úpravu na webu.

---

## Nastavení a údržba

*Pro toho, kdo projekt vlastní. Dokud všechno funguje, nic z toho nepotřebuješ, ale schovej si to na den, kdy přestane.*

### Co kde je

| Část | Kde | K čemu |
|---|---|---|
| Web | `index.html` v tomto repozitáři, zveřejněný přes **GitHub Pages** | vše, co uživatel vidí |
| Worker | `worker/worker.js` v tomto repozitáři, **nasazený v Cloudflare** (Workers & Pages) | ukládá, upravuje a maže knihy, hledá ISBN, páruje telefon |
| Databáze | `worker/database.sql` → **Cloudflare D1** | krátkodobé párovací kódy pro skener v telefonu a **historie změn** knih |
| Data | `BOOK_FILES/` v tomto repozitáři | všechny knihy a fotky |

> [!NOTE]
> Soubory `worker/worker.js` a `worker/database.sql` drž v repozitáři jako **zálohu a dokumentaci**. Cloudflare se z nich samo neaktualizuje (pokud nenastavíš propojení s Gitem): po úpravě souboru vlož nový kód do Workeru v administraci Cloudflare a klikni na **Deploy**.

### Nastavení Workeru (Cloudflare → Worker → Settings)

| Název | Typ | Hodnota |
|---|---|---|
| `ADD_BOOK_PASSWORD` | Secret | heslo editoru (lze kdykoli změnit) |
| `GITHUB_TOKEN` | Secret | token GitHubu, který smí zapisovat do tohoto repozitáře (viz níže) |
| `GITHUB_REPO` | Text | `uživatel/repozitář`, např. `jemolotrab/AK-Database` |
| `GITHUB_BRANCH` | Text, nepovinné | název větve, výchozí je `main` |
| `DB` | **vazba** na D1 databázi | databáze pro párování telefonu a historii změn (nepovinné: bez ní nefunguje skenování telefonem a historie, ukládání knih ano) |

**Vytvoření tokenu na GitHubu:** GitHub → Settings → Developer settings → Fine-grained personal tokens → *Generate new token* → jen tento repozitář → oprávnění **Contents: Read and write**. Tokeny **vyprší** (nejdéle po roce), datum expirace si dej do kalendáře.

**Vytvoření databáze (párování a historie):** Cloudflare → Storage & databases → D1 → vytvoř databázi → Console → spusť obsah souboru `worker/database.sql` → ve Workeru: Settings → Bindings → přidej *D1 database* s názvem proměnné přesně `DB`.

### Nastavení webu

Na začátku skriptu v `index.html`:

- `GITHUB_REPO`: repozitář (`uživatel/repozitář`),
- `WORKER_URL`: adresa Workeru, `https://<název-workeru>.<účet>.workers.dev`.

Když se repozitář přejmenuje nebo Worker přestěhuje, aktualizuj tyto dva řádky. Seznam předmětů (`SUBJECTS`) je ve stejném souboru; odpovídající názvy složek (`FOLDER_MAP`) jsou ve `worker.js`, **musí být stejné**.

### Zveřejnění

GitHub Pages je zapnuté v nastavení repozitáře (Settings → Pages → *Deploy from a branch* → `main`, kořenová složka). Po nahrání nového `index.html` se web aktualizuje do minuty nebo dvou (ve vlastním prohlížeči obnov stránku pomocí Ctrl+Shift+R).

---

## Známá omezení

- **České knihy se podle ISBN hledají hůř než anglické.** Národní knihovna ČR blokuje adresy serverů Cloudflare, proto se české údaje berou z **Knihovny.cz přímo v prohlížeči návštěvníka** (to dovoluje). Když je Knihovny.cz zrovna nedostupné, musí se kniha vyplnit ručně.
- **Popisy českých knih jsou vzácné**, katalogy je většinou nemají.
- **Neúspěšné uložení smaže zadaná data** (viz [varování](#varování-ukládání-může-selhat)).
- **GitHub omezuje, jak často se stránka smí ptát na seznam knih** (60 dotazů za hodinu z jedné IP adresy bez přihlášení). Ve škole sdílí adresu hodně zařízení, takže se ve špičce může stát, že se knihovna nenačte, dokud se limit neobnoví.
- **Změny nejsou živé.** Kdo má stránku už otevřenou, uvidí nové knihy až po obnovení.
- **Jedno společné heslo.** Nejsou osobní účty, takže se neví, *kdo* změnu provedl (historie ukáže *co* a *kdy*).
- **Historie změn** zachycuje jen změny provedené přes web a jen od chvíle, kdy byla zapnutá. Změny provedené přímo na GitHubu v ní nejsou (ty najdeš v historii commitů).
- **Datum přidání a poslední úpravy** mají jen knihy přidané nebo upravené od zavedení dat.
- **Žádné půjčování.** Knihovna knihy eviduje, ale nesleduje, kdo je má.

---

## Řešení problémů

| Problém | Pravděpodobná příčina a řešení |
|---|---|
| Knihovna se nenačte („Chyba při načítání knih“) | chybí internet, nebo hodinový limit GitHubu: chvíli počkej a obnov stránku |
| ❌ *Unauthorized* při ukládání | špatné nebo chybějící `ADD_BOOK_PASSWORD`, nebo se po změně hesla Worker znovu nenasadil (**Deploy**) |
| ❌ *GitHub 401 / 403* | `GITHUB_TOKEN` vypršel nebo nemá oprávnění *Contents: Read and write* → vytvoř nový token a změň secret |
| ❌ *GitHub 404* | špatné `GITHUB_REPO` (nebo `GITHUB_BRANCH`), nebo token nemá k repozitáři přístup |
| ❌ *Kniha se stejným názvem už … existuje* | v tomto předmětu už kniha se stejným názvem je: změň název nebo předmět |
| „Párování telefonu není nastavené“ nebo „Historie změn není zapnutá“ | databáze D1 není připojená jako `DB` (viz Nastavení) |
| „Tabulka historie neexistuje“ | v databázi D1 chybí tabulky: spusť znovu soubor `worker/database.sql` |
| Skener v telefonu hlásí, že kód vypršel | počítač založil nové párování: naskenuj nový QR kód |
| Kamera se nespustí | web musí běžet na `https://` a v prohlížeči musí být povolená kamera |
| Česká kniha: „Kniha nenalezena“ | Knihovny.cz bylo nedostupné nebo blokované: zkus to později, nebo vyplň ručně |
| Vyměněná fotka se pořád zobrazuje stará | GitHub soubory pár minut ukládá do mezipaměti: počkej, nebo obnov stránku (Ctrl+Shift+R) |

---

## Našel jsi chybu? Majitelé a předání projektu

**Chyby a nápady:** otevři *Issue* v tomto repozitáři (záložka Issues) a popiš, co jsi dělal, co jsi čekal a co se stalo. Hodně pomůžou snímky obrazovky a text červené chyby. Případně kontaktuj současného majitele:

- **Současný majitel / správce:** *(jméno, školní e-mail)* <!-- TODO: doplnit -->
- **Účet Cloudflare patří:** *(jméno, e-mail)* <!-- TODO: doplnit -->

**Při předání projektu** (maturita!) udělej všechno z toho. Jinak knihovna tiše přestane fungovat, nebo zůstane svázaná s někým, kdo už ve škole není:

- [ ] převeď repozitář (Settings → *Transfer ownership*), nebo přidej nového správce jako administrátora,
- [ ] ujisti se, že **účet Cloudflare** (a jeho obnovovací e-mail) patří škole nebo novému správci, ne jen soukromé osobě,
- [ ] **změň heslo editoru** (`ADD_BOOK_PASSWORD`) a řekni ho jen těm, kdo ho potřebují,
- [ ] vytvoř **nový token GitHubu** pod novým majitelem, změň `GITHUB_TOKEN` a starý token smaž,
- [ ] pokud se změnil název repozitáře nebo adresa Workeru, aktualizuj `GITHUB_REPO` / `WORKER_URL` v `index.html` a v nastavení Workeru,
- [ ] doplň do tohoto návodu nové kontakty.

---

## Autoři a použité nástroje

Projekt vznikl jako maturitní práce. **jemolotrab_314** vymyslel koncept a požadavky (evidence knih školní knihovny, editor knih, systém kódů STK), rozhodoval o tom, jak má aplikace fungovat, a vše testoval na skutečných zařízeních.

Při vývoji spolupracoval s AI asistentem **Claude (Anthropic)**, který napsal většinu kódu a dokumentace, navrhoval technická řešení a pomáhal s hledáním chyb. Za výsledek a jeho provoz odpovídá autor.

| Autor | AI asistent (Claude) |
|---|---|
| nápad a požadavky | většina kódu (Worker, hledání, skenování, statistiky, export do Excelu…) |
| rozhodování, co a jak má aplikace dělat | návrhy technických řešení (párování telefonu přes QR kód, úprava a mazání jedním commitem, kontrola duplicit…) |
| nastavení GitHubu a Cloudflare | hledání příčin chyb a psaní testů |
| testování na skutečných zařízeních, hledání problémů | psaní návodu a technické dokumentace |

---

<sub>Vytvořeno pomocí: GitHub Pages · Cloudflare Workers a D1 · údaje o knihách z Knihovny.cz, Open Library, K10plus a Německé národní knihovny (DNB) · [ZXing](https://github.com/zxing-js/library) pro čtení čárových a QR kódů · [SheetJS](https://sheetjs.com/) pro export do Excelu.</sub>
