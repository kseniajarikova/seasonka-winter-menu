import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../menu-data.js',import.meta.url),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context);

const data=context.window.MENU_DATA;
const errors=[];
const strings=[];
const recipePrepSources=recipe=>recipe.prepSources?.length?recipe.prepSources:(recipe.prepSource?[recipe.prepSource]:[]);

function walk(value,path=[]){
  if(typeof value==='string')strings.push({path:path.join('.'),text:value});
  else if(Array.isArray(value))value.forEach((item,index)=>walk(item,[...path,index]));
  else if(value&&typeof value==='object')Object.entries(value).forEach(([key,item])=>walk(item,[...path,key]));
}

walk(data);

const weeks=Object.entries(data.weeks);
if(weeks.length!==3)errors.push(`Ожидалось 3 недели, найдено ${weeks.length}`);

for(const [weekNumber,week] of weeks){
  if(week.days.length!==7)errors.push(`Неделя ${weekNumber}: ожидалось 7 дней`);
  week.days.forEach((day,index)=>{
    const expected=`День ${(Number(weekNumber)-1)*7+index+1}`;
    const mergedIntoDetailedBlock=index===2||(index===6&&week.endPrepBlock);
    if(day.name!==expected)errors.push(`Неделя ${weekNumber}: ${day.name} вместо ${expected}`);
    if(!mergedIntoDetailedBlock&&!day.tomorrowPrep?.items?.length)errors.push(`Неделя ${weekNumber}, ${expected}: нет вечернего перехода`);
    if(mergedIntoDetailedBlock&&day.tomorrowPrep?.items?.length)errors.push(`Неделя ${weekNumber}, ${expected}: переход должен быть объединён с подробной вечерней заготовкой`);
  });
  if(!week.weekStartPrep?.items?.length)errors.push(`Неделя ${weekNumber}: нет дня заготовок`);
  if(week.prepBlocks?.length!==2)errors.push(`Неделя ${weekNumber}: ожидалось 2 подробных блока заготовок`);

  const visiblePrep=[week.weekStartPrep,...week.days.flatMap(day=>[day.morningPrep,day.tomorrowPrep]),...(week.prepBlocks||[]),week.endPrepBlock].filter(Boolean);
  const prepText=JSON.stringify(visiblePrep);
  if(/разделить[^.]{0,120}(?:\d+\s*г\s*сух|из\s*\d+\s*г\s*сух)/i.test(prepText)){
    errors.push(`Неделя ${weekNumber}: готовую крупу делят по сухому весу`);
  }

  const prepIds=new Set();
  const collectIds=value=>{
    if(Array.isArray(value))value.forEach(collectIds);
    else if(value&&typeof value==='object'){
      if(value.id)prepIds.add(value.id);
      Object.values(value).forEach(collectIds);
    }
  };
  collectIds(visiblePrep);
  week.days.forEach(day=>day.meals.forEach(recipe=>{
    for(const prepSource of recipePrepSources(recipe)){
      if(!prepIds.has(prepSource.id))errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: ссылка ведёт на отсутствующую заготовку ${prepSource.id}`);
    }
    const preprepared=recipe.ingredients.some(item=>/(?:сварен|запеч[её]н|заготовлен|замаринован|приготовлен|подготовлен)[а-яё\s]*(?:в день|вечером|накануне)|из заготовки/i.test(item));
    if(preprepared&&!recipe.source&&!recipePrepSources(recipe).length){
      errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: заранее приготовленный компонент остался без ссылки на процесс`);
    }
  }));
}

