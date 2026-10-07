# AK - Adolescentní Knihovna 2026
<!-- Toto README by mělo obsahovat víceméně všechny informace o AK. Taky by to mělo obsahovat nějaký "guide", který popíše postup při přidání/odebrání knihy - 14.09.26 (tento text není viditelný) -->

> [!WARNING]
> ***Tento projekt a zároveň i toto README je VELMI out of date! Tedy je možné, že se projekt může v blízké době výrazně pozměnit a README nemusí odpovídat realitě!***

Vítejte ve školní **online databázi knih**! Kde si můžete hledat a procházet knihy potřebné pro vaše projekty, prezentace a tak dále. Toto **README** obsahuje základní informace o tom, jak tento projekt funguje a jak postupovat u přidání a úpravy/oddělání knihy.

## Webovka
> [!NOTE]
> **Stránka webu** ↴\
> [AK — Adolescentní Knihovna](https://jemolotrab.github.io/AK-Database/) <!-- TENTO ODKAZ SE NESMÍ SAKRA ZTRATIT!!! >:) -->
>
> **(Na webu se kdyžtak vpravo nahoře vyskytuje tlačítko *`GitHub`*, které váš přemístí zpět zde na Github)**

## Informace o projektu a jak to *(zhruba)* funguje

### Proč GitHub? <img src="Assets/images/25231.png" width="16" height="16"/>
Jelikož je tento projekt převážně tvořen přes GitHub, tak je důležité si vysvětlit a objasnit proč je tato databáze tvořená právě přes něj a jaké to má výhody a nevýhody.

Celý projekt je stavěn na jednom základním principu, a to ukládání knih se základními informacemi potřebné pro uživatele. GitHub byl vybrán z důvodu, jelikož repositáře (se kterými GitHub pracuje) dovolují ukládání hromadu souborů pro osobní účely bez žádných limitací. GitHub také kromě ukládání souborů dokáže za pomocí kódu **HTML** nechat běžet jednoduchý web, který se vyskytuje ve stejném repositáři a dokáže se propojit se soubory v něm.\
I přesto, že GitHub dokáže většinu potřeb zachovat v jednom repositáři, tak jediné co nám GitHub nedovolí je automatizace. Náš web dovoluje uživateli nejenom prohlížet knihy, ale knihy i přidávat, jenže aby knihu mohl opravdu uložit na web, tak potřebuje soubor knihy přidat do tohoto repositáře na GitHub. Problém jenže je, že většina uživatelů se nebude chtít hrabat v souborech jenom proto, aby uložili nějakou knihu a nebo GitHub nikdy nepoužívali. Naštěstí existuje jednoduché řešení, které nám celý proces ukládání knih zautomatizuje.

### Propojení GitHub s Cloudflare <img src="Assets/images/cloudflare-logo-png_seeklogo-294312.png" width="16" height="16"/>
Naše řešení se nazývá Cloudflare, ale co to je a jak nám dokáže pomoct s automatizací ukládání knih na GitHub?

**[NĚJAKÉ INFORMACE O CLOUDFLARE ZDE]**\
Aby Cloudflare mohl mít přístup k našemu repositáři, tak je potřeba vytvořit takzvaný token, který dovoluje k úpravě repositáře bez potřeby se ověřovat. Abychom tento token mohli využít, tak ho nemůžeme jen tak napsat do našeho index.html (který řídí web) především z důvodu, že by si ho každý mohl jednoduše najít a zneužít, což sám GitHub zachytí a nedovolí se projektu uložit. Proto je potřeba vzít náš token a předat ho našemu vytvořenému pracovníkovi na Cloudflare s kódem, který mu řekne, jak s ním zacházet.\
Jelikož náš pracovník existuje v malém prostoru cloudu s enkryptovaným tokenem, tak může velmi jednoduše interagovat s naším webem a ukládat naše knihy automaticky na GitHub.

Cloudflare nám tedy ušetří veškerou manuální práci s ukládáním knih na GitHub, což je pro průměrného uživatele jednodušší. Jakmile tedy uživatel uloží knihu na našem webu, tak pošle veškeré soubory knihy na Cloudflare, kde náš pracovník převezme naše informace a plně automaticky je uloží do správného repositáře a složky na GitHub. Kniha by se během několika sekund objevit na webu i po obnovení.

> [!CAUTION]
> ***Málokrát do roka se může stát, že spojení s Cloudflare vypadne a nedovolí knize se uložit na GitHub! Pokud se tak stane, tak náš pracovník na Cloudflare nemá aktuální token a je potřeba vygenerovat nový!***

> [!IMPORTANT]
> ## Postup u přidání knihy
Aby jste mohli přidat knihu, tak budete muset přejít na web a kliknout vpravo nahoře na tlačítko ***`+ Chci přidat knihu!`***. Uprostřed by se poté mělo objevit okénko, kde zadáte heslo (editor knihy je chráněn heslem z důvodu, že ten web je plně přístupný k celému internetu). Po zadání (správného) hesla by se měl objevit editor knihy, kde o knize napíšete veškeré nutné i vedlejší informace.

**Tlačítko přidání knihy**\
![til](Assets/GIFs/KliknoutNaPřidáníKnihy.gif)\
**Okénko pro zadání kódu**\
![til](Assets/GIFs/PřídatKnihu_Editor.gif)

### Manuální zadání / Zadání podle ISBN
První čeho si lze v editoru knihy povšimnout jsou dvě horní tlačítka (***`Ruční zadání informací`*, *`Zadání podle ISBN`***), které dávají možnost informace o knize zadat ručně nebo automaticky. Pokud si zvolíte možnost automatického zadání informací o knize podle ISBN, tak se dále vyskytne možnost, zda kód ISBN zadáte ručně a nebo naskenujete čárkový kód s ISBN té knihy. V obou případech by se měly všechny informace automaticky vyplnit.\
Každopádně je ale furt dobré brát na vědomí, že automatické vyplnění ne vždycky může fungovat, protože buď kniha není vyhledatelná, nebo připojení s pracovníkem na Cloudflare (který informace o knize vyhledává) je nějak porušené. Toto se stává nejčastěji u česky vydaných knih.

**Okénko E-ditora s výběrem možnosti vyplnění**\
![til](Assets/GIFs/VybráníZadání_Editor.gif)

> [!CAUTION]
> ***Pokud si tedy vyberete možnost automaticky vyplnit informace podle ISBN, tak informace zkontrolujte, doupravte a kdyžtak i doplňte!\
> Informace jsou čerpané z těchto katalogů a webů: Open Library, K10plus, DNB, Národní Knihovna ČR a Knihovny.cz***

### STK (Systémově tříděný kód)
Když už se knihy mají ukládat automaticky, tak je dobré vymyslet nějaký systém třídění knih a označit jednotlivou knihu vlastním kódem nebo číslem. Protože hodláme ukládat školní, tak můžeme třídit a seřazovat knihy podle jednoduchých pravidel. Každá kniha je tedy tříděna podle předmětu, kategorie předmětu a poté má každá kniha čtyři náhodně vygenerovaná písmena, která zabraňují tomu, aby se různé knihy ve stejném předmětu a stejné kategorii nepletly a také aby se daly jednoduše identifikovat.\
Finální podobu kódu si můžete představit nějak takto: XX-YY-ZZZZ, kdy XX je školní předmět, YY je kategorie předmětu a ZZZZ jsou ty čtyři náhodně generovaná písmena, která dovolují mít v jedné kategorii předmětu až 456 976 jedinečných knih :) 

### Fotky
Všechny knihy mají možnost přidání fotek obalu knihy a jejího obsahu, což zjednodušuje vyhledávání a uživatel si může i předem ověřit, zda kniha obsahuje informace co právě hledá a tím si ušetřit čas a lépe naplánovat jakou knihu potřebuje. Plně podporované formáty souborů fotek jsou .png a .jpg/.jpeg.

### Upload knihy
Jakmile knihu uložíte, tak by se mělo objevit nové okénko, kde se ukáže zda kniha bude uložena nebo ne (a tím pádem ztracena). Náš web stáhne soubor a pošle ho na Cloudflare, odtam Cloudflare převezme složku s knihou a fotkami a uloží to na GitHub. GitHub bude obsahovat složku se jménem knihy, ve kterém se vyskytuje soubor ve formátu .json a fotky, které jste nahrály. Po chvilce strpení by se kniha měla objevit na webu.

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
