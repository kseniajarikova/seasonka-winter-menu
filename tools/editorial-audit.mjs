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
    const expected=`День ${index+1}`;
    if(day.name!==expected)errors.push(`Неделя ${weekNumber}: ${day.name} вместо ${expected}`);
    if(!day.tomorrowPrep?.items?.length)errors.push(`Неделя ${weekNumber}, ${expected}: нет вечернего перехода`);
  });
  if(!week.weekStartPrep?.items?.length)errors.push(`Неделя ${weekNumber}: нет дня заготовок`);
  if(week.prepBlocks?.length!==2)errors.push(`Неделя ${weekNumber}: ожидалось 2 подробных блока заготовок`);

  const visiblePrep=[week.weekStartPrep,...week.days.map(day=>day.tomorrowPrep),...(week.prepBlocks||[])];
  const prepText=JSON.stringify(visiblePrep);
  if(/разделить[^.]{0,120}(?:\d+\s*г\s*сух|из\s*\d+\s*г\s*сух)/i.test(prepText)){
    errors.push(`Неделя ${weekNumber}: готовую крупу делят по сухому весу`);
  }
}

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

const w1Prep=JSON.stringify(w1.prepBlocks);
for(const recipeName of ['Морковь по-корейски','Каджи-намуль','Кимчи-стайл','Грибной банчан']){
  if(!new RegExp(recipeName,'i').test(w1Prep))errors.push(`В заготовках недели 1 нет полного блока «${recipeName}»`);
}

const noodleMeals=[w1.days[4].meals.find(meal=>meal.slot==='Ужин'),data.weeks['3'].days[2].meals.find(meal=>meal.slot==='Ужин')];
for(const noodleMeal of noodleMeals){
  if(!noodleMeal.steps.some(step=>/масл[ао].*отдельн|отдельн.*масл[ао]/i.test(step))){
    errors.push(`${noodleMeal.title}: нет инструкции для хранения второй порции лапши с маслом`);
  }
}

console.log(`Недели: ${weeks.length}`);
console.log(`Дни: ${weeks.reduce((sum,[,week])=>sum+week.days.length,0)}`);
console.log(`Вечерние переходы: ${weeks.reduce((sum,[,week])=>sum+1+week.days.length,0)}`);
console.log(`Подробные блоки заготовок: ${weeks.reduce((sum,[,week])=>sum+(week.prepBlocks?.length||0),0)}`);

if(errors.length){
  console.error('\nРедакторский аудит: ошибки');
  errors.forEach(error=>console.error(`- ${error}`));
  process.exitCode=1;
}else{
  console.log('Редакторский аудит: OK');
}
