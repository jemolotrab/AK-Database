# AK - Adolescentní Knihovna 2026

Vítejte v **online** školní databázi uložených knih, kde se dají najít různé knihy ze školní knihovny!

### Webovka

[AK — Adolescentní Knihovna](https://jemolotrab.github.io/AK-Database/)

### Jak postupovat u přidání knihy?

Aby jste mohli přidat knihu, tak musíte kliknout na tlačítko *`+ Chci přidat knihu!`*

![til](Assets/GIFs/ClickItToAddIt.gif)

Poté by se mělo objevit okénko, kde **zadáte heslo** :)

![til](Assets/GIFs/WriteItToOpenIt.gif)

Jakmile zadáte kód, tak můžete začít přidávat informace o knize, kterou chcete přidat.

Když už jste zadaly všechny nutné informace o knize, tak by se měl naistalovat soubor typu *`Název knihy.json`*

![til](Assets/GIFs/RaiseItToCompleteIt.gif)

**Příklad naistalovaného souboru, který byl vygenerován:**
```ruby
{
  "stk": "01-03-YTDA",
  "title": "Na západní frontě klid (Též zkušební)",
  "author": "Erich Maria Remarque",
  "isbn": "",
  "year": "1928",
  "location": {
    "Budova": "Budova B"
  },
  "keywords": [
    "Válka",
    "Kamarádi",
    "Myšlenky"
  ],
  "matura": true,
  "cover": "",
  "contents": ""
}
```

### *Malá vsuvka...*.

Jelikož je projekt stále ve vývoji, tak ukládání knihy není automatické. Pokud soubor **.json** nedáte na GitHub, tak kniha v se po obnovení webu ztratí a tak ho musíte přidat do *`BOOK_FILES`* a dále do vybraného předmětu. Podobně je to i u fotek, kde pokud chcete, tak je možné přidat fotku obalu a obsahu ve formátech **.jpg** a **.png**. Tyto fotky pak musíte přidat do *`IMAGES`*
Po uložení a chvilce strpení by se včechno mělo objevit na webu ;)
