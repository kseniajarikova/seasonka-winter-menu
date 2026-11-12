import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../menu-data.js',import.meta.url),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context);

const data=context.window.MENU_DATA;
const errors=[];
const strings=[];

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
    if(day.name!==expected)errors.push(`Неделя ${weekNumber}: ${day.name} вместо ${expected}`);
    if(index!==2&&!day.tomorrowPrep?.items?.length)errors.push(`Неделя ${weekNumber}, ${expected}: нет вечернего перехода`);
    if(index===2&&day.tomorrowPrep?.items?.length)errors.push(`Неделя ${weekNumber}, ${expected}: переход должен быть объединён с вечерней заготовкой`);
  });
  if(!week.weekStartPrep?.items?.length)errors.push(`Неделя ${weekNumber}: нет дня заготовок`);
  if(week.prepBlocks?.length!==2)errors.push(`Неделя ${weekNumber}: ожидалось 2 подробных блока заготовок`);

  const visiblePrep=[week.weekStartPrep,...week.days.map(day=>day.tomorrowPrep),...(week.prepBlocks||[])];
  const prepText=JSON.stringify(visiblePrep);
  if(/разделить[^.]{0,120}(?:\d+\s*г\s*сух|из\s*\d+\s*г\s*сух)/i.test(prepText)){
    errors.push(`Неделя ${weekNumber}: готовую крупу делят по сухому весу`);
  }
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
  const allowedMin=Math.max(1,start-1),allowedMax=weekNumber==='1'?11:start+7;
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
    const dayWithoutFinalPrep={...day,...(weekNumber==='1'&&index===6?{tomorrowPrep:null}:{})};
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
for(const required of ['Куриную грудку 400 г','Картофель 400 г','брокколи 300 г','Фарш 300 г','Перловку 85 г','Дайкон 100 г']){
  if(!new RegExp(required,'i').test(w2Start))errors.push(`В заготовках перед днём 8 нет: ${required}`);
}
const crumble=w2.days[1].meals.find(meal=>meal.slot==='Завтрак');
if(!crumble.ingredients.some(item=>/^кардамон/i.test(item))||!crumble.steps.some(step=>/Овсяная крошка/i.test(step)))errors.push('День 9: овсяная крошка должна содержать овсянку и кардамон');
const millet=w2.days[3].meals.find(meal=>meal.slot==='Завтрак');
if(!millet.ingredients.some(item=>/^бадьян/i.test(item)))errors.push('День 11: в пшённой каше нет бадьяна');
const w2Groceries=JSON.stringify(w2.groceries);
if(!/Кардамон/i.test(w2Groceries)||!/Бадьян/i.test(w2Groceries))errors.push('Неделя 2: специи не попали в список покупок');

for(const [weekNumber,week] of weeks){
  week.days.forEach(day=>day.meals.forEach(recipe=>recipe.ingredients.forEach(item=>{
    if(item.includes(';'))errors.push(`Неделя ${weekNumber}, ${day.name}, ${recipe.title}: точка с запятой разобьёт ингредиент на две строки`);
  })));
}
if(strings.some(item=>/(?<![а-яё])во день/i.test(item.text)))errors.push('Осталась формулировка «во день»');

const daikonLinks=[
  w2.days[2].meals.find(meal=>meal.slot==='Ужин'),w2.days[3].meals.find(meal=>meal.slot==='Обед'),
  w2.days[5].meals.find(meal=>meal.slot==='Ужин'),w2.days[6].meals.find(meal=>meal.slot==='Обед'),
  data.weeks['3'].days[0].meals.find(meal=>meal.slot==='Ужин'),data.weeks['3'].days[1].meals.find(meal=>meal.slot==='Обед')
];
if(daikonLinks.some(recipe=>!recipe?.prepSource?.id?.includes('daikon')))errors.push('Не у всех блюд с заранее приготовленным дайконом есть ссылка на заготовку');

console.log(`Недели: ${weeks.length}`);
console.log(`Дни: ${weeks.reduce((sum,[,week])=>sum+week.days.length,0)}`);
console.log(`Точки таймлайна: ${weeks.reduce((sum,[,week])=>sum+1+week.days.filter(day=>day.morningPrep?.items?.length).length+week.days.filter(day=>day.tomorrowPrep?.items?.length).length,0)}`);
console.log(`Подробные блоки заготовок: ${weeks.reduce((sum,[,week])=>sum+(week.prepBlocks?.length||0),0)}`);

if(errors.length){
  console.error('\nРедакторский аудит: ошибки');
  errors.forEach(error=>console.error(`- ${error}`));
  process.exitCode=1;
}else{
  console.log('Редакторский аудит: OK');
}
