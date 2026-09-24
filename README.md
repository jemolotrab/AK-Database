# AK - Adolescentní Knihovna 2026
<!-- Toto README by mělo obsahovat víceméně všechny informace o AK. Taky by to mělo obsahovat nějaký "guide", který popíše postup při přidání/odebrání knihy - 14.09.26 -->

> [!WARNING]
> ***Tento projekt a zároveň i toto README není plně dokončeno! Tedy je možné, že se projekt může v blízké době výrazně pozměnit a README nemusí odpovídat realitě!***

Vítejte ve školní **online databázi knih**! Kde si pro svůj projekt můžete hledat knihy potřebné pro vaše projekty, prezentace a tak dále. Toto **README** obsahuje základní informace o tom, jak tento projekt funguje a jak případně přidat/oddělat knihu.

## Webovka
> [!NOTE]
> **Stránka webu** ↴\
> [AK — Adolescentní Knihovna](https://jemolotrab.github.io/AK-Database/)
>
> **Na webu se kdyžtak vpravo nahoře vyskytuje tlačítko *`GitHub`*, které váš přemístí zpět zde na Github**

## Informace o projektu a jak to *(zhruba)* funguje
Jelikož tento projekt je převážně tvořen přes GitHub, tak je důležité si objasnit proč je tato databáze tvořená právě přes něj a jaké to má výhody a nevýhody.

### Proč GitHub? <img src="Assets/images/25231.png" width="16" height="16"/>
Celý projekt je stavěn na jednom principu, a to ukládání knih se základními informacemi o ní. GitHub je perfektně stavěn na ukládání projektů jak pro osobní účely, tak i pro veřejnost, což se dá v našem případě velmi využít. V našem repositáři vytvoříme web za pomocí programovacího jayzka HTML (soubor pojmenovaný index.html) a dále můžeme přidat složky s jmény předmětů, kde se knihy budou ukládat.\
I přesto že GitHub nám dovoluje si jak ukládat knihy, tak i běžet funkční web, tak nám nedovoluje ukládat a přidat knihy do repositáře automaticky. Vždy je potřeba pro uživatele vzít nainstalovaný soubor .zip, extrahovat ho a manuálně ho přidat do správné složky, což může být problém pro uživatele, kteří s GitHub neumí nebo s ním nijak v minulosti nepracovali. Naštěstí existuje jednoduché řešení, které celý proces zautomatizuje.

### Propojení GitHub s Cloudflare <img src="Assets/images/cloudflare-logo-png_seeklogo-294312.png" width="16" height="16"/>
Abychom mohli vůbec pochopit, jak nám Cloudflare pomůže s automatizací, tak je dobré si krátce říct o Cloudflare a jeho možnostech.\
Pokud člověk chce automatizovat nějaký proces v GitHub, tak musí vytvořit takzvaný token, což je klíč který dává přístup k repositáři a můžete v něm cokoli upravovat. Tento token ale nemůžeme dát do našeho kódu webu (index.html), protože je ten kód volně viditelný každým kdo si kód otevře a taky i ho sám GitHub zachytí a zabrání jeho použití. Proto na scénu přichází Cloudflare.\
Cloudflare nám dovoluje si vytvořit takzvané "Workers", kteří dovolují použít váš kód v malém prostoru cloudu. Když našemu "Worker" předámé token s krátkým kódem o tom jak s ním zacházet, tak bude token bezpečně enkriptovaný v Cloudflare mimo náš kód.

Cloudflare ušetří manuální ukládání na GitHub a tedy postup je pro uživatele jednodušší. Jakmile uživatel uloží knihu na našem webu, tak se stáhne složka na Cloudflare, kde náš "Worker" vezme veškeré soubory co se v něm nachází a převede je na GitHub plně automaticky bez pomoci uživatele. Finální kniha by se měla na webu objevit během několika sekund.

> [!CAUTION]
> ***Málokrát do roka se může stát, že spojení s Cloudflare vypadne a nedovolí knize se uložit na GitHub! Pokud se tak stane, tak kontaktujte členy repositáře!***

> [!IMPORTANT]
> ## Postup u přidání knihy
Aby jste mohli přidat knihu, tak budete muset přejít na web a kliknout vpravo nahoře na tlačítko ***`+ Chci přidat knihu!`***. Uprostřed by se poté mělo objevit okénko, kde zadáte heslo, aby jste mohli pokračovat. Po zadání hesla by se měl objevit editor knihy, kde o knize napíšete veškeré nutné i vedlejší informace.

**Tlačítko přidání knihy**\
![til](Assets/GIFs/KliknoutNaPřidáníKnihy.gif)\
**Okénko pro zadání kódu**\
![til](Assets/GIFs/PřídatKnihu_Editor.gif)

### Manuální zadání / Zadání podle ISBN
Hned po otevření editora je možné si povšimnout dvou horních tlačítek (***`Ruční zadání informací`*, *`Zadání podle ISBN`***), které dávají možnost informace zadat ručně nebo automaticky. Pokud si zvolíte možnost zadání informací podle ISBN, tak se kniha vyplní dvěma způsoby, a to že buď ISBN napíšete celé ručně nebo ho naskenujete. Po chvilce strpení by se informace měly vyplnit. Je dobré brát na vědomí, že automatické vyplnění nemusí vždy plně fungovat a taky je velice pravděpodobné, že se žádné informace vůbec nevyplní. To je způsobené tím, že knihovna (Open Library) ze které jsou informace čerpány obsahují převážně knihy vydané v angličtině a tedy běžné české knihy musí mít plně manuálně napsané informace.

**Okénko Editora s výběrem možnosti vyplnění**\
![til](Assets/GIFs/VybráníZadání_Editor.gif)

> [!CAUTION]
> ***Pokud si tedy vyberete možnost automaticky vyplnit informace podle ISBN, tak informace zkontrolujte, doupravte a kdyžtak i doplňte!***

### STK (Systémově tříděný kód)
Když už se knihy ukládají automaticky a chceme aby se lehce třídily a vyhledávaly, tak je potřeba zadané knihy nějak očíslovat nebo označit vlastním kódem. Pro naše účely můžeme třídit knihy podle jednoduchých pravidel, kde každá kniha je tříděna podle předmětu (čeština, matematika, němčina atd.), kategorie předmětu (například v češtině jsou kategorie román, epika, učebnice atd.) a dále na čtyři náhodná písmena, která zajistí to, aby každá kniha měla svůj vlastní kód a aby se kódy neopakovaly. Tento systém můžeme pojmenovat jako Systémově Tříděný Kód (STK) a celkově se kód staví na XX-YY-ZZZZ, kdy "XX" je předmět, "YY" je kategorie předmětu a "ZZZZ" jsou ty čtyři náhodně generovaná písmena (tedy 26 písmen), což nám dovoluje mít jedinečných **456 976 knih** v jedné kategorii předmětu.

### Fotky
Všechny knihy mají možnost přidání fotek obalu knihy a jejího obsahu, což zjednodušuje vyhledávání a uživatel si může i předem ověřit, zda kniha obsahuje informace co právě hledá a tím si ušetřit čas a lépe naplánovat jakou knihu potřebuje. Podporované formáty souborů fotek jsou .png a .jpg/.jpeg.

### Upload knihy
Jakmile knihu uložíte, tak by se mělo objevit nové okénko, kde se ukáže zda kniha bude uložena nebo ne (a tím pádem ztracena). Náš web stáhne soubor a pošle ho na Cloudflare, odtam Cloudflare převezme složku s knihou a fotkami a uloží to na GitHub. GitHub bude obsahovat složku se jménem knihy knihy, ve kterém se vyskytuje soubor ve formátu .json a fotky, které jste nahrály. Po chvilce strpení by se kniha měla objevit na webu.

### Ukázka souboru knihy (Half-Life 2_ Raising the Bar.json)
```
{
  "stk": "11-03-GMAN",
  "title": "Half-Life 2: Raising the Bar",
  "author": "David Hodgson",
  "isbn": "9780761543640",
  "year": "2004",
  "description": "Dílo pojednává o zvedání laťky a posouvání limitů počítačů",
  "location": {
    "Budova": "Perlička (Hlaváčova)"
  },
  "keywords": [
    "Fyzika",
    "Hratelnost",
    "Příběh"
  ],
  "matura": true,
  "cover": "https://raw.githubusercontent.com/jemolotrab/AK-Database/main/BOOK_FILES/11-Historie/Half-Life 2: Raising the Bar/IMG30260506092229.jpg",
  "contents": "https://raw.githubusercontent.com/jemolotrab/AK-Database/main/BOOK_FILES/11-Historie/Half-Life 2: Raising the Bar/IMG30260506092235.jpg"
}
```

> [!WARNING]
> ## Úprava a smazaní knihy
Pokud víte, že jste buď něco špatně napsali, nebo dali knihu do špatného předmětu nebo kategorie, tak jediný způsob jak knihu opravit nebo smazat je mít plný přístup k tomuto repositáři "AK-Database". Pokud přístup nemáte, tak stačí kontaktovat člena repositáře, který by mohl buď knihu upravit nebo případně smazat.

> [!WARNING]
> ## Poslední informace
Celá knihovna je volně přístupná jak z hlediska webu, tak i celého kódu co jej tvoří! Tedy kód si může kdokoliv stáhnout a použít k vlastním účelům, s čímž nemůžu nic dělat. Dále by bylo dobré zmínit pro ty, kteří mají k tomuto repositáři přístup a mohou tedy upravovat i kód a samotné soubory knih, tak NIC NEUPRAVUJTE A NEMĚŇTE, DOKUĎ JSTE SI VY A OSTATNÍ JISTÍ, ŽE TO OPRAVDU ZPŮSOBUJE PROBLEMY!


## (Níže je starý popis) :)

### Zjednodušený postup pro přidání knihy
Aby jste mohli přidat knihu, tak musíte kliknout na tlačítko *`+ Chci přidat knihu!`*

![til](Assets/GIFs/ClickItToAddIt.gif)

Poté by se mělo objevit okénko, kde **zadáte heslo** :)

![til](Assets/GIFs/WriteItToOpenIt.gif)

Jakmile zadáte kód, tak můžete začít přidávat informace o knize, kterou chcete přidat.

Když už jste zadaly všechny nutné informace o knize, tak by se měl naistalovat soubor typu *`Název knihy.zip`*

![til](Assets/GIFs/RaiseItToCompleteIt.gif)

*`(v ukázce je naistalován soubor .json kromě .zip)`*

### Finální kroky...
Jelikož je projekt stále ve vývoji, tak ukládání knihy není automatické. Pokud soubor **knihy** nedáte na GitHub, tak kniha se po obnovení webu ztratí a tak musíte na webu kliknout na tlačítko *`GitHub`* a soubor extrahovat a přidat do *`BOOK_FILES`* a dále do vybraného předmětu. Celý soubor **knihy** obsahuje *`název_knihy.json`* a fotky, které jste nahráli *`(pro přidání souborů je potřeba mít povolení úpráv tohoto repozitáře)`*.

Po uložení a chvilce strpení by se všechno mělo objevit na webu ;)
