(()=>{
  'use strict';
  const data=window.MENU_DATA;
  const state={week:1,people:1,view:'menu',query:'',expanded:false};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const weekNames={1:'Первая неделя',2:'Вторая неделя',3:'Третья неделя'};
  const peopleSelect=$('#peopleSelect');
  const fractions={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3};
  const choiceKey=week=>`seasonka-choice-${week}`;
  const peopleWord=n=>n===1?'человека':n>=2&&n<=4?'человека':'человек';
  const plural=(n,one,few,many)=>{const m10=n%10,m100=n%100;return m100>=11&&m100<=14?many:m10===1?one:m10>=2&&m10<=4?few:many};
  function splitIngredient(text){return String(text).split(/;\s*/).flatMap(part=>part.split(/,\s+(?=[\p{L}][^,;]{0,55}(?:—\s*\d|\d+(?:[.,]\d+)?\s*(?:г|мл|кг|шт\.?|ст\.?\s*л|ч\.?\s*л)))/u)).map(x=>x.trim()).filter(Boolean)}
  const checkedKey=(week,people)=>`seasonka-week-${week}-people-${people}`;
  const selectionKey=(week,people)=>`seasonka-selected-${week}-people-${people}`;
  function scaleText(text,people){
    if(people===1)return text;
    const numeric=raw=>{const [n,d='1']=raw.replace(',','.').split('/');const value=fractions[raw]??Number(n)/Number(d);return String(Math.round(value*people*10)/10).replace('.',',')};
    const counted=/(?<![\d/.,])(\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])(\s+)(?:(готов\p{L}*)\s+)?(бан\p{L}*|штук\p{L}*|яйц\p{L}*|котлет\p{L}*|порци\p{L}*|зубчик\p{L}*)/giu;
    const nounForms={банка:['банка','банки','банок'],яйцо:['яйцо','яйца','яиц'],котлета:['котлета','котлеты','котлет'],порция:['порция','порции','порций'],зубчик:['зубчик','зубчика','зубчиков'],штука:['штука','штуки','штук']};
    const pluralized=String(text).replace(counted,(whole,raw,space,adjective,unit)=>{
      const value=Math.round((fractions[raw]??Number(raw.replace(',','.').split('/')[0])/Number(raw.includes('/')?raw.split('/')[1]:1))*people*10)/10;
      const lower=unit.toLowerCase(),key=lower.startsWith('бан')?'банка':lower.startsWith('яйц')?'яйцо':lower.startsWith('котлет')?'котлета':lower.startsWith('порци')?'порция':lower.startsWith('зубчик')?'зубчик':lower.startsWith('штук')?'штука':lower;
      const forms=nounForms[key];if(!forms)return `${numeric(raw)}${space}${adjective?adjective+' ':''}${unit}`;
      const integer=Math.round(value),last2=integer%100,last=integer%10,index=!Number.isInteger(value)||last2>=11&&last2<=14?2:last===1?0:last>=2&&last<=4?1:2;
      const adj=adjective?((index===0?'готовая':index===1?'готовые':'готовых')+' '):'';
      return `${String(value).replace('.',',')}${space}${adj}${forms[index]}`;
    });
    const quantity=/(?<![\d/.,])(\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])(?=\s*(?:(?:мл|кг|г|л|см)(?![\p{L}\p{N}])|шт\.?|ст\.?\s*л|ч\.?\s*л|пуч\p{L}*|веточ\p{L}*|кусоч\p{L}*|упак\p{L}*))/gu;
    return pluralized.replace(quantity,(match,raw,index,whole)=>/(?:бан\p{L}*|упак\p{L}*)\s+по\s*$/iu.test(whole.slice(Math.max(0,index-20),index))?match:numeric(raw))
  }
  function loadJSON(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
  function saveChoice(choice){localStorage.setItem(choiceKey(state.week),JSON.stringify(choice))}
  function current(){return data.weeks[state.week]}
  function currentChoice(){return loadJSON(choiceKey(state.week),{recipes:{},ingredients:{},excluded:{}})}
  function renderSwitch(){
    $('#weekSwitch').innerHTML=[1,2,3].map(n=>`<button class="week-btn ${n===state.week?'active':''}" data-week="${n}" aria-pressed="${n===state.week}">Неделя 0${n}</button>`).join('');
    $$('[data-week]').forEach(b=>b.onclick=()=>{state.week=+b.dataset.week;render()})
  }
  function renderIntro(){
    const w=current(),days=w.days.length,total=w.days.reduce((a,d)=>a+d.meals.length,0);
    const art=state.week===1?'cod.jpg':state.week===2?'chicken.jpg':'cover.jpg';
    const mealWord=total%10===1&&total%100!==11?'блюдо':total%10>=2&&total%10<=4&&!(total%100>=12&&total%100<=14)?'блюда':'блюд';
    $('#weekIntro').innerHTML=`<div><h2>${weekNames[state.week]}</h2></div><div class="week-visual"><img src="${art}" alt="Иллюстрация к меню недели"></div>`;
    $('#recipeCount').textContent=total;
    const baseCount=w.groceries.reduce((a,g)=>a+g.items.length,0),choice=currentChoice();
    const picked=Object.keys(choice.recipes).filter(k=>choice.recipes[k]).length+Object.keys(choice.ingredients).filter(k=>choice.ingredients[k]).length;
    $('#shoppingCount').textContent=baseCount
  }
  function renderMenu(){
    const rows=current().days.map((d,di)=>`<tr><td>${esc(d.name)}</td>${['Завтрак','Обед','Ужин'].map(slot=>{const m=d.meals.find(x=>x.slot===slot);const mi=m?d.meals.indexOf(m):-1;return `<td>${m?`<a class="meal-link" href="#recipe-${state.week}-${di}-${mi}" data-jump="${state.week}-${di}-${mi}"><small>${slot}</small>${esc(m.title)}</a>`:'—'}</td>`}).join('')}</tr>`).join('');
    $('#menuGrid').innerHTML=rows;
    $$('[data-jump]').forEach(a=>a.onclick=e=>{e.preventDefault();state.view='recipes';renderView();setTimeout(()=>{const el=$('#recipe-'+a.dataset.jump);if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'center'})}},50)})
  }
  function ingredientId(di,mi,ii){return `${state.week}-${di}-${mi}-${ii}`}
  function renderRecipes(){
    const q=state.query.toLowerCase().trim(),choice=currentChoice();
    $('#recipeDays').innerHTML=current().days.map((d,di)=>{
      const cards=d.meals.map((m,mi)=>{
        if(q&&!m.title.toLowerCase().includes(q)&&!m.ingredients.join(' ').toLowerCase().includes(q))return '';
        const recipeId=`${state.week}-${di}-${mi}`,recipeSelected=!!choice.recipes[recipeId],servings=m.portionBase*state.people;
        const ingredients=m.ingredients.flatMap((item,ii)=>splitIngredient(item).map((part,si)=>{
          const id=`${ingredientId(di,mi,ii)}-${si}`,checked=(recipeSelected&&!choice.excluded[id])||!!choice.ingredients[id];
          return `<label class="recipe-ingredient ${checked?'is-selected':''}"><input type="checkbox" data-ingredient="${id}" ${checked?'checked':''}><span>${esc(scaleText(part,state.people))}</span></label>`
        })).join('');
        const source=m.source?`<p class="recipe-origin">Эта порция — из <a href="#recipe-${m.source.week}-${m.source.day}-${m.source.meal}" data-source-id="${m.source.week}-${m.source.day}-${m.source.meal}" data-source-week="${m.source.week}">${esc(m.source.label)}</a>. Если готовой порции нет, открой источник и приготовь по нему одну порцию; готовые веса смотри в списке ингредиентов.</p>`:'';
        const prepSource=m.prepSource?'<p class="recipe-origin">'+esc(m.prepSource.label)+' — <a href="#'+esc(m.prepSource.id)+'" data-prep-source="'+esc(m.prepSource.id)+'">открыть шаг заготовки</a>.</p>':'';
        return `<details class="recipe-card ${recipeSelected?'recipe-picked':''}" id="recipe-${recipeId}"><summary><span class="slot">${esc(m.slot)}</span><span class="recipe-name">${esc(m.title)}</span><span class="recipe-meta">${esc(m.time)}</span><span class="chevron" aria-hidden="true"></span></summary><div class="recipe-actions"><button class="add-recipe ${recipeSelected?'selected':''}" data-recipe="${recipeId}" aria-pressed="${recipeSelected}">${recipeSelected?'✓ Ингредиенты добавлены':'＋ Добавить ингредиенты в покупки'}</button></div><div class="recipe-body"><div class="recipe-badges"><span>${servings} ${plural(servings,'порция','порции','порций')}${m.slot==='Ужин'?' (ужин + обед)':''}</span></div>${source}${prepSource}<div class="recipe-columns"><div><h4>Ингредиенты <small>отметь нужные</small></h4><div class="recipe-ingredients">${ingredients}</div></div><div><h4>Приготовление</h4><ol>${m.steps.map(x=>`<li>${esc(scaleText(x,state.people))}</li>`).join('')}</ol>${m.notes.length?`<div class="recipe-notes">${m.notes.map(x=>`<p>${esc(scaleText(x,state.people))}</p>`).join('')}</div>`:''}</div></div></div></details>`
      }).join('');
      const n=d.nutrition?'<p class="day-nutrition">На 1 человека · ≈ '+d.nutrition.kcal+' ккал · Б '+d.nutrition.protein+' г · Ж '+d.nutrition.fat+' г · У '+d.nutrition.carbs+' г</p>':'';return cards?`<article class="day-group"><div class="day-title"><h3>${esc(d.name)}</h3><span>${d.meals.length} блюда</span></div>${n}<div class="recipe-list">${cards}</div></article>`:''
    }).join('')||'<div class="empty-search">Ничего не нашлось. Попробуй другое название или ингредиент.</div>';
    $$('[data-source-id]').forEach(a=>a.onclick=e=>{e.preventDefault();state.week=+a.dataset.sourceWeek;state.query='';document.querySelector('#recipeSearch').value='';state.view='recipes';render();setTimeout(()=>{const el=$('#recipe-'+a.dataset.sourceId);if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'center'})}},50)});
    $$('[data-prep-source]').forEach(a=>a.onclick=e=>{e.preventDefault();state.view='prep';renderView();const el=document.getElementById(a.dataset.prepSource);if(el){for(let p=el;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;el.scrollIntoView({behavior:'smooth',block:'center'})}});
    $$('[data-recipe]').forEach(button=>button.onclick=()=>{
      const choice=currentChoice(),id=button.dataset.recipe;
      if(choice.recipes[id])delete choice.recipes[id];else choice.recipes[id]=true;
      saveChoice(choice);
      const selected=!!choice.recipes[id],card=button.closest('.recipe-card');
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);button.textContent=selected?'✓ Ингредиенты добавлены':'＋ Добавить ингредиенты в покупки';card.classList.toggle('recipe-picked',selected);
      card.querySelectorAll('[data-ingredient]').forEach(input=>{const ingredient=input.dataset.ingredient,checked=(selected&&!choice.excluded[ingredient])||!!choice.ingredients[ingredient];input.checked=checked;input.closest('.recipe-ingredient').classList.toggle('is-selected',checked)});
      renderGroceries();renderIntro()
    });
    $$('[data-ingredient]').forEach(input=>input.onchange=()=>{
      const choice=currentChoice(),id=input.dataset.ingredient,selectedRecipe=choice.recipes[id.split('-').slice(0,3).join('-')];
      if(selectedRecipe){if(input.checked)delete choice.excluded[id];else choice.excluded[id]=true}
      else if(input.checked)choice.ingredients[id]=true;else delete choice.ingredients[id];
      saveChoice(choice);input.closest('.recipe-ingredient').classList.toggle('is-selected',input.checked);renderGroceries();renderIntro()
    })
  }
  function normalizeName(text){
    let name=String(text).split(/[—–]/)[0].toLowerCase().replace(/\([^)]*\)/g,' ').replace(/\b(?:готов\w*|отварн\w*|запеч\w*|обжаренн\w*|приготовленн\w*)\b/gu,' ').replace(/[0-9.,½¼¾⅓⅔]+/g,' ').replace(/[^\p{L}\s-]/gu,' ').replace(/\s+/g,' ').trim();
    const aliases=[[/курин(ое|ая|ый)\s+(филе|грудка)/,'курица'],[/филе\s+курин(ое|ой)/,'курица'],[/яйца?/,'яйцо'],[/огурц(ы|а)/,'огурец'],[/томаты?/,'томат'],[/шампиньоны?/,'шампиньон'],[/грецкие\s+орехи?/,'грецкий орех'],[/масло\s+оливковое/,'оливковое масло']];
    for(const [pattern,replacement] of aliases)name=name.replace(pattern,replacement);
    return name
  }
  function selectedIngredients(){
    const choice=currentChoice(),out=[];
    current().days.forEach((day,di)=>day.meals.forEach((meal,mi)=>{
      const rid=`${state.week}-${di}-${mi}`,recipeSelected=!!choice.recipes[rid];
      meal.ingredients.forEach((item,ii)=>splitIngredient(item).forEach((part,si)=>{const id=`${ingredientId(di,mi,ii)}-${si}`,selected=(recipeSelected&&!choice.excluded[id])||!!choice.ingredients[id];if(selected)out.push({id,item:part,recipe:meal.title,day:day.name,name:normalizeName(part)})}))
    }));
    return out
  }
  function groceryMatches(item,selectedName){
    const groceryName=normalizeName(item);
    return groceryName===selectedName||groceryName.includes(selectedName)||selectedName.includes(groceryName)
  }
  function renderGroceries(){
    const w=current(),key=checkedKey(state.week,state.people),checked=loadJSON(key,{}),selected=selectedIngredients(),selectionChecks=loadJSON(selectionKey(state.week,state.people),{});
    $('#listSummary').innerHTML=`<strong>Список на ${state.people} ${peopleWord(state.people)}</strong><span>количества × ${state.people} от базового плана · <button class="quiet-button" id="clearChecks">Снять отметки</button></span>`;
    $('#clearChecks').onclick=()=>{localStorage.removeItem(key);localStorage.removeItem(selectionKey(state.week,state.people));renderGroceries()};
    $('#selectedShopping').innerHTML=selected.length?`<div class="selected-shopping-head"><div><p class="eyebrow">ТВОЙ ВЫБОР</p><h3>Ингредиенты выбранных рецептов <span>${selected.length}</span></h3></div><button class="quiet-button" id="clearSelection">Очистить выбор</button></div><p class="selected-note">Эти продукты добавлены сюда автоматически. Совпадения также подсвечены в общем списке ниже.</p><div class="selected-items">${selected.map(item=>`<label class="selected-item ${selectionChecks[item.id]?'checked':''}"><input type="checkbox" data-selected-check="${item.id}" ${selectionChecks[item.id]?'checked':''}><span><strong>${esc(scaleText(item.item,state.people))}</strong><small>${esc(item.day)} · ${esc(item.recipe)}</small></span></label>`).join('')}</div>`:'';
    const clearSelection=$('#clearSelection');if(clearSelection)clearSelection.onclick=()=>{localStorage.removeItem(choiceKey(state.week));localStorage.removeItem(selectionKey(state.week,state.people));renderRecipes();renderGroceries();renderIntro()};
    $$('[data-selected-check]').forEach(input=>input.onchange=()=>{selectionChecks[input.dataset.selectedCheck]=input.checked;localStorage.setItem(selectionKey(state.week,state.people),JSON.stringify(selectionChecks));input.closest('.selected-item').classList.toggle('checked',input.checked)});
    $('#groceryGroups').innerHTML=w.groceries.map((g,gi)=>`<details class="grocery-group" open><summary>${esc(g.name)} <span>${g.items.length} позиций</span></summary><div class="grocery-items">${g.items.map((it,ii)=>{const id=gi+'-'+ii,matching=selected.filter(x=>groceryMatches(it,x.name));return `<label class="check-item ${checked[id]?'checked':''} ${matching.length?'recipe-match':''}"><input type="checkbox" data-id="${id}" ${checked[id]?'checked':''}><span>${esc(scaleText(it,state.people))}${matching.length?`<small class="match-label">Выбранный рецепт${matching.length>1?'ы':''}: ${matching.map(m=>esc(m.recipe)).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}</small>`:''}</span></label>`}).join('')}</div></details>`).join('');
    $$('#groceryGroups input').forEach(c=>c.onchange=()=>{checked[c.dataset.id]=c.checked;localStorage.setItem(key,JSON.stringify(checked));c.closest('.check-item').classList.toggle('checked',c.checked)})
  }
  function renderPrep(){
    const blocks=current().prepBlocks||[];
    $('#prepBlocks').innerHTML=blocks.map((b,i)=>{
      let group='',groups=[],content=[];
      const flush=()=>{
        if(content.length)groups.push(`<details class="prep-subgroup" ${groups.length===0?'open':''}><summary>${esc(group||'Подготовка')}</summary><div class="prep-subgroup-body">${content.join('')}</div></details>`);
        group='';content=[];
      };
      b.items.forEach(x=>{
        if(x.style==='HEADING_4'){flush();group=x.text;return}
        const text=x.text.replace(/^•\s*/,'');
        const step=text.match(/^(\d+)\.\s*(.*)$/s);
        const id=x.id?` id="${esc(x.id)}"`:'';
        content.push(step?`<div class="prep-step"${id}><span>${step[1]}</span><p>${esc(scaleText(step[2],state.people))}</p></div>`:text.startsWith('•')?`<p class="prep-ingredient"${id}>${esc(scaleText(text.slice(1).trim(),state.people))}</p>`:`<p${id}>${esc(scaleText(text,state.people))}</p>`);
      });
      flush();
      return `<details class="prep-block" ${i===0?'open':''}><summary>${esc(b.title)}</summary><div class="prep-lines">${groups.join('')}</div></details>`;
    }).join('');
  }
  function renderEntries(entries){return entries.map(x=>x.style.startsWith('HEADING')?`<h4>${esc(x.text)}</h4>`:x.style==='SUBTITLE'?`<p class="front-subtitle">${esc(x.text)}</p>`:`<p>${esc(x.text)}</p>`).join('')}
  function renderIntroContent(){
    const entries=data.frontmatter||[],safetyStart=entries.findIndex(x=>x.style.startsWith('HEADING')&&x.text.includes('безопасност'));
    const koreanStart=entries.findIndex(x=>x.style.startsWith('HEADING')&&x.text.includes('Корейская кухня'));
    const howtoStart=entries.findIndex(x=>x.style.startsWith('HEADING')&&x.text.includes('Как пользоваться'));
    const howtoEnd=entries.findIndex((x,i)=>i>howtoStart&&x.style.startsWith('HEADING'));
    const koreanEnd=howtoStart;
    const safetyEnd=entries.findIndex((x,i)=>i>safetyStart&&x.style.startsWith('HEADING'));
    const safety=entries.slice(safetyStart,safetyEnd<0?entries.length:safetyEnd);
    const rest=entries.filter((_,i)=>![0,1].includes(i)&&!(i>=safetyStart&&(safetyEnd<0||i<safetyEnd))&&!(i>=koreanStart&&i<koreanEnd)&&!(i>=howtoStart&&(howtoEnd<0||i<howtoEnd)));
    $('#introContent').innerHTML=renderEntries(entries.slice(koreanStart,howtoStart));
    $('#howtoContent').innerHTML=renderEntries(entries.slice(howtoStart,howtoEnd<0?entries.length:howtoEnd));
    $('#frontmatterContent').innerHTML=renderEntries(rest);
    $('#safetyContent').innerHTML=renderEntries(safety.filter(x=>x.style!=='TITLE'&&x.style!=='SUBTITLE'));
    const sourceLink=$('#sourceLink');if(sourceLink)sourceLink.href=data.source||'#'
  }
  function renderView(){
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===state.view));
    $$('.view-tab').forEach(v=>{v.classList.toggle('active',v.dataset.view===state.view);v.setAttribute('aria-pressed',v.dataset.view===state.view)});
    $$('.topnav a').forEach(v=>v.classList.toggle('current',v.dataset.view===state.view));
    history.replaceState(null,'','#'+state.view)
  }
  function render(){renderSwitch();renderIntro();renderMenu();renderRecipes();renderGroceries();renderPrep();renderIntroContent();renderView()}
  $$('.view-tab').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;renderView()});
  $$('.topnav a').forEach(a=>a.onclick=e=>{e.preventDefault();state.view=a.dataset.view;renderView();document.querySelector('#'+state.view).scrollIntoView({behavior:'smooth'})});
  peopleSelect.onchange=()=>{state.people=+peopleSelect.value;render()};
  $('#recipeSearch').oninput=e=>{state.query=e.target.value;renderRecipes()};
  $('#toggleRecipes').onclick=()=>{state.expanded=!state.expanded;$('#toggleRecipes').textContent=state.expanded?'Свернуть все':'Развернуть все';renderRecipes()};
  const initial=location.hash.slice(1);if(['menu','shopping','prep','recipes'].includes(initial))state.view=initial;
  render()
})();
