(()=>{
  'use strict';
  const data=window.MENU_BOOK;
  const state={week:1,people:1,view:'menu',query:'',expanded:false};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const weekNames={1:'Первая неделя',2:'Вторая неделя',3:'Третья неделя'};
  const peopleSelect=$('#peopleSelect');
  const fractions={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3};
  const choiceKey=week=>`seasonka-choice-${week}`;
  const checkedKey=(week,people)=>`seasonka-week-${week}-people-${people}`;
  const selectionKey=(week,people)=>`seasonka-selected-${week}-people-${people}`;
  function scaleText(text,people){
    if(people===1)return text;
    const quantity=/(?<![\d/.,])(\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])(?=\s*(?:(?:мл|кг|г|л|см|бан)(?![\p{L}\p{N}])|шт\.?|ст\.?\s*л|ч\.?\s*л|порци|зубчик|пуч|веточ|кусоч|упак))/gu;
    return text.replace(quantity,raw=>{const [n,d='1']=raw.replace(',','.').split('/');const value=fractions[raw]??Number(n)/Number(d);return String(Math.round(value*people*10)/10).replace('.',',')})
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
    $('#weekIntro').innerHTML=`<div><h2>${weekNames[state.week]}</h2><p>${days} дней · ${total} ${mealWord} · список покупок на ${state.people} ${state.people===1?'человека':'человек'}</p></div><div class="week-visual"><img src="${art}" alt="Иллюстрация к меню недели"><span class="week-tag">домашняя кухня + корейские акценты</span></div>`;
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
        const ingredients=m.ingredients.map((item,ii)=>{
          const id=ingredientId(di,mi,ii),checked=(recipeSelected&&!choice.excluded[id])||!!choice.ingredients[id];
          return `<label class="recipe-ingredient ${checked?'is-selected':''}"><input type="checkbox" data-ingredient="${id}" ${checked?'checked':''}><span>${esc(scaleText(item,state.people))}</span></label>`
        }).join('');
        return `<details class="recipe-card ${recipeSelected?'recipe-picked':''}" id="recipe-${recipeId}"><summary><span class="slot">${esc(m.slot)}</span><span class="recipe-name">${esc(m.title)}</span><span class="recipe-meta">${esc(m.time)}</span><span class="chevron">⌄</span></summary><div class="recipe-actions"><button class="add-recipe ${recipeSelected?'selected':''}" data-recipe="${recipeId}" aria-pressed="${recipeSelected}">${recipeSelected?'✓ Добавлено в покупки':'＋ Добавить рецепт в покупки'}</button></div><div class="recipe-body"><div class="recipe-badges"><span>${servings} ${m.slot==='Ужин'?'порции (ужин + обед)':'порц.'}</span><span>база × ${state.people}</span><span>${esc(m.time)}</span></div><div class="recipe-columns"><div><h4>Ингредиенты <small>отметь нужные</small></h4><div class="recipe-ingredients">${ingredients}</div></div><div><h4>Приготовление</h4><ol>${m.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${m.notes.length?`<div class="recipe-notes">${m.notes.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}</div></div></div></details>`
      }).join('');
      return cards?`<article class="day-group"><div class="day-title"><h3>${esc(d.name)}</h3><span>${d.meals.length} блюда</span></div><div class="recipe-list">${cards}</div></article>`:''
    }).join('')||'<div class="empty-search">Ничего не нашлось. Попробуй другое название или ингредиент.</div>';
    $$('[data-recipe]').forEach(button=>button.onclick=()=>{
      const choice=currentChoice(),id=button.dataset.recipe;
      if(choice.recipes[id])delete choice.recipes[id];else choice.recipes[id]=true;
      saveChoice(choice);
      const selected=!!choice.recipes[id],card=button.closest('.recipe-card');
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);button.textContent=selected?'✓ Добавлено в покупки':'＋ Добавить рецепт в покупки';card.classList.toggle('recipe-picked',selected);
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
    let name=String(text).split(/[—–]/)[0].toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[0-9.,½¼¾⅓⅔]+/g,' ').replace(/[^\p{L}\s-]/gu,' ').replace(/\s+/g,' ').trim();
    const aliases=[[/курин(ое|ая|ый)\s+(филе|грудка)/,'курица'],[/филе\s+курин(ое|ой)/,'курица'],[/яйца?/,'яйцо'],[/огурц(ы|а)/,'огурец'],[/томаты?/,'томат'],[/шампиньоны?/,'шампиньон'],[/грецкие\s+орехи?/,'грецкий орех'],[/масло\s+оливковое/,'оливковое масло']];
    for(const [pattern,replacement] of aliases)name=name.replace(pattern,replacement);
    return name
  }
  function selectedIngredients(){
    const choice=currentChoice(),out=[];
    current().days.forEach((day,di)=>day.meals.forEach((meal,mi)=>{
      const rid=`${state.week}-${di}-${mi}`,recipeSelected=!!choice.recipes[rid];
      meal.ingredients.forEach((item,ii)=>{const id=ingredientId(di,mi,ii),selected=(recipeSelected&&!choice.excluded[id])||!!choice.ingredients[id];if(selected)out.push({id,item,recipe:meal.title,day:day.name,name:normalizeName(item)})})
    }));
    return out
  }
  function groceryMatches(item,selectedName){
    const groceryName=normalizeName(item);
    return groceryName===selectedName||groceryName.includes(selectedName)||selectedName.includes(groceryName)
  }
  function renderGroceries(){
    const w=current(),key=checkedKey(state.week,state.people),checked=loadJSON(key,{}),selected=selectedIngredients(),selectionChecks=loadJSON(selectionKey(state.week,state.people),{});
    $('#listSummary').innerHTML=`<strong>Список на ${state.people} ${state.people===1?'человека':'человек'}</strong><span>количества × ${state.people} от базового плана · <button class="quiet-button" id="clearChecks">Снять отметки</button></span>`;
    $('#clearChecks').onclick=()=>{localStorage.removeItem(key);localStorage.removeItem(selectionKey(state.week,state.people));renderGroceries()};
    $('#selectedShopping').innerHTML=selected.length?`<div class="selected-shopping-head"><div><p class="eyebrow">ТВОЙ ВЫБОР</p><h3>Ингредиенты выбранных рецептов <span>${selected.length}</span></h3></div><button class="quiet-button" id="clearSelection">Очистить выбор</button></div><p class="selected-note">Эти продукты добавлены сюда автоматически. Совпадения также подсвечены в общем списке ниже.</p><div class="selected-items">${selected.map(item=>`<label class="selected-item ${selectionChecks[item.id]?'checked':''}"><input type="checkbox" data-selected-check="${item.id}" ${selectionChecks[item.id]?'checked':''}><span><strong>${esc(scaleText(item.item,state.people))}</strong><small>${esc(item.day)} · ${esc(item.recipe)}</small></span></label>`).join('')}</div>`:'';
    const clearSelection=$('#clearSelection');if(clearSelection)clearSelection.onclick=()=>{localStorage.removeItem(choiceKey(state.week));localStorage.removeItem(selectionKey(state.week,state.people));renderRecipes();renderGroceries();renderIntro()};
    $$('[data-selected-check]').forEach(input=>input.onchange=()=>{selectionChecks[input.dataset.selectedCheck]=input.checked;localStorage.setItem(selectionKey(state.week,state.people),JSON.stringify(selectionChecks));input.closest('.selected-item').classList.toggle('checked',input.checked)});
    $('#groceryGroups').innerHTML=w.groceries.map((g,gi)=>`<details class="grocery-group" open><summary>${esc(g.name)} <span>${g.items.length} позиций</span></summary><div class="grocery-items">${g.items.map((it,ii)=>{const id=gi+'-'+ii,matching=selected.filter(x=>groceryMatches(it,x.name));return `<label class="check-item ${checked[id]?'checked':''} ${matching.length?'recipe-match':''}"><input type="checkbox" data-id="${id}" ${checked[id]?'checked':''}><span>${esc(scaleText(it,state.people))}${matching.length?`<small class="match-label">Выбранный рецепт${matching.length>1?'ы':''}: ${matching.map(m=>esc(m.recipe)).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}</small>`:''}</span></label>`}).join('')}</div></details>`).join('');
    $$('#groceryGroups input').forEach(c=>c.onchange=()=>{checked[c.dataset.id]=c.checked;localStorage.setItem(key,JSON.stringify(checked));c.closest('.check-item').classList.toggle('checked',c.checked)})
  }
  function renderPrep(){const blocks=current().prepBlocks||[];$('#prepBlocks').innerHTML=blocks.map((b,i)=>`<details class="prep-block" ${i===0?'open':''}><summary>${esc(b.title)}</summary><div class="prep-lines">${b.items.map(x=>{if(x.style.startsWith('HEADING'))return `<h5>${esc(x.text)}</h5>`;const text=x.text.replace(/^•\s*/,'');const step=text.match(/^(\d+)\.\s*(.*)$/s);return step?`<div class="prep-step"><span>${step[1]}</span><p>${esc(step[2])}</p></div>`:`<p>${esc(text)}</p>`}).join('')}</div></details>`).join('')}
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
    $('#sourceLink').href=data.source||'#'
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
  const initial=location.hash.slice(1);if(['menu','recipes','shopping'].includes(initial))state.view=initial;
  render()
})();
