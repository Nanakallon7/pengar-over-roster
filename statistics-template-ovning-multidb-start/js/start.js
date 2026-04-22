import dbInfoOk, { displayDbNotOkText } from "./dbInfoOk.js";

addMdToPage(`
# Pengar & Politik
## Påverkar inkomst hur svenskar röstar?

I det här projektet undersöker vi sambandet mellan medelinkomst och röstning
i Sveriges riksdagsval 2022. Påverkar hur mycket folk tjänar vilket parti de röstar på?

Vi använder data från:
- Länsinfo (SQLite)
- Medelinkomst per kommun (MongoDB)
- Riksdagsvaldata 2022 (Neo4j)
- Geodata om kommuner (MySQL)
`);

if (!dbInfoOk) {
  displayDbNotOkText();
} else {

  addMdToPage(`## Länsöversikt`);
  dbQuery.use('counties-sqlite');
  let lansData = await dbQuery('SELECT * FROM countyInfo');
  tableFromData({ data: lansData });

  addMdToPage(`## Medelinkomst per kommun`);
  dbQuery.use('kommun-info-mongodb');
  let inkomst = await dbQuery.collection('incomeByKommun').find({}).limit(25);
  tableFromData({ data: inkomst });

  addMdToPage(`## Valresultat 2022 per kommun`);
  dbQuery.use('riksdagsval-neo4j');
  let valData = await dbQuery('MATCH (n:Partiresultat) RETURN n LIMIT 25');
  tableFromData({
    data: valData.map(({ ids, kommun, roster2018, roster2022, parti, labels }) => ({
      ids: ids.identity, kommun, roster2018, roster2022, parti, labels
    }))
  });

}