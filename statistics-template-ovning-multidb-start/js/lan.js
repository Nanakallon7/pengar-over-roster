import dbInfoOk, { displayDbNotOkText } from "./dbInfoOk.js";

addMdToPage(`
# Län & Partier
## Hur röstar folk i olika län?

Här undersöker vi hur röstningen fördelar sig mellan olika partier i Sveriges län 2022.
`);

if (!dbInfoOk) {
  displayDbNotOkText();
} else {

  // Hämta valdata från Neo4j
  dbQuery.use('riksdagsval-neo4j');
  let valData = await dbQuery('MATCH (n:Partiresultat) WHERE n.roster2022 IS NOT NULL RETURN n');

  // Hämta geodata från MySQL för att koppla kommun till län
  dbQuery.use('geo-mysql');
  let geoData = await dbQuery('SELECT municipality, county FROM geoData');

  // Koppla ihop kommun med län via geodata
  let kommunLan = {};
  for (let geo of geoData) {
    if (geo.municipality && geo.county) {
      kommunLan[geo.municipality] = geo.county;
    }
  }

  // Aggregera röster per län och parti
  let lansRoster = {};
  for (let val of valData) {
    let lan = kommunLan[val.kommun];
    if (!lan) continue;
    if (!lansRoster[lan]) lansRoster[lan] = {};
    if (!lansRoster[lan][val.parti]) lansRoster[lan][val.parti] = 0;
    lansRoster[lan][val.parti] += val.roster2022;
  }

  // Omvandla till array
  let lansData = Object.entries(lansRoster).map(([lan, partier]) => ({
    lan,
    ...partier
  }));

  addMdToPage(`## Tabell: Röster per län och parti 2022`);
  tableFromData({ data: lansData });

  // Diagram - topp 5 partier per län
  let diagramData = lansData.map(x => ({
    lan: x.lan,
    S: x['Arbetarepartiet-Socialdemokraterna'] || 0,
    M: x['Moderaterna'] || 0,
    SD: x['Sverigedemokraterna'] || 0,
    C: x['Centerpartiet'] || 0,
    V: x['Vänsterpartiet'] || 0
  }));

  addMdToPage(`## Diagram: Röster per parti och län 2022`);

  drawGoogleChart({
    type: 'BarChart',
    data: makeChartFriendly(diagramData, 'lan', 'S', 'M', 'SD', 'C', 'V'),
    options: {
      title: 'Röster per parti och län 2022',
      hAxis: { title: 'Antal röster' },
      vAxis: { title: 'Län' },
      width: 900,
      height: 600
    }
  });

}