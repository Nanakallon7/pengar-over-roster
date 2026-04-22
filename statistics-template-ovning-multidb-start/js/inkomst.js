import dbInfoOk, { displayDbNotOkText } from "./dbInfoOk.js";

addMdToPage(`
# Inkomst & Röstning
## Finns det ett samband mellan medelinkomst och hur folk röstar?

Här undersöker vi om kommuner med högre medelinkomst tenderar att rösta
mer på vissa partier i riksdagsvalet 2022.
`);

if (!dbInfoOk) {
  displayDbNotOkText();
} else {

  // Hämta inkomstdata från MongoDB
  dbQuery.use('kommun-info-mongodb');
  let inkomst = await dbQuery.collection('incomeByKommun').find({});

  // Hämta valdata från Neo4j
  dbQuery.use('riksdagsval-neo4j');
  let valData = await dbQuery('MATCH (n:Partiresultat) WHERE n.roster2022 IS NOT NULL RETURN n');

  // Filtrera bara "totalt" från inkomstdata
  let inkomstTotalt = inkomst.filter(x => x.kon === 'totalt');

  // Koppla ihop inkomst med valdata per kommun
  let kombinerad = valData
    .map(({ kommun, roster2022, parti }) => {
      let ink = inkomstTotalt.find(x => x.kommun === kommun);
      if (!ink) return null;
      return { kommun, parti, roster2022, medelinkomst: ink.medelInkomst2022 };
    })
    .filter(x => x !== null);

  addMdToPage(`## Tabell: Inkomst & röster per kommun`);
  tableFromData({ data: kombinerad.slice(0, 30) });

  // Skapa diagram - medelinkomst vs röster för Socialdemokraterna
  let sData = kombinerad.filter(x => x.parti === 'Arbetarepartiet-Socialdemokraterna');

  addMdToPage(`## Diagram: Medelinkomst vs Socialdemokraternas röster 2022`);

  drawGoogleChart({
    type: 'ScatterChart',
    data: makeChartFriendly(
      sData.map(x => ({ medelinkomst: x.medelinkomst, roster2022: x.roster2022 })),
      'medelinkomst', 'roster2022'
    ),
    options: {
      title: 'Medelinkomst vs Socialdemokraternas röster per kommun 2022',
      hAxis: { title: 'Medelinkomst (tkr)' },
      vAxis: { title: 'Antal röster 2022' },
      legend: 'none',
      width: 900,
      height: 500
    }
  });

}