const expectedMidweekDays={1:3,2:10,3:17};
for(const [weekNumber,week] of weeks){
  const mid=week.prepBlocks?.[1];
  const expected=expectedMidweekDays[weekNumber];
  if(!mid?.title?.includes(`Вечер дня ${expected}`))errors.push(`Неделя ${weekNumber}: неверное время большой заготовки`);
  const midText=JSON.stringify(mid);
  if(/Утром дня/i.test(midText))errors.push(`Неделя ${weekNumber}: утренняя задача попала в вечернюю заготовку`);
  if(new RegExp(`вечером дня (?!${expected}(?!\\d))\\d+`,'i').test(midText))errors.push(`Неделя ${weekNumber}: будущий вечер попал в заготовку дня ${expected}`);

  const numbers=[];
  const collectNumbers=value=>{
    if(typeof value==='string')for(const match of value.matchAll(/(?<![а-яё])(?:день|дня|днём|дню|дне)\s+(\d+)(?!\d)/gi))numbers.push(Number(match[1]));
    else if(Array.isArray(value))value.forEach(collectNumbers);
    else if(value&&typeof value==='object')Object.values(value).forEach(collectNumbers);
  };
  collectNumbers(week);
  const start=(Number(weekNumber)-1)*7+1;
  const allowedMin=Math.max(1,start-1),allowedMax=weekNumber==='1'?11:weekNumber==='2'?16:start+7;
  const invalid=[...new Set(numbers.filter(number=>number<allowedMin||number>allowedMax))];
  if(invalid.length)errors.push(`Неделя ${weekNumber}: несогласованные номера дней ${invalid.join(', ')}`);

  week.days.forEach((day,index)=>{
    const current=Number(day.name.match(/\d+/)?.[0]);
    const future=[];
    const collectFuture=value=>{
      if(typeof value==='string')for(const match of value.matchAll(/(?<![а-яё])(?:день|дня|днём|дню|дне)\s+(\d+)(?!\d)/gi)){
        const number=Number(match[1]);
        if(number>current+1)future.push(number);
      }
      else if(Array.isArray(value))value.forEach(collectFuture);
      else if(value&&typeof value==='object')Object.values(value).forEach(collectFuture);
    };
    const dayWithoutFinalPrep={...day,...(week.endPrepBlock&&index===6?{tomorrowPrep:null}:{})};
    collectFuture(dayWithoutFinalPrep);
    if(future.length)errors.push(`Неделя ${weekNumber}, ${day.name}: ссылка вперёд на день ${[...new Set(future)].join(', ')}`);
  });
}

if(!data.weeks['1'].days[2].morningPrep?.items?.some(item=>/Морковь по-корейски/i.test(item)))errors.push('День 3: нет утренней моркови по-корейски');
if(!data.weeks['1'].days[4].morningPrep?.items?.some(item=>/Кимчи-стайл/i.test(item)))errors.push('День 5: нет отдельной утренней заготовки кимчи-стайл');
if(!data.weeks['3'].days[2].morningPrep?.items?.some(item=>/Пекинскую капусту/i.test(item)))errors.push('День 17: нет отдельной утренней заготовки кимчи-стайл');

const forbiddenWeekdays=/понедель|вторник|вторнич|среда|среду|среды|средов|четверг|четвергов|пятниц|пятнич|суббот|воскрес/i;
for(const item of strings){
  if(forbiddenWeekdays.test(item.text))errors.push(`${item.path}: осталось название дня недели`);
  if(/после разогрева(?:\s|[.,])/i.test(item.text))errors.push(`${item.path}: использовать «после разогревания»`);
  const spinachSentences=item.text.split(/(?<=[.!?])\s+/).filter(sentence=>/шпинат/i.test(sentence));
  if(spinachSentences.some(sentence=>/размороз|(?:переложить[^.]*шпинат|шпинат[^.]*переложить)[^.]*холодильник/i.test(sentence))){
    errors.push(`${item.path}: шпинат не нужно размораживать заранее`);
  }
}

const w1=data.weeks['1'];
const bibimbapDinner=w1.days[3].meals.find(meal=>meal.slot==='Ужин');
const bibimbapLunch=w1.days[4].meals.find(meal=>meal.slot==='Обед');
if(!bibimbapDinner.ingredients.some(item=>/^яйцо — 1 шт/i.test(item)))errors.push('Пибимпап дня 4: должно быть 1 яйцо');
if(!bibimbapLunch.ingredients.some(item=>/^яйцо — 1 шт/i.test(item)))errors.push('Пибимпап дня 5: должно быть 1 яйцо');

const w1Prep=JSON.stringify([w1.prepBlocks,...w1.days.map(day=>day.morningPrep).filter(Boolean)]);
for(const recipeName of ['Морковь по-корейски','Каджи-намуль','Кимчи-стайл','Грибной банчан']){
  if(!new RegExp(recipeName,'i').test(w1Prep))errors.push(`В заготовках недели 1 нет полного блока «${recipeName}»`);
}

const noodleMeals=[w1.days[4].meals.find(meal=>meal.slot==='Ужин'),data.weeks['3'].days[2].meals.find(meal=>meal.slot==='Ужин')];
for(const noodleMeal of noodleMeals){
  if(!noodleMeal.steps.some(step=>/масл[ао].*отдельн|отдельн.*масл[ао]/i.test(step))){
    errors.push(`${noodleMeal.title}: нет инструкции для хранения второй порции лапши с маслом`);
  }
}

