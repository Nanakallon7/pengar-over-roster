addMdToPage(`
# Källor

## Datakällor vi använt

### 1. Länsinfo (SQLite)
**Källa:** Skapad av kursens lärare baserad på SCB-data.
**Trovärdighet:** Hög – SCB är Sveriges officiella statistikmyndighet.
**Datakvalitet:** God kvalitet, innehåller info om alla 21 län.

### 2. Medelinkomst per kommun (MongoDB)
**Källa:** Statistiska centralbyrån (SCB) – medelinkomst uppdelad per kommun och kön.
**Trovärdighet:** Hög – officiell statlig statistik.
**Datakvalitet:** God kvalitet, innehåller data från flera år vilket möjliggör trendanalys.

### 3. Riksdagsvaldata 2022 (Neo4j)
**Källa:** Valmyndigheten – officiella valresultat från riksdagsvalen 2018 och 2022.
**Trovärdighet:** Mycket hög – Valmyndigheten är den officiella källan för svenska valresultat.
**Datakvalitet:** Hög kvalitet, innehåller röstdata per kommun och parti.

### 4. Geodata om kommuner (MySQL)
**Källa:** Lantmäteriet/SCB – geografisk information om svenska kommuner och tätorter.
**Trovärdighet:** Hög – officiella svenska myndigheter.
**Datakvalitet:** God kvalitet, används för att koppla kommuner till rätt län.

## Reflektion kring datan
Samtliga datakällor kommer från svenska myndigheter vilket ger hög trovärdighet.
En svaghet är att kopplingen mellan kommunnamn i olika databaser inte alltid är identisk,
vilket kan leda till att vissa kommuner faller bort i analysen.
`);