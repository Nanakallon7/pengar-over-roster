import dbInfoOk, { displayDbNotOkText } from "./dbInfoOk.js";

addMdToPage(`
# Jämförelse mellan 2018 och 2022

Här jämför vi hur rösterna har förändrats mellan de två senaste valen.
Alla värden är i PROCENT så att man kan jämföra rättvist.
`);

if (!dbInfoOk) {
  displayDbNotOkText();
} else {

  // Hämta valdata
  dbQuery.use('riksdagsval-neo4j');
  let valData = await dbQuery('MATCH (n:Partiresultat) RETURN n');

  // Räkna ut totala röster per kommun för 2018 och 2022
  let total2018 = {};
  let total2022 = {};

  for (let val of valData) {
    let kommun = val.kommun;
    
    if (!total2018[kommun]) total2018[kommun] = 0;
    if (!total2022[kommun]) total2022[kommun] = 0;
    
    total2018[kommun] = total2018[kommun] + (val.roster2018 || 0);
    total2022[kommun] = total2022[kommun] + (val.roster2022 || 0);
  }

  // Räkna ut procent för varje parti båda åren
  let jamforData = [];

  for (let val of valData) {
    let kommun = val.kommun;
    let parti = val.parti;
    let roster2018 = val.roster2018 || 0;
    let roster2022 = val.roster2022 || 0;
    
    let proc2018 = (roster2018 / total2018[kommun]) * 100;
    let proc2022 = (roster2022 / total2022[kommun]) * 100;
    let forandring = proc2022 - proc2018;
    
    jamforData.push({
      kommun: kommun,
      parti: parti,
      proc_2018: proc2018.toFixed(1),
      proc_2022: proc2022.toFixed(1),
      forandring: forandring.toFixed(1)
    });
  }

  addMdToPage(`## Tabell: Förändring mellan 2018 och 2022 (procentenheter)`);
  tableFromData({ data: jamforData.slice(0, 30) });

  // Välj ut några stora partier
  let partier = [
    'Arbetarepartiet-Socialdemokraterna',
    'Moderaterna', 
    'Sverigedemokraterna',
    'Centerpartiet',
    'Vänsterpartiet'
  ];
  
  let dataForDiagram = jamforData.filter(x => partier.includes(x.parti));

  addMdToPage(`
  ## Diagram: Förändring i röstandel 2018 → 2022
  Negativa värden = partiet tappade röster. Positiva värden = partiet ökade.
  `);

  drawGoogleChart({
    type: 'BarChart',
    data: makeChartFriendly(
      dataForDiagram.map(x => ({ 
        parti: x.parti.replace('Arbetarepartiet-', ''), 
        forandring: parseFloat(x.forandring) 
      })),
      'parti', 'forandring'
    ),
    options: {
      title: 'Förändring i röstandel 2018 → 2022 (procentenheter)',
      hAxis: { title: 'Förändring (procentenheter)' },
      legend: 'none',
      width: 900,
      height: 500
    }
  });
}
