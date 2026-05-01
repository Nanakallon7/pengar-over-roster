import dbInfoOk, { displayDbNotOkText } from "./dbInfoOk.js";

addMdToPage(`
# Inkomst och röster - rättvis jämförelse med procent

Här använder jag procent istället för totala röstetal så att jag kan jämföra små och stora kommuner på samma sätt.
`);

if (!dbInfoOk) {
  displayDbNotOkText();
} else {

  // Hämta valdata från Neo4j
  dbQuery.use('riksdagsval-neo4j');
  let valData = await dbQuery('MATCH (n:Partiresultat) RETURN n');

  // Hämta inkomstdata från MongoDB
  dbQuery.use('kommun-info-mongodb');
  let inkomst = await dbQuery.collection('incomeByKommun').find({});
  let inkomstTotalt = inkomst.filter(x => x.kon === 'totalt');

  // Räkna ut totala röster per kommun
  let totalRoster = {};

  for (let val of valData) {
    let kommun = val.kommun;
    if (!totalRoster[kommun]) {
      totalRoster[kommun] = 0;
    }
    totalRoster[kommun] = totalRoster[kommun] + val.roster2022;
  }

  // Räkna ut procent för varje parti
  let dataMedProcent = [];

  for (let val of valData) {
    let kommun = val.kommun;
    let parti = val.parti;
    let roster2022 = val.roster2022;
    
    let ink = inkomstTotalt.find(x => x.kommun === kommun);
    if (!ink) continue;
    
    let procent = (roster2022 / totalRoster[kommun]) * 100;
    
    dataMedProcent.push({
      kommun: kommun,
      parti: parti,
      medelinkomst: ink.medelInkomst2022,
      rostandel_procent: procent
    });
  }

  addMdToPage(`## Tabell: Inkomst och röstandel (%)`);
  tableFromData({ data: dataMedProcent.slice(0, 30) });

  // Diagram för Socialdemokraterna
  let sData = dataMedProcent.filter(x => x.parti === 'Arbetarepartiet-Socialdemokraterna');

  drawGoogleChart({
    type: 'ScatterChart',
    data: makeChartFriendly(
      sData.map(x => ({ inkomst: x.medelinkomst, roster: x.rostandel_procent })),
      'Medelinkomst (tkr)', 'Röstandel (%)'
    ),
    options: {
      title: 'Inkomst vs Socialdemokraternas röster (%)',
      hAxis: { title: 'Medelinkomst (tusentals kronor)' },
      vAxis: { title: 'Andel röster (%)' },
      legend: 'none',
      width: 900,
      height: 500
    }
  });

  // Diagram för Moderaterna
  let mData = dataMedProcent.filter(x => x.parti === 'Moderaterna');

  drawGoogleChart({
    type: 'ScatterChart',
    data: makeChartFriendly(
      mData.map(x => ({ inkomst: x.medelinkomst, roster: x.rostandel_procent })),
      'Medelinkomst (tkr)', 'Röstandel (%)'
    ),
    options: {
      title: 'Inkomst vs Moderaternas röster (%)',
      hAxis: { title: 'Medelinkomst (tkr)' },
      vAxis: { title: 'Andel röster (%)' },
      legend: 'none',
      width: 900,
      height: 500
    }
  });
}