const w2=data.weeks['2'];
const w2Start=JSON.stringify(w2.prepBlocks[0]);
for(const required of ['Филе куриного бедра без кожи и кости 400 г','Картофель 400 г','брокколи 300 г','Фарш 300 г','Перловку 85 г','Дайкон 100 г']){
  if(!new RegExp(required,'i').test(w2Start))errors.push(`В заготовках перед днём 8 нет: ${required}`);
}
if(JSON.stringify(w1.endPrepBlock)!==JSON.stringify(w2.prepBlocks[0]))errors.push('Блок вечера дня 7 различается в конце недели 1 и начале недели 2');
const crumble=w2.days[1].meals.find(meal=>meal.slot==='Завтрак');
if(!crumble.ingredients.some(item=>/^кардамон/i.test(item))||!crumble.steps.some(step=>/Овсяная крошка/i.test(step)))errors.push('День 9: овсяная крошка должна содержать овсянку и кардамон');
const millet=w2.days[3].meals.find(meal=>meal.slot==='Завтрак');
if(!millet.ingredients.some(item=>/^бадьян/i.test(item)))errors.push('День 11: в пшённой каше нет бадьяна');
const w2Groceries=JSON.stringify(w2.groceries);
if(!/Кардамон/i.test(w2Groceries)||!/Бадьян/i.test(w2Groceries))errors.push('Неделя 2: специи не попали в список покупок');

const w3=data.weeks['3'];
if(JSON.stringify(w2.endPrepBlock)!==JSON.stringify(w3.prepBlocks[0]))errors.push('Блок вечера дня 14 различается в конце недели 2 и начале недели 3');
const day15Lunch=w3.days[0].meals.find(meal=>meal.slot==='Обед');
const day15Dinner=w3.days[0].meals.find(meal=>meal.slot==='Ужин');
if(!day15Lunch?.source?.label?.includes('ужина дня 14'))errors.push('Обед дня 15: не указан источник из ужина дня 14');
if(!recipePrepSources(day15Dinner).some(source=>source.id==='prep-w3-day15-dinner'))errors.push('Ужин дня 15: нет ссылки на вечернюю заготовку дня 14');

