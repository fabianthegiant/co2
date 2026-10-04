// Tabelle mit CO2-Emissionsdaten: Suchen, Filtern und Sortieren

let tabellenKoerper = document.querySelector("#tabelle tbody");
let suchfeld = document.querySelector("#suche");
let landAuswahl = document.querySelector("#land");
let hinweis = document.querySelector("#hinweis");
let anzahl = document.querySelector("#anzahl");
let kopfzellen = document.querySelectorAll("#tabelle th");

// Startzustand: nach Emissionen absteigend sortiert
let sortSpalte = "emissionen";
let aufsteigend = false;

// Liste aller Länder, die in den Daten vorkommen
let laender = [];
for (let i = 0; i < daten.length; i++) {
  if (!laender.includes(daten[i].land)) {
    laender.push(daten[i].land);
  }
}
laender.sort();

// Auswahlliste "Land" füllen
for (let i = 0; i < laender.length; i++) {
  let option = document.createElement("option");
  option.value = laender[i];
  option.innerText = laender[i];
  landAuswahl.appendChild(option);
}

// Entfernt Zeichen, mit denen man HTML oder JavaScript einschleusen könnte,
// und begrenzt die Länge der Eingabe.
function bereinigeEingabe(text) {
  let sauber = text.replace(/[<>"'`=;{}()\/\\]/g, "");
  return sauber.trim().substring(0, 50);
}

function zeigeTabelle() {
  // Eingaben lesen und prüfen
  let eingabe = suchfeld.value;
  let suchbegriff = bereinigeEingabe(eingabe);
  let land = landAuswahl.value;

  // Nur Länder aus der Liste zulassen (der Wert könnte im Browser manipuliert werden)
  if (land !== "alle" && !laender.includes(land)) {
    land = "alle";
  }

  // Hinweis anzeigen, wenn Zeichen entfernt wurden
  if (suchbegriff !== eingabe.trim()) {
    hinweis.innerText = "Unzulässige Zeichen wurden entfernt. Gesucht wird nach: " + suchbegriff;
    hinweis.classList.remove("d-none");
  } else {
    hinweis.classList.add("d-none");
  }

  // Filtern
  let ergebnis = [];
  for (let i = 0; i < daten.length; i++) {
    let eintrag = daten[i];
    let passtLand = land === "alle" || eintrag.land === land;
    let passtSuche = eintrag.unternehmen.toLowerCase().includes(suchbegriff.toLowerCase());
    if (passtLand && passtSuche) {
      ergebnis.push(eintrag);
    }
  }

  // Sortieren
  ergebnis.sort(function (a, b) {
    let wertA = a[sortSpalte];
    let wertB = b[sortSpalte];
    let vergleich;
    if (typeof wertA === "number") {
      vergleich = wertA - wertB;
    } else {
      vergleich = wertA.localeCompare(wertB, "de");
    }
    return aufsteigend ? vergleich : -vergleich;
  });

  // Tabelle neu aufbauen. Alle Texte werden mit innerText gesetzt,
  // damit nichts als HTML interpretiert wird.
  tabellenKoerper.innerText = "";

  if (ergebnis.length === 0) {
    let zeile = document.createElement("tr");
    let zelle = document.createElement("td");
    zelle.colSpan = 4;
    zelle.className = "text-center text-body-secondary";
    zelle.innerText = "Keine Einträge gefunden.";
    zeile.appendChild(zelle);
    tabellenKoerper.appendChild(zeile);
  }

  for (let i = 0; i < ergebnis.length; i++) {
    let eintrag = ergebnis[i];
    let zeile = document.createElement("tr");

    let zelleUnternehmen = document.createElement("td");
    zelleUnternehmen.innerText = eintrag.unternehmen;

    let zelleLand = document.createElement("td");
    zelleLand.innerText = eintrag.land;

    let zelleBranche = document.createElement("td");
    zelleBranche.className = "d-none d-sm-table-cell"; // auf dem Smartphone ausgeblendet
    zelleBranche.innerText = eintrag.branche;

    let zelleEmissionen = document.createElement("td");
    zelleEmissionen.className = "text-end";
    zelleEmissionen.innerText = eintrag.emissionen.toLocaleString("de-DE", { minimumFractionDigits: 1 });

    zeile.appendChild(zelleUnternehmen);
    zeile.appendChild(zelleLand);
    zeile.appendChild(zelleBranche);
    zeile.appendChild(zelleEmissionen);
    tabellenKoerper.appendChild(zeile);
  }

  anzahl.innerText = ergebnis.length + " von " + daten.length + " Unternehmen";

  // Pfeil an der sortierten Spalte anzeigen
  for (let i = 0; i < kopfzellen.length; i++) {
    let pfeil = kopfzellen[i].querySelector("span");
    if (kopfzellen[i].dataset.spalte === sortSpalte) {
      pfeil.innerText = aufsteigend ? "▲" : "▼";
    } else {
      pfeil.innerText = "";
    }
  }
}

// Klick auf eine Spaltenüberschrift sortiert nach dieser Spalte
for (let i = 0; i < kopfzellen.length; i++) {
  kopfzellen[i].onclick = function () {
    let spalte = this.dataset.spalte;
    if (spalte === sortSpalte) {
      aufsteigend = !aufsteigend;
    } else {
      sortSpalte = spalte;
      aufsteigend = true;
    }
    zeigeTabelle();
  };
}

suchfeld.oninput = zeigeTabelle;
landAuswahl.onchange = zeigeTabelle;
document.querySelector("#filter").onsubmit = function () {
  zeigeTabelle();
  return false;
};

zeigeTabelle();
