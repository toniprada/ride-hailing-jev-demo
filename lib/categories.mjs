import rubric from './rubric.json' with {type:'json'};
const names={commuting:'Commuting',business:'Business',leisure:'Leisure or social',event_attendance:'Event attendance',visitor_activity:'Attraction',shopping:'Shopping',other:'Other',transport_connection:'Airport or intercity transfer'};
export const defaultCategories=Object.entries(rubric.demo_purpose.criteria).map(([id,description])=>({id,label:names[id],description}));
export function validateCategories(value=defaultCategories){
 if(!Array.isArray(value)||value.length<2||value.length>20)throw Error('Use between 2 and 20 categories.');
 const ids=new Set(),labels=new Set();return value.map(c=>{
 if(!c||typeof c.id!=='string'||!/^[a-zA-Z][a-zA-Z0-9_]{0,47}$/.test(c.id)||['__proto__','prototype','constructor'].includes(c.id)||ids.has(c.id))throw Error('Each category needs a unique valid identifier.');
 if(typeof c.label!=='string'||!c.label.trim()||c.label.trim().length>64||typeof c.description!=='string'||!c.description.trim()||c.description.trim().length>600)throw Error('Each category needs a name (1–64 characters) and description (1–600).');
 const label=c.label.trim(),key=label.normalize('NFKC').toLocaleLowerCase();if(labels.has(key))throw Error('Category names must be unique.');ids.add(c.id);labels.add(key);return{id:c.id,label,description:c.description.trim()};
 });
}