for(const [weekNumber,week] of weeks){
  week.days.forEach(day=>day.meals.forEach(recipe=>recipe.ingredients.forEach(item=>{
    if(item.includes(';'))errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: точка с запятой разобьёт ингредиент на две строки`);
  })));
}
if(strings.some(item=>/(?<![а-яё])во день/i.test(item.text)))errors.push('Осталась формулировка «во день»');
if(strings.some(item=>/разогреванияния/i.test(item.text)))errors.push('Осталась опечатка «разогреванияния»');
if(strings.some(item=>/(?:рисов(?:ый|ого) уксус(?:а)? 23 мл|вод[уы] 33 мл|рисов(?:ый|ого) уксус(?:а)? 13 мл|вод[уы] 27 мл)/i.test(item.text))){
  errors.push('В рецептах дайкона остались неокруглённые объёмы жидкости');
}
const standardDaikon=strings.filter(item=>/Дайкон 100 г|маринованного дайкона нарезать 100 г/i.test(item.text)).filter(item=>/сахар 3 г/i.test(item.text));
if(standardDaikon.some(item=>!/уксус(?:а)? 25 мл/i.test(item.text)||!/вод[уы] 35 мл/i.test(item.text)))errors.push('Не во всех стандартных рецептах дайкона указано 25 мл уксуса, 35 мл воды и 3 г сахара');

const daikonLinks=[
  w2.days[2].meals.find(meal=>meal.slot==='Ужин'),w2.days[3].meals.find(meal=>meal.slot==='Обед'),
  w2.days[5].meals.find(meal=>meal.slot==='Ужин'),w2.days[6].meals.find(meal=>meal.slot==='Обед'),
  data.weeks['3'].days[0].meals.find(meal=>meal.slot==='Ужин'),data.weeks['3'].days[1].meals.find(meal=>meal.slot==='Обед')
];
if(daikonLinks.some(recipe=>!recipePrepSources(recipe).some(source=>source.id.includes('daikon'))))errors.push('Не у всех блюд с заранее приготовленным дайконом есть ссылка на заготовку');

const cutletDinner=w3.days[1].meals.find(meal=>meal.slot==='Ужин');
if(!/куриного бедра/i.test(cutletDinner?.title||'')||!cutletDinner?.ingredients.some(item=>/фарш из куриного бедра/i.test(item))){
  errors.push('День 16: котлеты должны быть из куриного бедра');
}
if(cutletDinner?.ingredients.some(item=>/грудк/i.test(item))||cutletDinner?.steps.some(step=>/грудк/i.test(step))){
  errors.push('День 16: в котлетах осталась куриная грудка');
}

for(const [weekNumber,week] of weeks){
  week.days.forEach(day=>day.meals.forEach(recipe=>{
    const text=JSON.stringify(recipe);
    const rawPoultry=recipe.ingredients.some(item=>/^(?:куриная грудка|куриное филе|филе куриного бедра|фарш из куриного бедра|филе индейки|фарш индейки)/i.test(item));
    if(rawPoultry&&!/74\s*°C/i.test(recipe.steps.join(' ')))errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: для сырой птицы не указаны 74 °C`);
    if(/сметанн(?:ом|ый|ого) соус/i.test(text)&&!/(?:не кипятить|не доводя до бурного кипения|без бурного кипения)/i.test(text))errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: нет защиты сметанного соуса от бурного кипения`);
  }));
}

const fishDinners=[w1.days[1],w1.days[5],w2.days[3],w2.days[5],w3.days[5]].map(day=>day.meals.find(meal=>meal.slot==='Ужин'));
if(fishDinners.some(recipe=>!/63\s*°C/i.test(recipe.steps.join(' '))))errors.push('Не во всех горячих рыбных блюдах указаны 63 °C и щадящее приготовление');
const shrimpDinner=w3.days[2].meals.find(meal=>meal.slot==='Ужин');
if(!shrimpDinner.steps.some(step=>/1–2 минуты с каждой стороны/i.test(step)))errors.push('День 17: для креветок не указан короткий режим приготовления');
if(strings.some(item=>/куриная грудка для супа|фарш индейки[^.]*дня 16|котлет[ау] из индейки/i.test(item.text)))errors.push('После кулинарной правки осталась старая птица в таймлайне');
const troutDinner=w1.days[5].meals.find(meal=>meal.slot==='Ужин');
if(!troutDinner.ingredients.some(item=>/^перловка — 220 г сухой/i.test(item))||!w1.days[4].tomorrowPrep.items.some(item=>/Перловку 220 г залить 900 мл/i.test(item)))errors.push('День 6: вес перловки в рецепте и вечерней заготовке не совпадает');
const soupDinner=w1.days[4].meals.find(meal=>meal.slot==='Ужин');
if(soupDinner.ingredients.filter(item=>/^чеснок/i.test(item)).length!==1||soupDinner.ingredients.filter(item=>/^имбирь/i.test(item)).length!==1||soupDinner.ingredients.filter(item=>/^соевый соус/i.test(item)).length!==1)errors.push('День 5: в супе задвоены общие ингредиенты супа и банчанов');
const shrimpLunch=w3.days[3].meals.find(meal=>meal.slot==='Обед');
if(!shrimpLunch.ingredients.some(item=>/^кимчи-стайл — 100 г/i.test(item))||!w3.days[2].morningPrep.items.some(item=>/100 г оставить отдельно для обеда/i.test(item)))errors.push('Дни 17–18: порция кимчи-стайл не согласована');

const requiredPrepLinks={
  '1-0-Обед':['prep-w1-lunch-chicken','prep-w1-beet'],
  '1-0-Ужин':['prep-w1-chicken-marinade','prep-w1-squash','prep-w1-rice'],
  '1-4-Ужин':['prep-w1-day5-banchan'],
  '2-3-Ужин':['prep-w2-day11-dinner','prep-w2-cod-day11'],
  '3-0-Ужин':['prep-w3-day15-dinner','prep-w3-daikon-15','prep-w3-chicken-day15'],
  '3-2-Ужин':['prep-w3-day17-kimchi']
};
for(const [key,ids] of Object.entries(requiredPrepLinks)){
  const [weekNumber,dayIndex,slot]=key.split('-');
  const recipe=data.weeks[weekNumber].days[Number(dayIndex)].meals.find(meal=>meal.slot===slot);
  const actual=new Set(recipePrepSources(recipe).map(source=>source.id));
  for(const id of ids)if(!actual.has(id))errors.push(`${recipe.title}: нет ссылки на ${id}`);
}

console.log(`Недели: ${weeks.length}`);
console.log(`Дни: ${weeks.reduce((sum,[,week])=>sum+week.days.length,0)}`);
console.log(`Точки таймлайна: ${weeks.reduce((sum,[,week])=>sum+1+week.days.filter(day=>day.morningPrep?.items?.length).length+week.days.filter(day=>day.tomorrowPrep?.items?.length).length,0)}`);
console.log(`Подробные блоки заготовок: ${weeks.reduce((sum,[,week])=>sum+(week.prepBlocks?.length||0)+(week.endPrepBlock?1:0),0)}`);

if(errors.length){
  console.error('\nРедакторский аудит: ошибки');
  errors.forEach(error=>console.error(`- ${error}`));
  process.exitCode=1;
}else{
  console.log('Редакторский аудит: OK');
}

